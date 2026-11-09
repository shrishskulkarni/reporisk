/**
 * @reporisk/core
 * Repository Risk Intelligence Platform — Core Engine
 */

export * from './types/finding.js';
export * from './types/risk.js';
export * from './types/graph.js';
export * from './types/topology.js';
export * from './types/scanner.js';
export * from './constants.js';

import { DEFAULT_RISK_PARAMETERS, REPORISK_VERSION } from './constants.js';
import type { RiskParameters } from './types/risk.js';
import type { CanonicalFinding } from './types/finding.js';

export function getCoreEngineVersion(): string {
  return REPORISK_VERSION;
}

export function getDefaultRiskParameters(): RiskParameters {
  return { ...DEFAULT_RISK_PARAMETERS };
}

/**
 * Validates whether a finding strictly fulfills the 13-field canonical schema.
 */
export function isValidCanonicalFinding(obj: unknown): obj is CanonicalFinding {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const f = obj as Record<string, unknown>;

  const hasProvenance =
    typeof f['scanner'] === 'string' &&
    typeof f['scanner_version'] === 'string' &&
    typeof f['rule_id'] === 'string';

  const hasLocation =
    typeof f['source_file'] === 'string' &&
    typeof f['line_range'] === 'object' &&
    f['line_range'] !== null &&
    typeof (f['line_range'] as Record<string, unknown>)['start_line'] === 'number' &&
    typeof (f['line_range'] as Record<string, unknown>)['end_line'] === 'number';

  const hasEvidence =
    typeof f['original_message'] === 'string' &&
    typeof f['timestamp'] === 'string' &&
    typeof f['raw_evidence'] === 'string';

  const hasIntelligence =
    typeof f['reporisk_interpretation'] === 'string' &&
    typeof f['confidence'] === 'string' &&
    typeof f['severity'] === 'string' &&
    typeof f['validation_status'] === 'string';

  return hasProvenance && hasLocation && hasEvidence && hasIntelligence;
}
