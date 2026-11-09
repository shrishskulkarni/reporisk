import { describe, it, expect } from 'vitest';
import { createProgram } from '../src/index.js';
import { runDoctor } from '../src/commands/doctor.js';

describe('RepoRisk CLI Foundation', () => {
  it('creates the CLI commander program with core metadata', () => {
    const program = createProgram();
    expect(program.name()).toBe('reporisk');
    expect(program.version()).toBe('0.1.0');
    expect(program.description()).toContain('Repository Risk Intelligence Platform');
  });

  it('registers doctor and scan commands', () => {
    const program = createProgram();
    const commandNames = program.commands.map((cmd) => cmd.name());
    expect(commandNames).toContain('doctor');
    expect(commandNames).toContain('scan');
  });

  it('runs doctor check and returns structured environment diagnostics', async () => {
    const doctorResult = await runDoctor();
    expect(doctorResult.nodeVersion).toBe(process.version);
    expect(doctorResult.platform).toBe(process.platform);
    expect(doctorResult.arch).toBe(process.arch);
    expect(doctorResult.scanners).toHaveLength(4);

    const scannerIds = doctorResult.scanners.map((s) => s.scannerId);
    expect(scannerIds).toEqual(['gitleaks', 'semgrep', 'osv-scanner', 'checkov']);

    for (const scanner of doctorResult.scanners) {
      expect(typeof scanner.isAvailable).toBe('boolean');
    }
  });
});
