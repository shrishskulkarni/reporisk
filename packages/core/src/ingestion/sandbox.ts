/**
 * Sandbox Workspace Manager
 * Allocates temporary isolation directories and manages deterministic cleanup.
 *
 * Epistemic Classification: DESIGN DECISION
 */

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Creates a dedicated temporary directory for sandboxed repository analysis.
 */
export async function createSandboxWorkspace(customRoot?: string): Promise<string> {
  const root = customRoot ?? tmpdir();
  const prefix = join(root, 'reporisk_sandbox_');
  return mkdtemp(prefix);
}

/**
 * Safely removes a sandbox directory and all its contents.
 * Implements retry logic to handle file locking on Windows.
 */
export async function cleanupSandboxWorkspace(
  sandboxPath: string,
  retries: number = 3,
  delayMs: number = 200
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await rm(sandboxPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      return;
    } catch (err) {
      if (attempt === retries) {
        // Last attempt failed; log warning but avoid unhandled crash during cleanup
        console.warn(`Warning: Could not completely delete sandbox at ${sandboxPath}: ${err}`);
      } else {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
}
