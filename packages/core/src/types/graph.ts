/**
 * Graph Correlation, Edge-Level Evidence, and Path Models
 *
 * Epistemic Classification: DESIGN DECISION
 */

export type EdgeClassification = 'CONFIRMED' | 'INFERRED' | 'HYPOTHETICAL';

export type PathClassification = 'CONFIRMED' | 'INFERRED' | 'HYPOTHETICAL';

export type EvidenceType =
  | 'CALL_GRAPH'
  | 'EXACT_STRING_MATCH'
  | 'TOPOLOGICAL_PROXIMITY'
  | 'SPECULATIVE';

export interface EdgeEvidence {
  readonly evidenceType: EvidenceType;
  readonly sourceLocation: {
    readonly file: string;
    readonly line: number;
  };
  readonly verbatimSnippet: string;
  readonly rationale: string;
}

export interface PathEdge {
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly relationship: string;
  readonly classification: EdgeClassification;
  readonly evidence?: EdgeEvidence | undefined;
}

export interface AttackPath {
  readonly id: string;
  readonly title: string;
  readonly entryPoint: string;
  readonly targetAsset: string;
  readonly edges: readonly PathEdge[];
  readonly classification: PathClassification; // Governed by weakest edge
}

export interface FailurePath {
  readonly id: string;
  readonly title: string;
  readonly sourceService: string;
  readonly failureMode: string;
  readonly edges: readonly PathEdge[];
  readonly architecturalVulnerability: string;
}

/**
 * Path-Level Classification Invariant:
 * The overall classification of a path is governed by its weakest link:
 * CONFIRMED: Every edge is CONFIRMED.
 * INFERRED: Has INFERRED edges, zero HYPOTHETICAL edges.
 * HYPOTHETICAL: Contains at least one HYPOTHETICAL edge.
 */
export function calculatePathClassification(edges: readonly PathEdge[]): PathClassification {
  if (edges.length === 0) {
    return 'HYPOTHETICAL';
  }

  let hasInferred = false;
  for (const edge of edges) {
    if (edge.classification === 'HYPOTHETICAL') {
      return 'HYPOTHETICAL';
    }
    if (edge.classification === 'INFERRED') {
      hasInferred = true;
    }
  }

  return hasInferred ? 'INFERRED' : 'CONFIRMED';
}
