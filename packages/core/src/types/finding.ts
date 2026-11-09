/**
 * Canonical Finding Schema (The 13-Field Specification)
 * Strictly separates Severity (Impact), Confidence (Certainty), and Validation Status (Provenance).
 *
 * Epistemic Classification: DESIGN DECISION
 */

import { createHash } from 'node:crypto';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type ConfidenceLevel = 'CONFIRMED' | 'LIKELY' | 'POTENTIAL' | 'INFORMATIONAL';

export type ValidationStatus =
  | 'UNVALIDATED'
  | 'DETERMINISTICALLY_CONFIRMED'
  | 'HEURISTICALLY_INFERRED'
  | 'SUPPRESSED'
  | 'FALSE_POSITIVE';

export interface LineRange {
  start_line: number;
  end_line: number;
  start_col?: number | undefined;
  end_col?: number | undefined;
}

export interface CanonicalFinding {
  // 1. Tool Origin & Provenance [FACT]
  scanner: string;
  scanner_version: string;
  rule_id: string;

  // 2. Exact Code Location [FACT]
  source_file: string;
  line_range: LineRange;

  // 3. Raw Evidence [FACT]
  original_message: string;
  timestamp: string;
  dependency_or_db_version?: string | undefined;
  raw_evidence: string;

  // 4. RepoRisk Intelligence Overlay [DESIGN DECISION / HEURISTIC]
  reporisk_interpretation: string;
  confidence: ConfidenceLevel;
  severity: SeverityLevel;
  validation_status: ValidationStatus;
}

/**
 * Computes a deterministic SHA-256 fingerprint for deduplication.
 * Based on scanner identity, rule, file path, line range, and raw evidence.
 */
export function computeFindingFingerprint(finding: CanonicalFinding): string {
  const payload = [
    finding.scanner,
    finding.rule_id,
    finding.source_file,
    finding.line_range.start_line,
    finding.line_range.end_line,
    finding.raw_evidence.trim()
  ].join(':');

  return createHash('sha256').update(payload).digest('hex');
}
