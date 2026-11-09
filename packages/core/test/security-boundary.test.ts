import { describe, it, expect } from 'vitest';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  validatePathSafety,
  SecurityBoundaryViolationError
} from '../src/index.js';

describe('Security Boundary Defenses — Directory Traversal & Zip Slip', () => {
  const root = process.cwd();

  it('permits valid canonical paths within the workspace root', () => {
    const safePath = join(root, 'package.json');
    const validated = validatePathSafety(root, safePath);
    expect(validated).toBeDefined();
    expect(validated.toLowerCase()).toContain('package.json');
  });

  it('permits valid subdirectories within the workspace root', () => {
    const safeDir = join(root, 'packages', 'core');
    const validated = validatePathSafety(root, safeDir);
    expect(validated).toBeDefined();
  });

  it('detects and blocks directory traversal escaping the workspace root', () => {
    const maliciousEscape = join(root, '..', '..', '..', 'etc', 'passwd');
    expect(() => validatePathSafety(root, maliciousEscape)).toThrow(
      SecurityBoundaryViolationError
    );
  });

  it('blocks absolute paths targeting external system roots', () => {
    const externalPath = process.platform === 'win32' ? 'C:\\Windows\\System32' : '/etc/shadow';
    expect(() => validatePathSafety(root, externalPath)).toThrow(
      SecurityBoundaryViolationError
    );
  });

  it('rejects empty or invalid inputs', () => {
    expect(() => validatePathSafety('', 'some/path')).toThrow(
      SecurityBoundaryViolationError
    );
    expect(() => validatePathSafety(root, '')).toThrow(
      SecurityBoundaryViolationError
    );
  });
});
