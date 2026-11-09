import { describe, it, expect } from 'vitest';
import {
  computeFindingFingerprint,
  isValidCanonicalFinding,
  type CanonicalFinding
} from '../src/index.js';

describe('Canonical Finding Schema (13-Field Invariant)', () => {
  const validFinding: CanonicalFinding = {
    scanner: 'gitleaks',
    scanner_version: '8.18.2',
    rule_id: 'generic-api-key',
    source_file: 'src/config/auth.ts',
    line_range: { start_line: 42, end_line: 42, start_col: 10, end_col: 45 },
    original_message: 'Generic API Key detected',
    timestamp: '2026-11-09T00:00:00Z',
    dependency_or_db_version: 'rules-v8.18.2',
    raw_evidence: 'const API_KEY = "ghp_xxxxxxxxxxxxxxxxxxxx";',
    reporisk_interpretation: 'Exposed secret detected in application configuration source code',
    confidence: 'CONFIRMED',
    severity: 'HIGH',
    validation_status: 'DETERMINISTICALLY_CONFIRMED'
  };

  it('validates a complete 13-field finding', () => {
    expect(isValidCanonicalFinding(validFinding)).toBe(true);
  });

  it('rejects an incomplete finding missing required fields', () => {
    const invalid = { ...validFinding } as Record<string, unknown>;
    delete invalid['scanner_version'];
    expect(isValidCanonicalFinding(invalid)).toBe(false);
  });

  it('generates a deterministic SHA-256 fingerprint', () => {
    const fp1 = computeFindingFingerprint(validFinding);
    const fp2 = computeFindingFingerprint({ ...validFinding });
    expect(fp1).toHaveLength(64);
    expect(fp1).toBe(fp2);
  });

  it('generates different fingerprints for distinct locations', () => {
    const fp1 = computeFindingFingerprint(validFinding);
    const fp2 = computeFindingFingerprint({
      ...validFinding,
      line_range: { start_line: 43, end_line: 43 }
    });
    expect(fp1).not.toBe(fp2);
  });

  it('preserves tri-factor orthogonality (Severity != Confidence != ValidationStatus)', () => {
    // A CRITICAL severity finding can have LOW/INFORMATIONAL confidence
    const speculativeCritical: CanonicalFinding = {
      ...validFinding,
      severity: 'CRITICAL',
      confidence: 'POTENTIAL',
      validation_status: 'HEURISTICALLY_INFERRED'
    };
    expect(isValidCanonicalFinding(speculativeCritical)).toBe(true);
    expect(speculativeCritical.severity).toBe('CRITICAL');
    expect(speculativeCritical.confidence).toBe('POTENTIAL');
    expect(speculativeCritical.validation_status).toBe('HEURISTICALLY_INFERRED');
  });
});
