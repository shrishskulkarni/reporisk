/**
 * reporisk scan command
 * Integrates ingestion and topology discovery into the CLI workflow.
 */

import { writeFileSync } from 'node:fs';
import { ingestRepository, discoverTopology, type TopologyMap } from '@reporisk/core';

export interface ScanCommandOptions {
  format?: 'text' | 'json' | 'markdown' | undefined;
  output?: string | undefined;
  timeout?: string | undefined;
}

function formatTextSummary(workspacePath: string, commitSha: string, topology: TopologyMap): string {
  const lines: string[] = [];
  lines.push('--- Repository Topology Summary ---');
  lines.push(`Root: ${workspacePath}`);
  lines.push(`Commit: ${commitSha}`);
  lines.push(`Scanned Files: ${topology.totalFiles} (${Math.round(topology.totalBytes / 1024)} KB)`);

  lines.push('\nLanguages:');
  if (topology.languages.length === 0) {
    lines.push('  (No recognized source code files)');
  } else {
    for (const lang of topology.languages.slice(0, 5)) {
      lines.push(`  - ${lang.name.padEnd(16)}: ${lang.fileCount.toString().padStart(4)} files (${lang.percentage}%)`);
    }
  }

  lines.push('\nFrameworks & Infrastructure:');
  if (topology.frameworks.length === 0) {
    lines.push('  (No standard application frameworks detected in manifests)');
  } else {
    for (const fw of topology.frameworks) {
      lines.push(`  - [${fw.category}] ${fw.name} (via ${fw.manifestFile})`);
    }
  }

  lines.push(`\nEntry Points (${topology.entryPoints.length} detected):`);
  if (topology.entryPoints.length === 0) {
    lines.push('  (No HTTP/API route entry points statically detected)');
  } else {
    for (const ep of topology.entryPoints.slice(0, 8)) {
      lines.push(`  - [${ep.exposure}] ${ep.method ?? 'ANY'} ${ep.routePath ?? '/'} (${ep.file}:${ep.line})`);
    }
    if (topology.entryPoints.length > 8) {
      lines.push(`    ... and ${topology.entryPoints.length - 8} more entry points`);
    }
  }

  lines.push(`\nTrust Boundaries (${topology.trustBoundaries.length} identified):`);
  for (const tb of topology.trustBoundaries) {
    lines.push(`  - ${tb.name} (${tb.boundaryType}): ${tb.components.length} components`);
  }

  return lines.join('\n');
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
      const jsonStr = JSON.stringify(topology, null, 2);
      if (options.output) {
        writeFileSync(options.output, jsonStr, 'utf8');
      } else {
        console.log(jsonStr);
      }
      return topology;
    }

    const summary = formatTextSummary(repo.workspacePath, repo.commitSha, topology);
    if (options.output) {
      writeFileSync(options.output, summary, 'utf8');
      console.log(`\n[RepoRisk] Report successfully written to: ${options.output}`);
    } else {
      console.log('\n' + summary);
    }

    return topology;
  } finally {
    await repo.cleanup();
  }
}
