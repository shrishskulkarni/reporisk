/**
 * Trust Boundary Synthesis Engine
 * Identifies architectural trust boundaries, security perimeters, and isolation domains.
 *
 * Epistemic Classification: DESIGN DECISION / HEURISTIC
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TrustBoundary, EntryPoint, DetectedFramework } from '../types/topology.js';

export function synthesizeTrustBoundaries(
  workspaceRoot: string,
  entryPoints: readonly EntryPoint[],
  frameworks: readonly DetectedFramework[],
  scannedFiles: readonly string[]
): TrustBoundary[] {
  const boundaries: TrustBoundary[] = [];

  // 1. Network Perimeter (Public Ingress Boundary)
  const publicRoutes = entryPoints.filter((ep) => ep.exposure === 'PUBLIC_INGRESS');
  if (publicRoutes.length > 0) {
    boundaries.push({
      id: 'tb-network-perimeter',
      name: 'Public Ingress Perimeter',
      boundaryType: 'NETWORK_PERIMETER',
      description: 'Publicly reachable HTTP/API route entry points exposed without authentication barriers.',
      components: publicRoutes.map((ep) => `${ep.file}:${ep.line} (${ep.method} ${ep.routePath ?? ''})`)
    });
  }

  // 2. Authentication Gateway Boundary
  const authRoutes = entryPoints.filter((ep) => ep.exposure === 'AUTHENTICATED');
  const authFiles = scannedFiles.filter((f) => {
    const lower = f.toLowerCase();
    return (
      lower.includes('auth') ||
      lower.includes('middleware/jwt') ||
      lower.includes('security') ||
      lower.includes('passport')
    );
  });

  if (authRoutes.length > 0 || authFiles.length > 0) {
    boundaries.push({
      id: 'tb-auth-gateway',
      name: 'Authentication & Session Gateway',
      boundaryType: 'AUTH_GATEWAY',
      description: 'Security controls and routes enforcing credential verification and token decoding.',
      components: [
        ...authRoutes.map((ep) => `Route: ${ep.file}:${ep.line} (${ep.routePath ?? ''})`),
        ...authFiles.slice(0, 10).map((f) => `Module: ${f}`)
      ]
    });
  }

  // 3. Database Isolation Boundary
  const ormFrameworks = frameworks.filter((fw) => fw.category === 'ORM');
  const dbFiles = scannedFiles.filter((f) => {
    const lower = f.toLowerCase();
    return (
      lower.includes('prisma/schema.prisma') ||
      lower.includes('migrations/') ||
      lower.includes('database.ts') ||
      lower.includes('db.py') ||
      lower.includes('models.py')
    );
  });

  if (ormFrameworks.length > 0 || dbFiles.length > 0) {
    boundaries.push({
      id: 'tb-database-isolation',
      name: 'Database Persistence Perimeter',
      boundaryType: 'DATABASE_ISOLATION',
      description: 'Persistent data tier, ORM interfaces, and SQL query execution sinks.',
      components: [
        ...ormFrameworks.map((fw) => `ORM: ${fw.name} (${fw.manifestFile})`),
        ...dbFiles.slice(0, 10).map((f) => `Schema/Config: ${f}`)
      ]
    });
  }

  // 4. CI/CD Runner Execution Boundary
  const ciFiles = scannedFiles.filter((f) => f.startsWith('.github/workflows/'));
  if (ciFiles.length > 0) {
    const workflowSummary: string[] = [];

    for (const file of ciFiles) {
      try {
        const content = readFileSync(join(workspaceRoot, file), 'utf8');
        const hasIdToken = /id-token\s*:\s*write/i.test(content);
        const hasWriteAll = /permissions\s*:\s*write-all/i.test(content);
        const note = hasWriteAll ? ' [CRITICAL: write-all]' : hasIdToken ? ' [OIDC id-token:write]' : '';
        workflowSummary.push(`${file}${note}`);
      } catch {
        workflowSummary.push(file);
      }
    }

    boundaries.push({
      id: 'tb-ci-runner',
      name: 'CI/CD Pipeline Runner Environment',
      boundaryType: 'CI_RUNNER',
      description: 'Continuous integration execution contexts with access to build secrets and deployment environments.',
      components: workflowSummary
    });
  }

  return boundaries;
}
