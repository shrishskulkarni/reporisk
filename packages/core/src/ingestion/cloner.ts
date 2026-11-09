/**
 * Safe Git Subprocess Cloner
 * Clones remote git repositories via direct argument arrays (execFile) with strict timeouts.
 *
 * Epistemic Classification: DESIGN DECISION / Category A Execution
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DEFAULT_SCANNER_TIMEOUT_MS } from '../constants.js';
import { SecurityBoundaryViolationError } from '../types/ingestion.js';
import { isSafeGitUrl } from './validator.js';

const execFileAsync = promisify(execFile);

export interface CloneResult {
  readonly commitSha: string;
  readonly cloneDurationMs: number;
}

/**
 * Safely clones a remote HTTPS git repository to a designated sandbox directory.
 * Never uses shell interpolation (shell: false).
 */
export async function cloneRemoteRepository(
  url: string,
  destinationPath: string,
  timeoutMs: number = DEFAULT_SCANNER_TIMEOUT_MS
): Promise<CloneResult> {
  if (!isSafeGitUrl(url)) {
    throw new SecurityBoundaryViolationError(
      `Invalid or rejected repository URL: "${url}". Only standard HTTPS git URLs are permitted.`
    );
  }

  const startTime = Date.now();

  const cloneArgs = [
    'clone',
    '--depth',
    '1',
    '--no-tags',
    '--single-branch',
    url.trim(),
    destinationPath
  ];

  try {
    await execFileAsync('git', cloneArgs, {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Git clone failed for repository "${url}": ${errorMsg}`);
  }

  // Extract pinned commit hash
  let commitSha = 'UNKNOWN';
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
      cwd: destinationPath,
      timeout: 5000,
      windowsHide: true
    });
    commitSha = stdout.trim();
  } catch {
    // Non-fatal if rev-parse fails, keep UNKNOWN
  }

  return {
    commitSha,
    cloneDurationMs: Date.now() - startTime
  };
}

/**
 * Retrieves the commit SHA of an existing local repository if it is a git repo.
 */
export async function getLocalCommitSha(localPath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
      cwd: localPath,
      timeout: 5000,
      windowsHide: true
    });
    return stdout.trim();
  } catch {
    return 'LOCAL_UNCOMMITTED';
  }
}
