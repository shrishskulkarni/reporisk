import { describe, it, expect } from 'vitest';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import * as fs from 'node:fs';
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

  it('permits proposed non-existent files under valid existing workspace ancestors', () => {
    const nonExistentPath = join(root, 'packages', 'core', 'proposed_dir', 'future_file.ts');
    const validated = validatePathSafety(root, nonExistentPath);
    expect(validated).toBeDefined();
    expect(validated.toLowerCase()).toContain('future_file.ts');
  });

  it('detects and blocks directory traversal escaping the workspace root', () => {
    const maliciousEscape = join(root, '..', '..', '..', 'etc', 'passwd');
    expect(() => validatePathSafety(root, maliciousEscape)).toThrow(
      SecurityBoundaryViolationError
    );
  });

  it('detects and blocks non-existent paths traversing through existing external ancestors', () => {
    // Non-existent target file under an external parent
    const maliciousNonExistent = join(root, '..', 'non_existent_dir_outside', 'evil.txt');
    expect(() => validatePathSafety(root, maliciousNonExistent)).toThrow(
      SecurityBoundaryViolationError
    );
  });

  it('detects and blocks symlink directory escapes on non-existent candidate files', () => {
    const tempDir = fs.mkdtempSync(join(tmpdir(), 'reporisk_symlink_test_'));
    const outsideDir = fs.mkdtempSync(join(tmpdir(), 'reporisk_outside_test_'));
    const linkOut = join(tempDir, 'link_out');
    try {
      let symlinkCreated = false;
      try {
        fs.symlinkSync(outsideDir, linkOut, process.platform === 'win32' ? 'junction' : 'dir');
        symlinkCreated = true;
      } catch {
        // Symlink creation requires elevated permissions on some Windows environments
        symlinkCreated = false;
      }

      if (symlinkCreated) {
        // Non-existent file inside existing symlink pointing outside
        const nonExistentTarget = join(linkOut, 'non_existent_evil.txt');
        expect(() => validatePathSafety(tempDir, nonExistentTarget)).toThrow(
          SecurityBoundaryViolationError
        );
      } else {
        // Fallback: verify that any non-existent path whose existing ancestor resolves outside is blocked
        const nonExistentOutside = join(tempDir, '..', 'reporisk_fake_outside_dir', 'evil.txt');
        expect(() => validatePathSafety(tempDir, nonExistentOutside)).toThrow(
          SecurityBoundaryViolationError
        );
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
      fs.rmSync(outsideDir, { recursive: true, force: true });
    }
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
