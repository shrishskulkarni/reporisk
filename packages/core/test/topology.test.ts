import { describe, it, expect } from 'vitest';
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

  it('detects frameworks from repository manifests', () => {
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

  it('scans and locates route entry points', () => {
    const { allScannedFiles } = scanLanguages(workspaceRoot);
    const entryPoints = scanEntryPoints(workspaceRoot, allScannedFiles);
    expect(Array.isArray(entryPoints)).toBe(true);

    for (const ep of entryPoints) {
      expect(ep.id).toBeDefined();
      expect(ep.file).toBeDefined();
      expect(typeof ep.line).toBe('number');
      expect(['PUBLIC_INGRESS', 'AUTHENTICATED', 'INTERNAL']).toContain(ep.exposure);
    }
  });

  it('synthesizes trust boundaries from architecture components', () => {
    const { allScannedFiles } = scanLanguages(workspaceRoot);
    const frameworks = scanFrameworks(workspaceRoot, allScannedFiles);
    const entryPoints = scanEntryPoints(workspaceRoot, allScannedFiles);

    const boundaries = synthesizeTrustBoundaries(
      workspaceRoot,
      entryPoints,
      frameworks,
      allScannedFiles
    );

    expect(Array.isArray(boundaries)).toBe(true);
    // GitHub Actions workflows present -> CI_RUNNER boundary should be synthesized
    const ciBoundary = boundaries.find((b) => b.boundaryType === 'CI_RUNNER');
    expect(ciBoundary).toBeDefined();
    expect(ciBoundary!.components.length).toBeGreaterThan(0);
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
