import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  scanLanguages,
  scanFrameworks,
  scanEntryPoints,
  synthesizeTrustBoundaries,
  discoverTopology
} from '../src/index.js';

describe('Topology Discovery Engine', () => {
  const workspaceRoot = process.cwd();

  it('scans workspace languages and computes file counts and percentages', () => {
    const result = scanLanguages(workspaceRoot);
    expect(result.totalFiles).toBeGreaterThan(0);
    expect(result.totalBytes).toBeGreaterThan(0);
    expect(result.languages.length).toBeGreaterThan(0);

    const tsLang = result.languages.find((l) => l.name === 'TypeScript');
    expect(tsLang).toBeDefined();
    expect(tsLang!.fileCount).toBeGreaterThan(0);
    expect(tsLang!.percentage).toBeGreaterThan(0);

    // Verify percentages sum to <= 100
    const totalPercentage = result.languages.reduce((acc, l) => acc + l.percentage, 0);
    expect(totalPercentage).toBeLessThanOrEqual(100.5);
  });

  it('discovers files in legitimate tools/ directory in target repositories', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'reporisk_test_tools_'));
    try {
      const toolsDir = join(tempDir, 'tools');
      mkdirSync(toolsDir);
      writeFileSync(join(toolsDir, 'build.py'), 'print("build")', 'utf8');

      const result = scanLanguages(tempDir);
      expect(result.allScannedFiles).toContain('tools/build.py');
      const pyLang = result.languages.find((l) => l.name === 'Python');
      expect(pyLang).toBeDefined();
      expect(pyLang!.fileCount).toBe(1);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('detects frameworks from repository manifests efficiently', () => {
    const { allScannedFiles } = scanLanguages(workspaceRoot);
    const frameworks = scanFrameworks(workspaceRoot, allScannedFiles);

    // RepoRisk uses Vitest for testing and GitHub Actions for CI
    const vitestFw = frameworks.find((fw) => fw.name === 'Vitest');
    expect(vitestFw).toBeDefined();
    expect(vitestFw!.category).toBe('TEST_RUNNER');

    const ghActions = frameworks.find((fw) => fw.name === 'GitHub Actions');
    expect(ghActions).toBeDefined();
    expect(ghActions!.category).toBe('CI_CD');
  });

  it('rejects commented-out routes and discovers only active entry points', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'reporisk_test_routes_'));
    try {
      const sampleCode = [
        '// app.get("/commented-slash", slashHandler);',
        '# app.get("/commented-hash", hashHandler);',
        '/* app.get("/commented-block", blockHandler); */',
        '* app.get("/commented-star", starHandler);',
        '<!-- app.get("/commented-xml", xmlHandler); -->',
        'app.get("/active-live-endpoint", liveHandler);'
      ].join('\n');

      writeFileSync(join(tempDir, 'app.ts'), sampleCode, 'utf8');

      const entryPoints = scanEntryPoints(tempDir, ['app.ts']);
      expect(entryPoints).toHaveLength(1);
      expect(entryPoints[0]!.routePath).toBe('/active-live-endpoint');
      expect(entryPoints[0]!.exposure).toBe('PUBLIC_INGRESS');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('excludes documentation and test artifacts from runtime trust boundaries', () => {
    const simulatedFiles = [
      'docs/security/THREAT_MODEL.md',
      'docs/auth_guide.md',
      'tests/auth.test.ts',
      'test/database.spec.ts',
      'src/auth/jwt.ts',
      'src/database.ts'
    ];

    const boundaries = synthesizeTrustBoundaries(workspaceRoot, [], [], simulatedFiles);

    const authBoundary = boundaries.find((b) => b.boundaryType === 'AUTH_GATEWAY');
    expect(authBoundary).toBeDefined();
    // Must include runtime auth file
    expect(authBoundary!.components).toContain('Module: src/auth/jwt.ts');
    // Must NOT include docs or test files
    expect(authBoundary!.components).not.toContain('Module: docs/security/THREAT_MODEL.md');
    expect(authBoundary!.components).not.toContain('Module: docs/auth_guide.md');
    expect(authBoundary!.components).not.toContain('Module: tests/auth.test.ts');

    const dbBoundary = boundaries.find((b) => b.boundaryType === 'DATABASE_ISOLATION');
    expect(dbBoundary).toBeDefined();
    // Must include runtime database file
    expect(dbBoundary!.components).toContain('Schema/Config: src/database.ts');
    // Must NOT include test specs
    expect(dbBoundary!.components).not.toContain('Schema/Config: test/database.spec.ts');
  });

  it('produces a complete, cohesive TopologyMap via discoverTopology', async () => {
    const topology = await discoverTopology(workspaceRoot, { commitSha: 'test-commit-sha' });

    expect(topology.repositoryRoot).toBe(workspaceRoot);
    expect(topology.commitSha).toBe('test-commit-sha');
    expect(topology.totalFiles).toBeGreaterThan(0);
    expect(topology.totalBytes).toBeGreaterThan(0);
    expect(topology.languages.length).toBeGreaterThan(0);
    expect(Array.isArray(topology.frameworks)).toBe(true);
    expect(Array.isArray(topology.entryPoints)).toBe(true);
    expect(Array.isArray(topology.trustBoundaries)).toBe(true);
  });
});
