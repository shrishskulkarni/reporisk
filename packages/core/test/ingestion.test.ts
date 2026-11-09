import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import {
  isSafeGitUrl,
  validateLocalDirectory,
  ingestRepository,
  SecurityBoundaryViolationError
} from '../src/index.js';

describe('Ingestion Engine — URL Validation & Invariant Defenses', () => {
  it('accepts valid public HTTPS git URLs', () => {
    expect(isSafeGitUrl('https://github.com/owner/repository')).toBe(true);
    expect(isSafeGitUrl('https://github.com/owner/repository.git')).toBe(true);
    expect(isSafeGitUrl('https://gitlab.com/group/subgroup/project.git')).toBe(true);
    expect(isSafeGitUrl('https://git.example.com/org/repo')).toBe(true);
  });

  it('rejects URLs containing shell injection metacharacters', () => {
    expect(isSafeGitUrl('https://github.com/owner/repo; rm -rf /')).toBe(false);
    expect(isSafeGitUrl('https://github.com/owner/repo && whoami')).toBe(false);
    expect(isSafeGitUrl('https://github.com/owner/repo | cat /etc/passwd')).toBe(false);
    expect(isSafeGitUrl('https://github.com/owner/repo`id`')).toBe(false);
    expect(isSafeGitUrl('https://github.com/owner/repo$(id)')).toBe(false);
    expect(isSafeGitUrl('https://github.com/owner/repo\nmalicious')).toBe(false);
  });

  it('rejects URLs containing embedded credentials or tokens', () => {
    expect(isSafeGitUrl('https://token@github.com/owner/repo.git')).toBe(false);
    expect(isSafeGitUrl('https://user:password@github.com/owner/repo.git')).toBe(false);
  });

  it('rejects non-HTTPS protocols', () => {
    expect(isSafeGitUrl('http://github.com/owner/repo')).toBe(false);
    expect(isSafeGitUrl('ssh://git@github.com:owner/repo.git')).toBe(false);
    expect(isSafeGitUrl('git@github.com:owner/repo.git')).toBe(false);
    expect(isSafeGitUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeGitUrl('ftp://example.com/repo.git')).toBe(false);
  });

  it('validates existing local directories', () => {
    const cwd = process.cwd();
    const validated = validateLocalDirectory(cwd);
    expect(validated).toBeDefined();
    expect(typeof validated).toBe('string');
  });

  it('rejects non-existent local directories', () => {
    const nonExistent = resolve(process.cwd(), 'non_existent_dir_12345');
    expect(() => validateLocalDirectory(nonExistent)).toThrow(SecurityBoundaryViolationError);
  });

  it('ingests an existing local directory successfully', async () => {
    const cwd = process.cwd();
    const repo = await ingestRepository(cwd);

    expect(repo.targetType).toBe('LOCAL_DIRECTORY');
    expect(repo.workspacePath).toBeDefined();
    expect(repo.isTemporary).toBe(false);
    expect(repo.commitSha).toBeDefined();

    // Cleanup on local directory should safely complete without deletion
    await repo.cleanup();
  });
});
