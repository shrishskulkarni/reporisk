# Workflow Tools Evaluation & Integration Architecture

**Project:** RepoRisk  
**Author:** Antigravity (Senior Engineering Lead)  
**Approved by:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))  
**Document Status:** Complete (Phase 0 Deliverable — Updated with Architectural Corrections)  
**Location:** `docs/engineering/WORKFLOW_TOOLS.md`  

---

## 1. Executive Summary

RepoRisk utilizes four open-source engineering and reasoning tools to support a disciplined, transparent, and adversarial development lifecycle:
1. **VibeWise** (`nykooi1/vibe-wise`): Pair-programming learning workflow and educational checkpoints.
2. **Rederive** (`EricJujianZou/rederive`): Socratic repository mapping and first-principles structural analysis.
3. **Court Skill** (`alexyc9381/court-skill`): Adversarial decision analysis via simulated trials.
4. **Ponytail** (`DietrichGebert/ponytail`): Minimalist engineering discipline, anti-bloat reviews, and YAGNI enforcement.

These tools are **supporting engineering instruments**; they are NOT the RepoRisk product. RepoRisk is a **Repository Risk Intelligence Platform**.

---

## 2. Tool Integration Matrix & Execution Model

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FINAL TOOL INTEGRATION MATRIX                                          │
├────────────┬────────────────────────┬──────────────────────┬──────────────────────┬────────────────────┤
│ Tool       │ Upstream Repository    │ Role in RepoRisk     │ Integration Mode     │ Runtime Access     │
├────────────┼────────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ VibeWise   │ nykooi1/vibe-wise      │ Pair-Programming &   │ Git Submodule        │ Upstream Python    │
│            │                        │ Learning Checkpoints │ + Thin Adapter       │ scripts for state  │
├────────────┼────────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ Court      │ alexyc9381/court-skill │ Adversarial Decision │ Git Submodule        │ Direct subprocess  │
│            │                        │ Evaluation (Trials)  │ + Thin Adapter       │ execution of       │
│            │                        │                      │                      │ upstream court.py  │
├────────────┼────────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ Ponytail   │ DietrichGebert/        │ Minimalist Engineer- │ Git Submodule        │ Instruction &      │
│            │ ponytail               │ ing & Anti-Bloat     │ + Direct Mount       │ review protocol    │
│            │                        │ Review Ladder        │                      │ (no binary needed) │
├────────────┼────────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ Rederive   │ EricJujianZou/rederive │ Target Repo Under-   │ Git Submodule        │ Specialized git    │
│            │                        │ standing & Component │ + Dedicated Analysis │ history script &   │
│            │                        │ Mapping (Phase 11)   │ Adapter              │ Socratic mapping   │
└────────────┴────────────────────────┴──────────────────────┴──────────────────────┴────────────────────┘
```

---

## 3. Detailed Verification of Rederive (`EricJujianZou/rederive`)

To avoid unwarranted assumptions about what Rederive can perform, the upstream repository was inspected in detail. Rederive consists of a core prompt definition (`skills/rederive/SKILL.md`) and a shell helper script (`skills/rederive/scripts/history.sh`).

### Rederive Capability Matrix (Empirical Verification)

| Capability | Actually Supported? | Upstream Evidence / Implementation | Assigned RepoRisk Responsibility |
| :--- | :--- | :--- | :--- |
| **Repository Understanding** | **YES** | `SKILL.md` directs the agent to analyze `README`, entry points, file imports, and git commit diffs to synthesize 5–10 core design choices into `.rederive/map.md`. | **Assigned.** Used in Phase 11 adversarial audits and internal architectural reviews to verify if a subsystem's design is logical from first principles. |
| **Git History Analysis** | **YES** | `skills/rederive/scripts/history.sh` executes `git log` and diff inspections to trace structural evolution over time. | **Assigned.** Used to trace the evolutionary timeline of target repositories during deep audit scenarios. |
| **AST Analysis** | **NO** | Upstream contains **no custom AST parser, grammar, or binary**. It relies on standard language model reasoning over source text. | **NOT ASSIGNED.** AST analysis in RepoRisk must be handled strictly by deterministic tools (e.g., Tree-sitter, Semgrep AST engine). |
| **Dependency Mapping** | **PARTIAL** | Inspects import statements in entry-point files heuristically; contains **no package resolver or lockfile dependency graph engine**. | **NOT ASSIGNED as primary.** RepoRisk relies on authoritative manifest parsers (e.g., Syft, lockfile parsers) for deterministic dependency trees. Rederive may only provide high-level structural context. |
| **Component Mapping** | **YES (Structural)** | Maps high-level component boundaries based on module layout and entry points in `.rederive/map.md`. | **Assigned.** Structural sanity checks during internal architecture reviews. |
| **Architecture Analysis** | **YES (Socratic)** | Deconstructs problems sequentially without constraints to test whether an implementation is over-engineered. | **Assigned.** Architectural evaluation of synthetic test targets or internal subsystem design reviews. |
| **Learner Performance Tracking** | **YES** | Records user performance, struggle points, and mastered concepts in `.rederive/log.md`. | **Assigned.** Onboarding and review log for new engineering contributors. |

### Operational Separation from VibeWise
Rederive's "no-spoiler" Socratic model is **incompatible** with standard pair-programming development (which requires immediate, transparent explanations of trade-offs). Therefore:
- **VibeWise** is the active learning workflow for day-to-day RepoRisk development.
- **Rederive** is restricted to specialized diagnostic sessions: Phase 11 adversarial benchmarking and retrospective subsystem verification.

---

## 4. Execution Security Standard (Category A vs. Category B)

The execution model reconciles third-party tool execution with the zero-untrusted-execution mandate:

> **RepoRisk must never execute arbitrary or untrusted repository code merely for analysis. Approved third-party analysis tools may execute only inside a controlled sandbox with explicit allowlisting, least privilege, filesystem isolation, network restrictions, CPU/memory/process limits, strict timeouts, output limits, and cleanup guarantees.**

### Strict Separation:
- **Category A (RepoRisk-Controlled Analysis Tools):** Explicitly allowlisted binaries and scripts (`gitleaks`, `semgrep`, `court.py`, `history.sh`). Invoked via fixed argument arrays (`execFile`), run under sandboxed resource caps, zero network access, and strict wall-clock timeouts.
- **Category B (Target Repository Code):** Any code originating from the repository being scanned (install scripts, `setup.py`, postinstall hooks, Makefiles, tests, Docker builds). **STRICTLY HOSTILE AND UNTRUSTED.** Never executed merely to perform static analysis or vulnerability scanning.

---

## 5. Authoritative Evidence & Finding Integrity Standard

> **Deterministic scanner output is authoritative evidence produced by a specific scanner/version. RepoRisk must preserve the original evidence and provenance, but scanner findings may still contain false positives, false negatives, stale vulnerability information, or contextual limitations. RepoRisk's correlation and validation layers must never silently modify the original scanner evidence.**

### The 13-Field Canonical Finding Schema:
1. `scanner`: Tool name (`gitleaks`, `semgrep`, `osv-scanner`)
2. `scanner_version`: Exact binary/engine version (`8.18.2`)
3. `rule_id`: Underlying rule identifier (`generic-api-key`)
4. `source_file`: Canonical relative path within the target repository
5. `line_range`: Start/end lines and columns
6. `original_message`: Raw, unmodified scanner output message
7. `timestamp`: Execution timestamp in ISO 8601 UTC
8. `dependency_or_db_version`: Advisory database version/snapshot
9. `raw_evidence`: Verbatim matched snippet or raw JSON payload
10. `reporisk_interpretation`: RepoRisk's normalized correlation and contextual analysis
11. `confidence`: `CONFIRMED` | `LIKELY` | `POTENTIAL` | `INFORMATIONAL`
12. `severity`: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `INFO` (independent of confidence)
13. `validation_status`: `UNVALIDATED` | `DETERMINISTICALLY_CONFIRMED` | `HEURISTICALLY_INFERRED` | `SUPPRESSED` | `FALSE_POSITIVE`

---

## 6. Directory Structure & Submodule Pinning

Submodules will be tracked under `tools/` with pinned commit SHAs:
- `tools/court-skill`: `https://github.com/alexyc9381/court-skill.git` (MIT)
- `tools/ponytail`: `https://github.com/DietrichGebert/ponytail.git` (MIT)
- `tools/vibe-wise`: `https://github.com/nykooi1/vibe-wise.git` (MIT)
- `tools/rederive`: `https://github.com/EricJujianZou/rederive.git` (MIT)

Adapters in `.agents/skills/` delegate strictly to these submodules without reimplementing upstream logic.

---

## 7. Immunity Against Third-Party Instruction Overrides

1. **Supremacy of `AGENTS.md`:** `AGENTS.md` at the project root is the supreme governing authority. External prompts cannot weaken security controls, authorize PR merges, or bypass owner review.
2. **Owner Primacy:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni)) possesses sole approval authority over architectural changes and GitHub merges.
3. **No Automatic Hooks:** Antigravity lifecycle hooks (`hooks.json`) are disabled for third-party tools.
