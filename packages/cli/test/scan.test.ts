import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runScan } from '../src/commands/scan.js';

describe('CLI Scan Command — Ingestion & Topology Pipeline', () => {
  const localTarget = process.cwd();
  const testOutputDir = tmpdir();
  const jsonOutputFile = join(testOutputDir, `reporisk_test_out_${Date.now()}.json`);
  const textOutputFile = join(testOutputDir, `reporisk_test_out_${Date.now()}.txt`);

  afterEach(() => {
    if (existsSync(jsonOutputFile)) {
      rmSync(jsonOutputFile, { force: true });
    }
    if (existsSync(textOutputFile)) {
      rmSync(textOutputFile, { force: true });
    }
  });

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

  it('writes valid JSON report to file when -o/--output is specified in JSON mode', async () => {
    await runScan(localTarget, { format: 'json', output: jsonOutputFile });

    expect(existsSync(jsonOutputFile)).toBe(true);
    const content = readFileSync(jsonOutputFile, 'utf8');
    const parsed = JSON.parse(content);
    expect(parsed.repositoryRoot).toBeDefined();
    expect(parsed.totalFiles).toBeGreaterThan(0);
    expect(Array.isArray(parsed.languages)).toBe(true);
  });

  it('writes formatted text report to file when -o/--output is specified in text mode', async () => {
    await runScan(localTarget, { format: 'text', output: textOutputFile });

    expect(existsSync(textOutputFile)).toBe(true);
    const content = readFileSync(textOutputFile, 'utf8');
    expect(content).toContain('--- Repository Topology Summary ---');
    expect(content).toContain('Languages:');
    expect(content).toContain('Trust Boundaries');
  });
});
