import { describe, it, expect } from 'vitest';
import { runScan } from '../src/commands/scan.js';

describe('CLI Scan Command — Ingestion & Topology Pipeline', () => {
  const localTarget = process.cwd();

  it('rejects an empty target repository path or URL', async () => {
    await expect(runScan('', {})).rejects.toThrow('A target repository path or URL must be provided.');
    await expect(runScan('   ', {})).rejects.toThrow('A target repository path or URL must be provided.');
  });

  it('runs scan in JSON mode and returns a valid TopologyMap', async () => {
    const topology = await runScan(localTarget, { format: 'json' });

    expect(topology).toBeDefined();
    expect(topology.repositoryRoot).toBeDefined();
    expect(topology.totalFiles).toBeGreaterThan(0);
    expect(topology.languages.length).toBeGreaterThan(0);
    expect(Array.isArray(topology.frameworks)).toBe(true);
    expect(Array.isArray(topology.entryPoints)).toBe(true);
    expect(Array.isArray(topology.trustBoundaries)).toBe(true);
  });
});
