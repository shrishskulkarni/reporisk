/**
 * Topology Discovery Engine Entrypoint
 * Produces a unified architectural map of repository languages, frameworks, entry points, and trust boundaries.
 *
 * Epistemic Classification: FACT + DESIGN DECISION
 */

export * from './languages.js';
export * from './frameworks.js';
export * from './entrypoints.js';
export * from './boundaries.js';

import type { TopologyMap } from '../types/topology.js';
import { scanLanguages } from './languages.js';
import { scanFrameworks } from './frameworks.js';
import { scanEntryPoints } from './entrypoints.js';
import { synthesizeTrustBoundaries } from './boundaries.js';

export interface TopologyOptions {
  readonly commitSha?: string | undefined;
}

/**
 * Discovers the comprehensive structural and architectural topology of a repository.
 * Analysis is purely passive and static: Category B target repository code is NEVER executed.
 */
export async function discoverTopology(
  workspaceRoot: string,
  options?: TopologyOptions
): Promise<TopologyMap> {
  // 1. Language scanning & file tree traversal
  const { languages, totalFiles, totalBytes, allScannedFiles } = scanLanguages(workspaceRoot);

  // 2. Framework & technology detection from manifests
  const frameworks = scanFrameworks(workspaceRoot, allScannedFiles);

  // 3. Entry point & route discovery
  const entryPoints = scanEntryPoints(workspaceRoot, allScannedFiles);

  // 4. Trust boundary synthesis
  const trustBoundaries = synthesizeTrustBoundaries(
    workspaceRoot,
    entryPoints,
    frameworks,
    allScannedFiles
  );

  return {
    repositoryRoot: workspaceRoot,
    commitSha: options?.commitSha,
    languages,
    frameworks,
    entryPoints,
    trustBoundaries,
    totalFiles,
    totalBytes
  };
}
