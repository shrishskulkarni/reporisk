/**
 * reporisk scan command
 * Integrates ingestion and topology discovery into the CLI workflow.
 */

import { ingestRepository, discoverTopology, type TopologyMap } from '@reporisk/core';

export interface ScanCommandOptions {
  format?: 'text' | 'json' | 'markdown' | undefined;
  output?: string | undefined;
  timeout?: string | undefined;
}

export async function runScan(target: string, options: ScanCommandOptions): Promise<TopologyMap> {
  if (!target || target.trim().length === 0) {
    throw new Error('A target repository path or URL must be provided.');
  }

  const timeoutMs = options.timeout ? parseInt(options.timeout, 10) * 1000 : undefined;
  const isJson = options.format === 'json';

  if (!isJson) {
    console.log(`[RepoRisk] Ingesting repository: ${target}...`);
  }

  const repo = await ingestRepository(target, { cloneTimeoutMs: timeoutMs });

  try {
    if (!isJson) {
      console.log(`[RepoRisk] Target acquired: ${repo.targetType} (Commit: ${repo.commitSha.slice(0, 10)})`);
      console.log(`[RepoRisk] Discovering repository topology...`);
    }

    const topology = await discoverTopology(repo.workspacePath, {
      commitSha: repo.commitSha
    });

    if (isJson) {
      console.log(JSON.stringify(topology, null, 2));
      return topology;
    }

    // Human-readable console output
    console.log('\n--- Repository Topology Summary ---');
    console.log(`Root: ${repo.workspacePath}`);
    console.log(`Commit: ${repo.commitSha}`);
    console.log(`Scanned Files: ${topology.totalFiles} (${Math.round(topology.totalBytes / 1024)} KB)`);

    console.log('\nLanguages:');
    if (topology.languages.length === 0) {
      console.log('  (No recognized source code files)');
    } else {
      for (const lang of topology.languages.slice(0, 5)) {
        console.log(`  - ${lang.name.padEnd(16)}: ${lang.fileCount.toString().padStart(4)} files (${lang.percentage}%)`);
      }
    }

    console.log('\nFrameworks & Infrastructure:');
    if (topology.frameworks.length === 0) {
      console.log('  (No standard application frameworks detected in manifests)');
    } else {
      for (const fw of topology.frameworks) {
        console.log(`  - [${fw.category}] ${fw.name} (via ${fw.manifestFile})`);
      }
    }

    console.log(`\nEntry Points (${topology.entryPoints.length} detected):`);
    if (topology.entryPoints.length === 0) {
      console.log('  (No HTTP/API route entry points statically detected)');
    } else {
      for (const ep of topology.entryPoints.slice(0, 8)) {
        console.log(`  - [${ep.exposure}] ${ep.method ?? 'ANY'} ${ep.routePath ?? '/'} (${ep.file}:${ep.line})`);
      }
      if (topology.entryPoints.length > 8) {
        console.log(`    ... and ${topology.entryPoints.length - 8} more entry points`);
      }
    }

    console.log(`\nTrust Boundaries (${topology.trustBoundaries.length} identified):`);
    for (const tb of topology.trustBoundaries) {
      console.log(`  - ${tb.name} (${tb.boundaryType}): ${tb.components.length} components`);
    }

    console.log('\nPhase 3 Ingestion & Topology complete. Next phase: Category A Scanners.');
    return topology;
  } finally {
    await repo.cleanup();
  }
}
