/**
 * Entry Point Discovery Engine
 * Scans code files statically to identify route handlers, API endpoints, and ingress interfaces.
 *
 * Epistemic Classification: FACT / HEURISTIC Exposure
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EntryPoint } from '../types/topology.js';

interface RoutePattern {
  readonly framework: string;
  readonly regex: RegExp;
  readonly methodGroup: number;
  readonly pathGroup: number;
}

const ROUTE_PATTERNS: readonly RoutePattern[] = [
  // Express / Fastify / Koa: app.get('/api/users', ...), router.post('/login', ...)
  {
    framework: 'Express/Node',
    regex: /(?:app|router|server|fastify)\.(get|post|put|delete|patch|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]/i,
    methodGroup: 1,
    pathGroup: 2
  },
  // Python FastAPI / Flask: @app.get("/users"), @router.post("/items")
  {
    framework: 'FastAPI/Flask',
    regex: /@(?:app|router|api|bp)\.(get|post|put|delete|patch|route)\s*\(\s*['"`]([^'"`]+)['"`]/i,
    methodGroup: 1,
    pathGroup: 2
  },
  // Go Gin / Echo: r.GET("/ping", ...), e.POST("/users", ...)
  {
    framework: 'Go Web',
    regex: /(?:r|router|e|g|api)\.(GET|POST|PUT|DELETE|PATCH|HEAD)\s*\(\s*['"`]([^'"`]+)['"`]/,
    methodGroup: 1,
    pathGroup: 2
  }
];

const AUTH_KEYWORDS = [
  'auth',
  'jwt',
  'token',
  'bearer',
  'session',
  'login',
  'protect',
  'guard',
  'authenticated',
  'depends(get_current_user)',
  'login_required',
  'passport',
  'authorize',
  'verifytoken'
];

/**
 * Distinguishes documentation and test artifacts from runtime application code.
 */
function isDocOrTestArtifact(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.startsWith('docs/') ||
    normalized.includes('/docs/') ||
    normalized.startsWith('test/') ||
    normalized.includes('/test/') ||
    normalized.startsWith('tests/') ||
    normalized.includes('/tests/') ||
    normalized.endsWith('.test.ts') ||
    normalized.endsWith('.test.js') ||
    normalized.endsWith('.test.tsx') ||
    normalized.endsWith('.test.jsx') ||
    normalized.endsWith('.spec.ts') ||
    normalized.endsWith('.spec.js') ||
    normalized.endsWith('.spec.tsx') ||
    normalized.endsWith('.spec.jsx') ||
    normalized.endsWith('.md')
  );
}

/**
 * Checks if a code line or its enclosing context suggests authentication requirements.
 */
function isAuthProtected(line: string, surroundingLines: readonly string[]): boolean {
  const combined = (line + ' ' + surroundingLines.join(' ')).toLowerCase();
  return AUTH_KEYWORDS.some((kw) => combined.includes(kw));
}

/**
 * Scans candidate source files to locate route handlers and entry points.
 */
export function scanEntryPoints(
  workspaceRoot: string,
  scannedFiles: readonly string[]
): EntryPoint[] {
  const entryPoints: EntryPoint[] = [];
  const candidateExtensions = new Set(['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.rs', '.java', '.rb', '.php']);

  // Filter candidates, strictly excluding test suites and documentation
  const candidateFiles = scannedFiles.filter((f) => {
    if (isDocOrTestArtifact(f)) return false;
    const ext = f.slice(f.lastIndexOf('.')).toLowerCase();
    return candidateExtensions.has(ext);
  });

  for (const relFile of candidateFiles) {
    let content: string;
    try {
      content = readFileSync(join(workspaceRoot, relFile), 'utf8');
    } catch {
      continue;
    }

    // Next.js App Router convention: app/api/.../route.ts
    if (relFile.includes('app/api/') && (relFile.endsWith('route.ts') || relFile.endsWith('route.js'))) {
      const routePath = '/' + relFile.slice(relFile.indexOf('app/api/'), relFile.lastIndexOf('/route.'));
      entryPoints.push({
        id: `ep-${relFile}-route`,
        file: relFile,
        line: 1,
        routePath,
        method: 'ANY',
        exposure: relFile.toLowerCase().includes('auth') ? 'AUTHENTICATED' : 'PUBLIC_INGRESS',
        framework: 'Next.js App Router'
      });
      continue;
    }

    // Next.js Pages Router convention: pages/api/...
    if (relFile.includes('pages/api/') && (relFile.endsWith('.ts') || relFile.endsWith('.js'))) {
      const routePath = '/' + relFile.slice(relFile.indexOf('pages/api/')).replace(/\.[^/.]+$/, '');
      entryPoints.push({
        id: `ep-${relFile}-pages-api`,
        file: relFile,
        line: 1,
        routePath,
        method: 'ANY',
        exposure: relFile.toLowerCase().includes('auth') ? 'AUTHENTICATED' : 'PUBLIC_INGRESS',
        framework: 'Next.js Pages Router'
      });
      continue;
    }

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const trimmed = line.trim();

      // Skip commented-out routes and docstring/block-comment lines
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('<!--')
      ) {
        continue;
      }

      for (const pattern of ROUTE_PATTERNS) {
        const match = pattern.regex.exec(line);
        if (match) {
          // Verify match is not preceded by an inline comment on the same line
          const slashIdx = line.indexOf('//');
          const hashIdx = line.indexOf('#');
          if (
            (slashIdx !== -1 && slashIdx < match.index) ||
            (hashIdx !== -1 && hashIdx < match.index)
          ) {
            continue;
          }

          const rawMethod = match[pattern.methodGroup]?.toUpperCase() ?? 'ANY';
          const routePath = match[pattern.pathGroup] ?? '/';

          // Extract surrounding 3 lines before and after for context
          const start = Math.max(0, i - 2);
          const end = Math.min(lines.length, i + 3);
          const contextLines = lines.slice(start, end);

          const isProtected = isAuthProtected(line, contextLines);
          const isInternal = routePath.startsWith('/internal') || routePath.startsWith('/private') || routePath.startsWith('/admin/internal');

          const exposure = isInternal
            ? 'INTERNAL'
            : isProtected
              ? 'AUTHENTICATED'
              : 'PUBLIC_INGRESS';

          entryPoints.push({
            id: `ep-${relFile}:${i + 1}`,
            file: relFile,
            line: i + 1,
            routePath,
            method: rawMethod,
            exposure,
            framework: pattern.framework
          });
          break;
        }
      }
    }
  }

  return entryPoints;
}
