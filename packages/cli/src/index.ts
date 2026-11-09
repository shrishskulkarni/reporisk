/**
 * RepoRisk CLI Entry Point
 */

import { Command } from 'commander';
import { getCoreEngineVersion } from '@reporisk/core';
import { runDoctor } from './commands/doctor.js';
import { runScan, type ScanCommandOptions } from './commands/scan.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('reporisk')
    .description('Repository Risk Intelligence Platform — Know what can go wrong before your code does.')
    .version(getCoreEngineVersion());

  program
    .command('doctor')
    .description('Check system readiness, Node.js environment, and Category A security scanners')
    .action(async () => {
      console.log('RepoRisk System Doctor\n----------------------');
      const info = await runDoctor();
      console.log(`Node Runtime : ${info.nodeVersion}`);
      console.log(`OS Platform  : ${info.platform} (${info.arch})\n`);
      console.log('Category A Security Scanners:');

      for (const s of info.scanners) {
        const status = s.isAvailable ? `[OK] ${s.version ?? ''}` : '[NOT FOUND]';
        console.log(`  - ${s.scannerId.padEnd(14)} : ${status}`);
      }

      console.log('\nNote: Missing scanners will gracefully degrade coverage for their respective domains.');
    });

  program
    .command('scan')
    .description('Analyze a local repository directory or public GitHub HTTPS repository')
    .argument('<target>', 'Path to local directory or https:// URL of git repository')
    .option('-f, --format <format>', 'Output format: text, json, or markdown', 'text')
    .option('-o, --output <file>', 'Write audit report to destination file')
    .action(async (target: string, options: ScanCommandOptions) => {
      try {
        await runScan(target, options);
      } catch (err: unknown) {
        console.error('Scan Error:', err instanceof Error ? err.message : String(err));
        process.exitCode = 1;
      }
    });

  return program;
}

// Only run automatically if executed directly via CLI
const isDirectExecution =
  process.argv[1]?.endsWith('reporisk.js') ||
  process.argv[1]?.endsWith('reporisk') ||
  process.argv[1]?.endsWith('index.js');

if (isDirectExecution) {
  const program = createProgram();
  program.parse(process.argv);
}
