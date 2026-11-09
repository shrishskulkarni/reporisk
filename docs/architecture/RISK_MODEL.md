# RepoRisk — Risk Engine, Edge-Level Correlation & Calibration Methodology

**Project:** RepoRisk  
**Author:** Antigravity (Senior Engineering Lead)  
**Approved by:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))  
**Document Status:** Complete (Phase 1 Refinement Deliverable)  
**Location:** `docs/architecture/RISK_MODEL.md`  

---

## 1. Epistemic Taxonomy: Classification of Statements

To prevent speculative heuristics from being mistaken for verified truths, all risk modeling principles are categorized into four explicit epistemic tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   EPISTEMIC TAXONOMY                                   │
├────────────────────┬───────────────────────────────────────────────────────────────────┤
│ FACT               │ Verified empirical truth (e.g., scanner output, canonical file    │
│                    │ paths, deterministic AST node matches, SHA-256 commit hashes).    │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ DESIGN DECISION    │ Deliberate engineering choices chosen by RepoRisk maintainers     │
│                    │ (e.g., modular monolith, 13-field schema, initial domain weights).│
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ ASSUMPTION         │ Plausible baseline hypotheses requiring future empirical testing  │
│                    │ (e.g., assumption that secrets in CI workflows carry higher       │
│                    │ exploitability than secrets in documentation files).              │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ UNKNOWN            │ Acknowledged gaps where static analysis cannot provide proof      │
│                    │ (e.g., whether a leaked token is active without querying live API;│
│                    │ whether an unexported function is reachable via dynamic routing). │
└────────────────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 2. Risk Engine Architecture & Versioned Calibration

### 2.1 The Principle of No False Precision [DESIGN DECISION]
RepoRisk rejects arbitrary decimal precision (e.g., claiming a repository is "73.48% vulnerable"). Complex mathematical formulas must never be used to mask heuristic uncertainty. Scores are integers ($0 - 100$) accompanied by an explicit breakdown of driving findings.

### 2.2 Versioned Scoring Parameters [DESIGN DECISION]
The risk model is explicitly versioned (`model_version: "1.0.0-heuristic"`). Every scan report embeds the exact parameter manifest used in its calculation:
- `model_version`: Semantic version of the risk algorithm.
- `domain_weights`: The five domain weights.
- `saturation_constants`: Normalization curves.

**Future Calibration Compatibility:**  
As empirical benchmark datasets (Phase 11) inform weight adjustments, the risk model version will increment (`2.0.0-calibrated`). Historical reports can be deterministically re-evaluated under newer or older model versions because the raw 13-field findings and edge evidences are preserved immutably.

---

## 3. The 5-Domain Risk Model (Initial Heuristics)

The Overall Repository Risk Score ($R_{\text{repo}} \in [0, 100]$) is computed from five domains:

$$R_{\text{repo}} = \text{round}\left(w_{\text{code}} R_{\text{code}} + w_{\text{secrets}} R_{\text{secrets}} + w_{\text{supply}} R_{\text{supply}} + w_{\text{infra}} R_{\text{infra}} + w_{\text{arch}} R_{\text{arch}}\right)$$

### 3.1 Initial Domain Weights [DESIGN DECISION / HEURISTIC]
*(These initial weights represent deliberate engineering baselines, NOT empirically validated constants. They will be calibrated in Phase 11).*
- $w_{\text{code}} = 0.25$ (Application Code Vulnerabilities)
- $w_{\text{secrets}} = 0.25$ (Secrets & Credential Exposure)
- $w_{\text{supply}} = 0.20$ (Software Supply Chain & Dependencies)
- $w_{\text{infra}} = 0.15$ (Infrastructure-as-Code & CI/CD Pipelines)
- $w_{\text{arch}} = 0.15$ (Architectural & Operational Reliability)

$$\sum w_j = 0.25 + 0.25 + 0.20 + 0.15 + 0.15 = 1.00$$

### 3.2 Individual Finding Raw Value $r_i$ [DESIGN DECISION]
For any finding $i$:
$$r_i = S(i) \times C(i) \times E(i) \times A(i) \times P(i)$$

- **Severity $S(i)$:** `CRITICAL: 10`, `HIGH: 7`, `MEDIUM: 4`, `LOW: 2`, `INFO: 0.5`
- **Confidence $C(i)$:** `CONFIRMED: 1.0`, `LIKELY: 0.8`, `POTENTIAL: 0.5`, `INFORMATIONAL: 0.2`
- **Exposure $E(i)$:** `Public Ingress: 1.5`, `Authenticated: 1.0`, `Internal: 0.6` [ASSUMPTION]
- **Asset Criticality $A(i)$:** `Crown Jewels (DB/CI): 2.0`, `Core Logic: 1.3`, `Utility: 0.6` [ASSUMPTION]
- **Path Multiplier $P(i)$:** $1.0 + 0.5 \times N_{\text{confirmed\_paths}}(i) + 0.2 \times N_{\text{inferred\_paths}}(i)$

