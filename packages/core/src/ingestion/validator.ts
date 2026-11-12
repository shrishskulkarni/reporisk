/**
 * Ingestion Security Validator
 * Enforces strict input validation and filesystem boundary defenses.
 *
 * Epistemic Classification: DESIGN DECISION / STRIDE Defense
 */

import { realpathSync, statSync, lstatSync } from 'node:fs';
import { resolve, normalize, isAbsolute, dirname, basename } from 'node:path';
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
 * Prevents Directory Traversal ("Zip Slip") and hostile escape attempts,
 * including non-existent paths traversing through external symlinked ancestors.
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

  // Windows and macOS are case-insensitive by default; Linux/POSIX systems are case-sensitive.
  const isCaseInsensitive = process.platform === 'win32' || process.platform === 'darwin';
  const sep = process.platform === 'win32' ? '\\' : '/';
  const rootPrefix = canonicalRoot.endsWith(sep) ? canonicalRoot : canonicalRoot + sep;

  function checkContainment(resolvedPath: string): boolean {
    const cmpRoot = isCaseInsensitive ? rootPrefix.toLowerCase() : rootPrefix;
    const cmpCanonicalRoot = isCaseInsensitive ? canonicalRoot.toLowerCase() : canonicalRoot;
    const cmpPath = isCaseInsensitive ? resolvedPath.toLowerCase() : resolvedPath;
    const cmpPathWithSep = isCaseInsensitive
      ? (resolvedPath.endsWith(sep) ? resolvedPath.toLowerCase() : (resolvedPath + sep).toLowerCase())
      : (resolvedPath.endsWith(sep) ? resolvedPath : resolvedPath + sep);

    return cmpPath === cmpCanonicalRoot || cmpPathWithSep.startsWith(cmpRoot);
  }

  // Check if candidate path exists on disk
  let exists = false;
  try {
    lstatSync(absCandidate);
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    let canonicalCandidate: string;
    try {
      canonicalCandidate = realpathSync.native(absCandidate);
    } catch (err) {
      throw new SecurityBoundaryViolationError(
        `Failed to resolve realpath of candidate: ${absCandidate} (${err instanceof Error ? err.message : String(err)})`
      );
    }

    if (!checkContainment(canonicalCandidate)) {
      throw new SecurityBoundaryViolationError(
        `Security Boundary Violation: Path "${candidatePath}" escapes workspace boundary "${canonicalRoot}".`
      );
    }

    return canonicalCandidate;
  } else {
    // Candidate does not exist: walk upward to find the nearest existing ancestor
    let curr = absCandidate;
    const unverifiedSegments: string[] = [];

    while (true) {
      const parent = dirname(curr);
      if (parent === curr) {
        // Reached filesystem root and nothing exists
        break;
      }
      unverifiedSegments.unshift(basename(curr));
      curr = parent;

      try {
        lstatSync(curr);
        break; // curr exists!
      } catch {
        // keep walking up
      }
    }

    let canonicalAncestor: string;
    try {
      canonicalAncestor = realpathSync.native(curr);
    } catch (err) {
      throw new SecurityBoundaryViolationError(
        `Cannot resolve existing ancestor for path "${candidatePath}": ${curr} (${err instanceof Error ? err.message : String(err)})`
      );
    }

    // Verify that the existing ancestor is inside the workspace
    if (!checkContainment(canonicalAncestor)) {
      throw new SecurityBoundaryViolationError(
        `Security Boundary Violation: Path "${candidatePath}" escapes workspace boundary via ancestor "${canonicalAncestor}".`
      );
    }

    // Append the unverified segments to the canonical ancestor
    const canonicalCandidate = resolve(canonicalAncestor, ...unverifiedSegments);

    // Final check to ensure combined path does not escape
    if (!checkContainment(canonicalCandidate)) {
      throw new SecurityBoundaryViolationError(
        `Security Boundary Violation: Path "${candidatePath}" escapes workspace boundary "${canonicalRoot}".`
      );
    }

    return canonicalCandidate;
  }
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
