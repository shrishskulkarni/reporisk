/**
 * Canonical System Constants & Initial Heuristics
 *
 * Epistemic Classification: DESIGN DECISION / HEURISTIC
 * (These weights represent deliberate engineering baselines, NOT empirically validated constants).
 */

import type { RiskParameters } from './types/risk.js';
import type { SeverityLevel, ConfidenceLevel } from './types/finding.js';

export const REPORISK_VERSION = '0.1.0';

export const DEFAULT_RISK_PARAMETERS: RiskParameters = {
  model_version: '1.0.0-heuristic',
  domain_weights: {
    code: 0.25,
    secrets: 0.25,
    supply: 0.2,
    infra: 0.15,
    arch: 0.15
  },
  saturation_constant: 15.0,
  is_calibrated: false
};

export const SEVERITY_SCORES: Readonly<Record<SeverityLevel, number>> = {
  CRITICAL: 10,
  HIGH: 7,
  MEDIUM: 4,
  LOW: 2,
  INFO: 0.5
};

export const CONFIDENCE_MULTIPLIERS: Readonly<Record<ConfidenceLevel, number>> = {
  CONFIRMED: 1.0,
  LIKELY: 0.8,
  POTENTIAL: 0.5,
  INFORMATIONAL: 0.2
};

export const DEFAULT_SCANNER_TIMEOUT_MS = 120_000; // 120 seconds
export const DEFAULT_SCANNER_MAX_BUFFER_BYTES = 52_428_800; // 50 MB
export const DEFAULT_SCANNER_MEMORY_LIMIT_MB = 2_048; // 2 GB
