/**
 * Ingestion Engine Entrypoint
 * Coordinates acquisition of local paths and remote git URLs into verified workspaces.
 *
 * Epistemic Classification: DESIGN DECISION
 */

export * from './validator.js';
export * from './cloner.js';
export * from './sandbox.js';

import type { IngestedRepository, IngestionOptions } from '../types/ingestion.js';
import { isSafeGitUrl, validateLocalDirectory } from './validator.js';
import { cloneRemoteRepository, getLocalCommitSha } from './cloner.js';
import { createSandboxWorkspace, cleanupSandboxWorkspace } from './sandbox.js';

/**
 * Ingests a repository from either a local filesystem path or a remote git URL.
 * Guarantees a verified, canonical workspace path and provides a cleanup callback.
 */
export async function ingestRepository(
  target: string,
  options?: IngestionOptions
): Promise<IngestedRepository> {
  const trimmedTarget = target.trim();

  if (isSafeGitUrl(trimmedTarget)) {
    // Remote Git Repository Ingestion
    const sandboxPath = await createSandboxWorkspace(options?.tempDirRoot);

    try {
      const cloneResult = await cloneRemoteRepository(
        trimmedTarget,
        sandboxPath,
        options?.cloneTimeoutMs
      );

      return {
        workspacePath: sandboxPath,
        targetType: 'REMOTE_GIT_URL',
        target: trimmedTarget,
        commitSha: cloneResult.commitSha,
        isTemporary: true,
        cleanup: async () => {
          await cleanupSandboxWorkspace(sandboxPath);
        }
      };
    } catch (err) {
      // Clean up sandbox on failed clone
      await cleanupSandboxWorkspace(sandboxPath);
      throw err;
    }
  }

  // Local Directory Ingestion
  const canonicalLocalPath = validateLocalDirectory(trimmedTarget);
  const commitSha = await getLocalCommitSha(canonicalLocalPath);

  return {
    workspacePath: canonicalLocalPath,
    targetType: 'LOCAL_DIRECTORY',
    target: trimmedTarget,
    commitSha,
    isTemporary: false,
    cleanup: async () => {
      // Local repositories are not deleted on cleanup
    }
  };
}