### 3.3 Domain Saturation Curve [DESIGN DECISION]
$$R_{\text{domain}} = 100 \times \left(1 - \exp\left(-\frac{\sum r_i}{K_{\text{domain}}}\right)\right)$$
Where $K_{\text{domain}} = 15.0$ (Heuristic scaling factor preventing finding count blowout while ensuring a single confirmed Critical finding dominates the domain).

---

## 4. Formalized Attack Path Model (Edge-Level Evidence)

An Attack Path is a directed acyclic graph (DAG) representing a potential multi-stage exploit chain.

> **CRITICAL STANDARD:**  
> **A hypothetical or inferred chain must NEVER be labeled as a confirmed exploit. Evidence must be attached to individual graph edges, not merely asserted as a summary confidence on the final path.**

### 4.1 Edge Classification & Evidence Standards
Every edge $e = (u, v)$ connecting two findings or topological nodes must satisfy strict evidence requirements:

```typescript
export interface PathEdge {
  sourceNodeId: string;
  targetNodeId: string;
  relationship: string;               // e.g., "PASSES_PARAMETER", "TRIGGERS_WORKFLOW", "READS_SECRET"
  classification: EdgeClassification;  // CONFIRMED | INFERRED | HYPOTHETICAL
  evidence?: {
    evidenceType: "CALL_GRAPH" | "EXACT_STRING_MATCH" | "TOPOLOGICAL_PROXIMITY" | "SPECULATIVE";
    sourceLocation: { file: string; line: number };
    verbatimSnippet: string;
    rationale: string;
  };
}

export type EdgeClassification = 
  | "CONFIRMED"     // Verifiable code dataflow or manifest link (e.g. route handler explicitly passes input to sink)
  | "INFERRED"      // Structurally probable (e.g. entry-point service imports vulnerable module, but taint path not proven)
  | "HYPOTHETICAL"; // Contextual possibility (e.g. leaked key might belong to the cloud infrastructure)
```

### 4.2 Path-Level Classification Invariant [DESIGN DECISION]
The overall classification of a path $P = (e_1, e_2, \dots, e_m)$ is governed by the **weakest link**:
$$\text{PathClassification}(P) = \min_{k=1\dots m} \left( \text{Classification}(e_k) \right)$$
- **CONFIRMED ATTACK PATH:** **Every single edge** in the path is `CONFIRMED` with verifiable call-graph or manifest evidence.
- **INFERRED ATTACK PATH:** Contains at least one `INFERRED` edge, but zero `HYPOTHETICAL` edges.
- **HYPOTHETICAL ATTACK PATH:** Contains one or more `HYPOTHETICAL` edges. (Must be explicitly labeled as speculative).

---

## 5. Formalized Failure Path Model (Operational Reliability)

> **CRITICAL STANDARD:**  
> **A missing resilience mechanism does NOT prove an outage will occur. A missing circuit breaker is an architectural vulnerability, not guaranteed downtime.**

### 5.1 Failure Edge Evidence Requirements
- **`CONFIRMED_DEPENDENCY`:** Static import or configuration proves that Service A synchronously calls Service B (e.g., direct HTTP client call in synchronous request handler without timeout).
- **`INFERRED_DEPENDENCY`:** Service A declares a client library for Service B, but the execution context (synchronous vs asynchronous background task) is not statically proven.
- **`HYPOTHETICAL_FAILURE`:** Modeling the downstream effect if an external service experiences an outage.

### 5.2 Failure Path Representation
```text
[External OAuth Provider] 
         │ 
         ▼ (Edge 1: CONFIRMED_DEPENDENCY — Synchronous HTTP call in auth_middleware.py:42)
[Missing Circuit Breaker / Timeout] 
         │ 
         ▼ (Edge 2: INFERRED_IMPACT — Thread pool exhaustion if external latency > 30s)
[Gateway Thread Pool Starvation]
```
*Report Label:* `Architectural Vulnerability: High-Risk Synchronous Dependency (Inferred Impact)`.

---

## 6. Remediation Intelligence ("Fix First")

RepoRisk prioritizes fixes by **Marginal Risk Reduction ($\Delta R$)** per unit effort:

$$\Delta R(k) = R_{\text{repo}} - R_{\text{repo} \setminus \{k\}}$$
$$\text{Priority Rank}(k) = \frac{\Delta R(k)}{\text{Effort}(k)}$$

Where $\text{Effort} \in \{ \text{Trivial: } 1, \text{Low: } 2, \text{Medium: } 5, \text{High: } 10 \}$ [HEURISTIC].

**Developer Guidance:**
The output explicitly connects remediation to graph severance:
*"Fixing item #1 (modifying workflow permissions in `.github/workflows/deploy.yml`) severs 2 Inferred Attack Paths and reduces Overall Risk by 18 points."*
