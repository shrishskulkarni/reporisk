/**
 * Language Discovery Engine
 * Traverses the repository tree to detect programming and configuration languages.
 *
 * Epistemic Classification: FACT
 */

import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { DetectedLanguage } from '../types/topology.js';

export const EXTENSION_LANGUAGE_MAP: Readonly<Record<string, string>> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.py': 'Python',
  '.pyw': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.cs': 'C#',
  '.c': 'C',
  '.h': 'C',
  '.cpp': 'C++',
  '.hpp': 'C++',
  '.cc': 'C++',
  '.swift': 'Swift',
  '.scala': 'Scala',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.ps1': 'PowerShell',
  '.tf': 'HCL (Terraform)',
  '.hcl': 'HCL',
  '.json': 'JSON',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.xml': 'XML',
  '.sql': 'SQL',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.md': 'Markdown'
};

const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'vendor',
  'dist',
  'build',
  'out',
  'target',
  '.next',
  '.turbo',
  '__pycache__',
  '.venv',
  'venv',
  'env',
  '.pytest_cache',
  'coverage'
]);

export interface LanguageScanResult {
  readonly languages: readonly DetectedLanguage[];
  readonly totalFiles: number;
  readonly totalBytes: number;
  readonly allScannedFiles: readonly string[];
}

/**
 * Scans a workspace directory to compute language breakdown.
 */
export function scanLanguages(workspaceRoot: string): LanguageScanResult {
  const fileCounts: Record<string, number> = {};
  const byteCounts: Record<string, number> = {};
  let totalFiles = 0;
  let totalBytes = 0;
  const allScannedFiles: string[] = [];

  function traverse(dir: string, relativeDir: string = ''): void {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(name) && !name.startsWith('.scratch')) {
          traverse(join(dir, name), join(relativeDir, name));
        }
      } else if (entry.isFile()) {
        const ext = extname(name).toLowerCase();
        const lang = EXTENSION_LANGUAGE_MAP[ext];
        const relPath = relativeDir ? join(relativeDir, name).replace(/\\/g, '/') : name;

        allScannedFiles.push(relPath);
        totalFiles++;

        let size = 0;
        try {
          size = statSync(join(dir, name)).size;
        } catch {
          size = 0;
        }
        totalBytes += size;

        if (lang) {
          fileCounts[lang] = (fileCounts[lang] ?? 0) + 1;
          byteCounts[lang] = (byteCounts[lang] ?? 0) + size;
        }
      }
    }
  }

  traverse(workspaceRoot);

  const languages: DetectedLanguage[] = Object.entries(fileCounts)
    .map(([name, count]) => {
      const percentage = totalFiles > 0 ? Math.round((count / totalFiles) * 1000) / 10 : 0;
      return {
        name,
        fileCount: count,
        percentage,
        byteCount: byteCounts[name] ?? 0
      };
    })
    .sort((a, b) => b.fileCount - a.fileCount);

  return {
    languages,
    totalFiles,
    totalBytes,
    allScannedFiles
  };
}
