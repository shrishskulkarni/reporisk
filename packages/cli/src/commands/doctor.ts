/**
 * reporisk doctor command
 * Inspects system environment, Node.js runtime, git, and Category A scanner binaries on PATH.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { CategoryAScannerId, ScannerAvailability } from '@reporisk/core';

const execFileAsync = promisify(execFile);

interface ToolCheck {
  id: CategoryAScannerId;
  binary: string;
  versionArgs: string[];
}

const CATEGORY_A_TOOLS: readonly ToolCheck[] = [
  { id: 'gitleaks', binary: 'gitleaks', versionArgs: ['version'] },
  { id: 'semgrep', binary: 'semgrep', versionArgs: ['--version'] },
  { id: 'osv-scanner', binary: 'osv-scanner', versionArgs: ['--version'] },
  { id: 'checkov', binary: 'checkov', versionArgs: ['--version'] }
];

export async function checkScannerAvailability(tool: ToolCheck): Promise<ScannerAvailability> {
  try {
    const { stdout } = await execFileAsync(tool.binary, tool.versionArgs, {
      timeout: 5000,
      windowsHide: true
    });
    return {
      scannerId: tool.id,
      isAvailable: true,
      version: stdout.trim().split('\n')[0]
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      scannerId: tool.id,
      isAvailable: false,
      error: errorMsg
    };
  }
}

export async function runDoctor(): Promise<{
  nodeVersion: string;
  platform: string;
  arch: string;
  scanners: ScannerAvailability[];
}> {
  const scanners: ScannerAvailability[] = [];

  for (const tool of CATEGORY_A_TOOLS) {
    const result = await checkScannerAvailability(tool);
    scanners.push(result);
  }

  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    scanners
  };
}
