# RepoRisk — System Architecture & Component Specification

**Project:** RepoRisk  
**Author:** Antigravity (Senior Engineering Lead)  
**Approved by:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))  
**Document Status:** Complete (Phase 1 Refinement Deliverable)  
**Location:** `docs/architecture/ARCHITECTURE.md`  

---

## 1. Epistemic Classification of Architectural Statements

Statements within this architecture are classified as:
- **FACT:** Empirical runtime and technology properties.
- **DESIGN DECISION:** Deliberate architectural choices made by RepoRisk maintainers.
- **ASSUMPTION:** Engineering baselines subject to future benchmarking.
- **UNKNOWN:** Technical boundaries where static analysis cannot provide proof.

---

## 2. Core Architectural Design: The Typed Modular Monolith [DESIGN DECISION]

RepoRisk is designed as a **Typed Modular Monolith** implemented in TypeScript on Node.js (v20+ LTS).

### Rationale:
- **Elimination of Distributed Complexity [DESIGN DECISION]:** Avoids premature microservices, message broker failures, RPC latency, and complex deployment coordination.
- **Single-Binary & Container Ergonomics [DESIGN DECISION]:** A developer or CI pipeline can run the complete platform via a single CLI invocation (`reporisk scan`) without deploying multi-container clusters.
- **Strict Compile-Time Modularity [DESIGN DECISION]:** Subsystems interact exclusively through typed public interfaces, ensuring isolation without the operational penalty of network boundaries.

---

## 3. Subsystem Decomposition & Typed Contracts

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               REPORISK CORE MONOLITH                                   │
│                                                                                        │
│   ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐          │
│   │  Ingestion Engine  │───▶│ Topology Discovery │───▶│Scanner Orchestrator│          │
│   │(URL/Sandbox/Clone) │    │(Entrypoints/Trust) │    │ (Category A Tools) │          │
│   └────────────────────┘    └────────────────────┘    └─────────┬──────────┘          │
│                                                                 │                     │
│                                                                 ▼                     │
│   ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐          │
│   │ Remediation Engine │◀───│    Risk Engine     │◀───│Correlation Engine  │          │
│   │("Fix First" Rank)  │    │(Versioned Scoring) │    │(Attack/Fail Paths) │          │
│   └─────────┬──────────┘    └────────────────────┘    └─────────▲──────────┘          │
│             │                                                   │                     │
│             ▼                                         ┌─────────┴──────────┐          │
│   ┌────────────────────┐                              │Normalizer & Dedupe │          │
│   │ Report Serializer  │                              │(13-Field Schema)   │          │
│   │(Markdown/JSON/SARIF│                              └────────────────────┘          │
│   └────────────────────┘                                                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Subsystem Contracts [DESIGN DECISION]
1. **Ingestion Engine (`packages/core/src/ingestion/`):**
   Manages temporary sandbox allocation, shallow cloning (`--depth 1`), canonical path validation, and automatic cleanup.
2. **Topology Discovery (`packages/core/src/topology/`):**
   Parses manifests to detect languages, frameworks, entry points, and trust boundaries.
3. **Scanner Orchestrator (`packages/core/src/scanners/`):**
   Dispatches allowlisted Category A tools via direct argument vectors (`execFile`) with non-negotiable timeouts (120s) and memory caps. Zero shell interpolation.
4. **Findings Normalizer (`packages/core/src/findings/`):**
   Transforms tool outputs into the 13-field `CanonicalFinding` schema with deterministic SHA-256 fingerprint deduplication.
5. **Correlation Engine (`packages/core/src/correlation/`):**
   Constructs directed acyclic graphs for attack paths and failure paths with edge-level evidence.
6. **Risk Engine (`packages/core/src/risk/`):**
   Calculates the 5-domain explainable risk score ($0 - 100$) using versioned parameters (`model_version: "1.0.0-heuristic"`).
7. **Remediation Engine (`packages/core/src/remediation/`):**
   Ranks fixes by marginal risk reduction impact ($\Delta R$).
8. **Report Serializer (`packages/core/src/reports/`):**
   Emits high-density terminal ANSI output, Markdown audit reports (`REPORISK_AUDIT.md`), and JSON.

---

## 4. Internal Adversarial Architecture Review (Court Trial)

The proposed architecture was evaluated through an **internal adversarial trial** using the authentic upstream `court.py` engine:
- **Case Under Trial:** Proposed TypeScript/Node.js modular monolith CLI, Category A sandboxing, 13-field canonical schema, 5-domain explainable risk engine, and static-first untrusted code prohibition.
- **Review Summary:** Prosecution challenged local dependency friction, Node.js single-thread graph scaling, and static reachability blind spots. Defense demonstrated graceful scanner degradation, container distribution, bounded graph sizes, and non-negotiable ingestion safety.
- **Advisory Verdict:** The architecture survived the adversarial stress-test (advisory verdict: NOT GUILTY, 6 to 0).
- **Surviving Conditions & Mitigations [DESIGN DECISIONS]:**
  1. *Container Distribution:* An official container image will be published bundling all Category A tools to eliminate local machine dependency installation friction.
  2. *Doctor Command:* A `reporisk doctor` CLI command will be implemented to inspect the local PATH and report which scanners are ready.
  3. *Graph Boundedness:* The correlation engine will construct graphs strictly over normalized findings and topological boundaries, never over raw multi-million-token AST syntax trees.

*(Note: The internal trial is a design exercise, not objective mathematical proof of perfection).*

---

## 5. Technology Stack & Runtime Decisions [DESIGN DECISION]

- **Language & Runtime:** TypeScript v5+ on Node.js v20+ LTS. [FACT: Exceptional JSON/SARIF processing, cross-platform CLI support, async subprocess management].
- **Monorepo Architecture:** `pnpm` workspaces (`packages/core`, `packages/cli`).
- **Test Framework:** Vitest. [FACT: Native TypeScript support, fast execution, ESM compatibility].
- **CLI Framework:** Commander.js + Chalk + Ora + Cli-table3.
- **Storage Strategy:** In-memory execution pipeline with disk-persisted report artifacts. Embedded SQLite reserved for future multi-scan historical tracking. Zero external database or cache servers required for Core MVP.
