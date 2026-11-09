import { describe, it, expect } from 'vitest';
import {
  getDefaultRiskParameters,
  DEFAULT_RISK_PARAMETERS,
  SEVERITY_SCORES,
  CONFIDENCE_MULTIPLIERS
} from '../src/index.js';

describe('Risk Parameters & Heuristic Baselines', () => {
  it('initializes with heuristic model version 1.0.0-heuristic', () => {
    const params = getDefaultRiskParameters();
    expect(params.model_version).toBe('1.0.0-heuristic');
    expect(params.is_calibrated).toBe(false);
  });

  it('verifies that domain weights sum exactly to 1.0', () => {
    const weights = DEFAULT_RISK_PARAMETERS.domain_weights;
    const sum =
      weights.code +
      weights.secrets +
      weights.supply +
      weights.infra +
      weights.arch;
    expect(Math.abs(sum - 1.0)).toBeLessThan(1e-9);
  });

  it('maintains expected severity score hierarchy', () => {
    expect(SEVERITY_SCORES.CRITICAL).toBeGreaterThan(SEVERITY_SCORES.HIGH);
    expect(SEVERITY_SCORES.HIGH).toBeGreaterThan(SEVERITY_SCORES.MEDIUM);
    expect(SEVERITY_SCORES.MEDIUM).toBeGreaterThan(SEVERITY_SCORES.LOW);
    expect(SEVERITY_SCORES.LOW).toBeGreaterThan(SEVERITY_SCORES.INFO);
  });

  it('maintains expected confidence multiplier range (0 to 1]', () => {
    expect(CONFIDENCE_MULTIPLIERS.CONFIRMED).toBe(1.0);
    expect(CONFIDENCE_MULTIPLIERS.LIKELY).toBe(0.8);
    expect(CONFIDENCE_MULTIPLIERS.POTENTIAL).toBe(0.5);
    expect(CONFIDENCE_MULTIPLIERS.INFORMATIONAL).toBe(0.2);
  });
});
