/**
 * Risk Model Interfaces & Epistemic Parameter Declarations
 *
 * Epistemic Classification: DESIGN DECISION / HEURISTIC
 */

export interface DomainWeights {
  readonly code: number;
  readonly secrets: number;
  readonly supply: number;
  readonly infra: number;
  readonly arch: number;
}

export interface RiskParameters {
  readonly model_version: string;
  readonly domain_weights: DomainWeights;
  readonly saturation_constant: number;
  readonly is_calibrated: boolean;
}

export interface DomainRisk {
  readonly raw_sum: number;
  readonly score: number; // 0 - 100 integer
  readonly finding_count: number;
}

export interface OverallRiskScore {
  readonly score: number; // 0 - 100 integer (No False Precision)
  readonly parameters: RiskParameters;
  readonly domains: {
    readonly code: DomainRisk;
    readonly secrets: DomainRisk;
    readonly supply: DomainRisk;
    readonly infra: DomainRisk;
    readonly arch: DomainRisk;
  };
}

export interface RemediationCandidate {
  readonly id: string;
  readonly finding_id: string;
  readonly title: string;
  readonly target_file: string;
  readonly marginal_risk_reduction: number; // Delta R
  readonly effort_estimate: 'TRIVIAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  readonly effort_points: number;
  readonly priority_rank: number;
  readonly severed_paths_count: number;
}
