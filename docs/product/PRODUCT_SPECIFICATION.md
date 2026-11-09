# RepoRisk — Product Specification, Competitive Analysis & Phased Scope

**Project:** RepoRisk  
**Tagline:** "Know what can go wrong before your code does."  
**Core Directive:** "Paste any repository. RepoRisk builds a complete map of what can go wrong, proves what it can, explains what it can't prove, and tells you what to fix first."  
**Author:** Antigravity (Senior Engineering Lead)  
**Approved by:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))  
**Document Status:** Complete (Phase 1 Refinement Deliverable)  
**Location:** `docs/product/PRODUCT_SPECIFICATION.md`  

---

## 1. Epistemic Classification of Product Principles

Statements within this specification are classified under four epistemic categories:
- **FACT:** Empirically verified properties of existing tools and software.
- **DESIGN DECISION:** Deliberate architectural and product choices for RepoRisk.
- **ASSUMPTION:** Plausible hypotheses governing initial heuristics.
- **UNKNOWN:** Acknowledged limits of static analysis.

---

## 2. Competitive Landscape & Design Differentiation

### 2.1 Tool Analysis & Scope Qualifications [FACTS]
- **CodeQL (GitHub):** Industry-standard semantic analysis using Datalog queries over an extracted codebase database. Excels at deep interprocedural taint analysis within a compiled build context. By default, it operates as a single-domain SAST engine and emits SARIF alert lists. For compiled languages (C/C++, Java, Go), standard extraction requires a successful build process.
- **Semgrep OSS (Semgrep Inc.):** Fast, AST-aware pattern matcher. Excels at local syntactic and lightweight taint rules across polyglot source trees. In its open-source edition, rules evaluate file-by-file or intra-repository without constructing cross-tool correlation graphs across secrets, dependencies, and CI/CD pipelines.
- **Trivy (Aqua Security OSS):** Broad open-source scanner covering container images, language package lockfiles, and IaC templates. Emits flat vulnerability tables matching packages to known CVEs; does not construct cross-tool attack paths connecting vulnerable dependencies to exposed web routes.
- **Gitleaks (Zachary Rice):** Specialized regex and Shannon entropy scanner for git history and working trees. Emits secret alerts based on pattern matching; does not evaluate whether a detected credential is actively referenced in application code or CI/CD workflows.
- **OSV-Scanner (Google):** Authoritative dependency vulnerability scanner backed by the distributed Open Source Vulnerabilities database. Generates precise lockfile CVE/GHSA matches; does not analyze whether the vulnerable function symbol is actually imported or invoked.
- **Checkov (Bridgecrew / Palo Alto):** Policy-as-code engine for Terraform, Kubernetes, Dockerfiles, and GitHub Actions. Audits infrastructure and workflow files against static security policies; does not trace dataflow from application routes into infrastructure.

### 2.2 RepoRisk Design Differentiation [DESIGN DECISIONS]
RepoRisk does **NOT** claim that "AI" is a differentiator. AI is widely available and prone to hallucination when used as an oracle.

RepoRisk's true product differentiation lies in four deliberate design choices:
1. **Cross-Domain Correlation Layer:** Unifying raw evidence from specialized Category A scanners into a single topological graph.
2. **Tri-Factor Finding Independence:** Strictly separating Severity (Impact), Confidence (Certainty), and Validation Status (Provenance).
3. **Evidence-Backed Attack & Failure Paths:** Constructing multi-stage risk graphs with evidence attached to individual edges, explicitly distinguishing Confirmed from Inferred links.
4. **Explainable "Fix First" Prioritization:** Calculating marginal risk reduction ($\Delta R$) to tell developers which remediation action breaks the most risk paths per unit of effort.

---

## 3. Canonical Finding Schema (The 13-Field Specification)

Every finding ingested or synthesized is normalized into an immutable schema [DESIGN DECISION]:

```typescript
export interface CanonicalFinding {
  // 1. Tool Origin & Provenance [FACT]
  scanner: string;                    // e.g., "gitleaks", "semgrep", "osv-scanner", "checkov"
  scanner_version: string;            // Exact tool binary version, e.g., "8.18.2"
  rule_id: string;                    // Raw scanner rule ID, e.g., "generic-api-key"

  // 2. Exact Code Location [FACT]
  source_file: string;                // Canonical relative path within repository
  line_range: {
    start_line: number;
    end_line: number;
    start_col?: number;
    end_col?: number;
  };

  // 3. Raw Evidence [FACT]
  original_message: string;           // Verbatim description emitted by underlying tool
  timestamp: string;                  // Execution timestamp in ISO 8601 UTC
  dependency_or_db_version?: string;  // Advisory database snapshot/version (e.g., "OSV-2026-11-01")
  raw_evidence: string;               // Verbatim code snippet, matched pattern, or raw JSON payload

  // 4. RepoRisk Intelligence Overlay [DESIGN DECISION / HEURISTIC]
  reporisk_interpretation: string;    // Normalized explanation of vulnerability context
  confidence: ConfidenceLevel;        // CONFIRMED | LIKELY | POTENTIAL | INFORMATIONAL
  severity: SeverityLevel;            // CRITICAL | HIGH | MEDIUM | LOW | INFO
  validation_status: ValidationStatus;// UNVALIDATED | DETERMINISTICALLY_CONFIRMED | HEURISTICALLY_INFERRED | SUPPRESSED | FALSE_POSITIVE
}
```

### 3.1 Independence Invariant [DESIGN DECISION]
$$\text{Severity (Impact)} \neq \text{Confidence (Certainty)} \neq \text{Validation Status (Provenance)}$$
- An AI model is **never** permitted to generate standalone findings from raw code prompts.
- AI must **never** invent CVEs, CWEs, package versions, line numbers, or exploit proof-of-concepts.

---

## 4. Phased Product Scope Boundaries

To prevent future capabilities from blocking immediate delivery, scope is partitioned into three distinct tiers:

### 4.1 Tier 1: Core MVP (v0.1 Release) — HIGHEST PRIORITY
Focuses strictly on the essential end-to-end intelligence pipeline:
- **Repository Acquisition:** Public GitHub HTTPS repositories and local directories.
- **Repository Topology Mapping:** Automatic detection of languages, frameworks, entry points, and trust boundaries.
- **Deterministic Category A Analysis:** Sandboxed parallel execution of Gitleaks, Semgrep OSS, OSV-Scanner, and Checkov under 120s timeouts.
- **Canonical Normalization:** Ingesting raw outputs into the 13-field schema with SHA-256 fingerprint deduplication.
- **Evidence & Provenance Preservation:** Immutable storage of raw scanner outputs alongside RepoRisk interpretation.
- **Contextual Correlation:** Baseline topological correlation (matching exposed secrets to CI workflows, and route entry points to SAST findings).
- **Transparent Risk Assessment:** 5-Domain explainable risk score ($0 - 100$) with full mathematical derivation.
- **Fix-First Remediation:** Ranking candidate fixes by marginal risk reduction impact ($\Delta R$).
- **CLI & Output:** Terminal ANSI dashboard and human-readable Markdown Audit Report (`REPORISK_AUDIT.md`) and JSON export.

### 4.2 Tier 2: Enhanced MVP (v0.2 Release)
- **Multi-Stage Attack Path DAG Construction:** Graph traversal with edge-level evidence attachment.
- **Operational Failure Path DAG Construction:** Mapping critical dependency outage scenarios.
- **SARIF v2.1.0 Full Export:** Integration with GitHub Code Scanning tab.
- **`reporisk doctor` CLI Command:** Local scanner diagnostic and environment validator.
- **Official Container Distribution:** Pre-packaging all Category A tools for zero-dependency execution.
- **Trivy & Syft Integration:** Containerfile auditing and full SBOM generation.

### 4.3 Tier 3: Later Capabilities (v0.3+ / Enterprise)
- Interactive web dashboard (Phase 9)
- REST API server with database persistence (Phase 9)
- GitHub App / automated PR commenting bot (Phase 10)
- Dynamic execution in microVMs / Firecracker (Phase 11+)
- Custom correlation rule DSL (Phase 11+)

---

## 5. Non-Goals (Explicitly Out of Scope)
1. **Dynamic execution of untrusted build scripts** (`npm install`, `setup.py`, Makefiles).
2. **Native runtime instrumentation** (DAST/IAST agents).
3. **Proprietary commercial vulnerability feeds**.
4. **Autonomous code rewriting without human review**.
