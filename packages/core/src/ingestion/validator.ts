/**
 * Ingestion Security Validator
 * Enforces strict input validation and filesystem boundary defenses.
 *
 * Epistemic Classification: DESIGN DECISION / STRIDE Defense
 */

import { realpathSync, statSync, lstatSync } from 'node:fs';
import { resolve, normalize, isAbsolute } from 'node:path';
import { SecurityBoundaryViolationError } from '../types/ingestion.js';

// Regex permitting strictly valid HTTPS git URLs without shell or credential escapes
const SAFE_GIT_URL_REGEX =
  /^https:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?\/[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)+(?:\.git)?\/?$/;

// Forbidden shell injection characters
const FORBIDDEN_SHELL_CHARS_REGEX = /[;&|`$\n\r<>\\*?{}[\]!^~]/;

/**
 * Validates whether a given string is a safe HTTPS git repository URL.
 * Strictly disallows credentials, shell metacharacters, and non-HTTPS protocols.
 */
export function isSafeGitUrl(url: string): boolean {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return false;
  }

  const trimmed = url.trim();

  // Reject forbidden shell characters
  if (FORBIDDEN_SHELL_CHARS_REGEX.test(trimmed)) {
    return false;
  }

  // Reject embedded credentials (e.g., https://token@github.com/...)
  if (trimmed.includes('@')) {
    return false;
  }

  return SAFE_GIT_URL_REGEX.test(trimmed);
}

/**
 * Validates that candidatePath resides strictly within workspaceRoot.
 * Prevents Directory Traversal ("Zip Slip") and hostile escape attempts.
 *
 * Returns the canonical absolute path.
 * Throws SecurityBoundaryViolationError if an escape is detected.
 */
export function validatePathSafety(workspaceRoot: string, candidatePath: string): string {
  if (!workspaceRoot || !candidatePath) {
    throw new SecurityBoundaryViolationError('Workspace root and candidate path are required.');
  }

  // Resolve to normalized absolute path
  const absRoot = resolve(normalize(workspaceRoot));
  const absCandidate = isAbsolute(candidatePath)
    ? resolve(normalize(candidatePath))
    : resolve(absRoot, normalize(candidatePath));

  // Canonicalize workspace root
  let canonicalRoot: string;
  try {
    canonicalRoot = realpathSync.native(absRoot);
  } catch (err) {
    throw new SecurityBoundaryViolationError(
      `Workspace root does not exist or cannot be resolved: ${absRoot} (${err instanceof Error ? err.message : String(err)})`
    );
  }

  // Canonicalize candidate path if it exists
  let canonicalCandidate: string;
  try {
    // If it's a symlink, check where it points
    const lstat = lstatSync(absCandidate);
    if (lstat.isSymbolicLink()) {
      canonicalCandidate = realpathSync.native(absCandidate);
    } else {
      canonicalCandidate = realpathSync.native(absCandidate);
    }
  } catch {
    // If candidate path does not exist yet (e.g. proposed file), check its resolved parent
    canonicalCandidate = absCandidate;
  }

  // Ensure case-insensitive matching for Windows compatibility, but exact prefix containment
  const rootPrefix = canonicalRoot.endsWith('\\') || canonicalRoot.endsWith('/')
    ? canonicalRoot
    : canonicalRoot + (process.platform === 'win32' ? '\\' : '/');

  const normalizedPrefix = rootPrefix.toLowerCase();
  const normalizedCandidate = (canonicalCandidate + (process.platform === 'win32' ? '\\' : '/')).toLowerCase();

  const isContained =
    canonicalCandidate.toLowerCase() === canonicalRoot.toLowerCase() ||
    normalizedCandidate.startsWith(normalizedPrefix);

  if (!isContained) {
    throw new SecurityBoundaryViolationError(
      `Security Boundary Violation: Path "${candidatePath}" escapes workspace boundary "${canonicalRoot}".`
    );
  }

  return canonicalCandidate;
}

/**
 * Validates a local repository path exists and is a directory.
 */
export function validateLocalDirectory(localPath: string): string {
  const absPath = resolve(normalize(localPath));

  let stats;
  try {
    stats = statSync(absPath);
  } catch (err) {
    throw new SecurityBoundaryViolationError(
      `Target directory does not exist or is inaccessible: ${absPath} (${err instanceof Error ? err.message : String(err)})`
    );
  }

  if (!stats.isDirectory()) {
    throw new SecurityBoundaryViolationError(`Target path is not a directory: ${absPath}`);
  }

  return realpathSync.native(absPath);
}
