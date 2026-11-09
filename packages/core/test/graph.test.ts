import { describe, it, expect } from 'vitest';
import {
  calculatePathClassification,
  type PathEdge
} from '../src/index.js';

describe('Graph Correlation & Edge-Level Evidence Invariants', () => {
  it('classifies a path as CONFIRMED only if every edge is CONFIRMED', () => {
    const edges: PathEdge[] = [
      {
        sourceNodeId: 'entry-1',
        targetNodeId: 'middleware-1',
        relationship: 'ROUTES_TO',
        classification: 'CONFIRMED'
      },
      {
        sourceNodeId: 'middleware-1',
        targetNodeId: 'finding-1',
        relationship: 'CALLS_VULNERABLE_FN',
        classification: 'CONFIRMED'
      }
    ];

    expect(calculatePathClassification(edges)).toBe('CONFIRMED');
  });

  it('downgrades path classification to INFERRED if any edge is INFERRED', () => {
    const edges: PathEdge[] = [
      {
        sourceNodeId: 'entry-1',
        targetNodeId: 'middleware-1',
        relationship: 'ROUTES_TO',
        classification: 'CONFIRMED'
      },
      {
        sourceNodeId: 'middleware-1',
        targetNodeId: 'finding-1',
        relationship: 'IMPORTS_PACKAGE',
        classification: 'INFERRED'
      }
    ];

    expect(calculatePathClassification(edges)).toBe('INFERRED');
  });

  it('downgrades path classification to HYPOTHETICAL if any edge is HYPOTHETICAL', () => {
    const edges: PathEdge[] = [
      {
        sourceNodeId: 'entry-1',
        targetNodeId: 'middleware-1',
        relationship: 'ROUTES_TO',
        classification: 'CONFIRMED'
      },
      {
        sourceNodeId: 'middleware-1',
        targetNodeId: 'finding-1',
        relationship: 'SPECULATIVE_ACCESS',
        classification: 'HYPOTHETICAL'
      }
    ];

    expect(calculatePathClassification(edges)).toBe('HYPOTHETICAL');
  });

  it('treats empty edge paths as HYPOTHETICAL', () => {
    expect(calculatePathClassification([])).toBe('HYPOTHETICAL');
  });
});
