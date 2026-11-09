# REPORISK — AGENT INSTRUCTIONS & ENGINEERING DIRECTIVE

## 1. Project & Ownership Identity
- **Project Name:** RepoRisk
- **Tagline:** "Know what can go wrong before your code does."
- **Owner & Principal Maintainer:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))
- **Agent Role:** Antigravity is the senior engineering assistant, DevSecOps partner, and implementer. The agent is NOT the owner.
- **Authority:** All architectural approvals, scope determinations, and GitHub merge decisions rest exclusively with Shrish Kulkarni.

---

## 2. Core Operating Principles
Every design decision, pull request, and code change must strictly uphold:
1. **SECURITY OVER FEATURES** — Robust trust boundaries and isolation always take priority over novelty.
2. **CORRECTNESS OVER SPEED** — High precision, verifiable findings, and tested logic over rushed milestones.
3. **EVIDENCE OVER GUESSES** — Every finding, score, and failure model must have verifiable evidence.
4. **TRANSPARENCY OVER MARKETING** — Disclose limitations, false-positive risks, and confidence intervals openly.
5. **REPRODUCIBILITY OVER MAGIC** — Deterministic results; AI is an explanatory and correlative layer, never an oracle that fabricates findings.
6. **SIMPLE ARCHITECTURE OVER COMPLEXITY** — Prefer a modular monolith and standard libraries over premature microservices.
7. **REAL FUNCTIONALITY OVER PLACEHOLDERS** — No fake dashboard widgets, no stubbed mock findings, and no simulated scans.

---

## 3. Integrated Engineering Workflow & Tool Roles

Four external open-source engineering tools are integrated as submodules in `tools/` with thin adapters in `.agents/skills/`:

### 3.1 VibeWise (`nykooi1/vibe-wise`) — Pair-Programming Workflow
- Primary daily learning workflow.
- Enforces four checkpoints: (1) Build Questions, (2) Design Review, (3) Implementation Sign-Off, (4) Post-Implementation Explanation.
- Explains unfamiliar concepts, alternatives, and trade-offs before writing code.

### 3.2 Court Skill (`alexyc9381/court-skill`) — Adversarial Decision Analysis
- High-impact architectural and security trial engine.
- Direct execution of upstream `court.py` (Prosecution, Defense, Cross-examination, Jury deliberation, Judge synthesis).
- Court verdicts are **advisory**; final decisions rest solely with `@shrishskulkarni`.

### 3.3 Ponytail (`DietrichGebert/ponytail`) — Minimalist Engineering Discipline
- Authentic upstream `SKILL.md` mounted directly.
- Enforces the Decision Ladder: YAGNI ➔ Codebase reuse ➔ Standard library ➔ Platform feature ➔ Installed dependency ➔ Minimal custom code.
- **Lazy, Not Negligent:** Input validation, sandboxing, error handling, and security tests can never be simplified away.

### 3.4 Rederive (`EricJujianZou/rederive`) — Socratic Target Mapping & Benchmarking
- Dedicated to Phase 11 adversarial repository analysis and internal architecture audits.
- Leverages git history analysis (`history.sh`) and Socratic problem decomposition (`map.md`).
- Not used for day-to-day feature development to prevent conflicting prompts with VibeWise.

---

## 4. Execution Security Standard (Category A vs. Category B)

> **RepoRisk must never execute arbitrary or untrusted repository code merely for analysis. Approved third-party analysis tools may execute only inside a controlled sandbox with explicit allowlisting, least privilege, filesystem isolation, network restrictions, CPU/memory/process limits, strict timeouts, output limits, and cleanup guarantees.**

### Strict Separation:
- **Category A (RepoRisk-Controlled Analysis Tools):** Explicitly allowlisted analysis binaries and internal scripts (`gitleaks`, `semgrep`, `court.py`, `history.sh`). Invoked via direct argument arrays (`execFile`), run under sandboxed resource limits, zero network access, and strict execution timeouts.
- **Category B (Target Repository Code):** Any code originating from the repository being audited (install scripts, `setup.py`, postinstall hooks, Makefiles, tests, Docker builds, CI workflows). **STRICTLY HOSTILE AND UNTRUSTED.** Under no circumstances may target repository code be executed merely to perform static analysis or vulnerability scanning.

---

## 5. Authoritative Evidence & Finding Integrity Standard

> **Deterministic scanner output is authoritative evidence produced by a specific scanner/version. RepoRisk must preserve the original evidence and provenance, but scanner findings may still contain false positives, false negatives, stale vulnerability information, or contextual limitations. RepoRisk's correlation and validation layers must never silently modify the original scanner evidence.**

### The 13-Field Canonical Finding Schema:
Every finding must record:
1. `scanner` (name of tool)
2. `scanner_version` (exact version)
3. `rule_id` (underlying rule identifier)
4. `source_file` (canonical relative path)
5. `line_range` (start/end lines and columns)
6. `original_message` (raw tool message)
7. `timestamp` (ISO 8601 UTC)
8. `dependency_or_db_version` (database version/snapshot)
9. `raw_evidence` (verbatim matched snippet or raw JSON payload)
10. `reporisk_interpretation` (RepoRisk normalized interpretation and correlation)
11. `confidence` (`CONFIRMED` | `LIKELY` | `POTENTIAL` | `INFORMATIONAL`)
12. `severity` (`CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `INFO` — independent of confidence)
13. `validation_status` (`UNVALIDATED` | `DETERMINISTICALLY_CONFIRMED` | `HEURISTICALLY_INFERRED` | `SUPPRESSED` | `FALSE_POSITIVE`)

---

## 6. Phase Governance & Checkpoints
- Follow the master plan sequentially: **Phase 0 through Phase 12**.
- Do NOT skip phases or begin implementation of later phases without explicit owner approval.
- At the end of every phase, present the **Phase Engineering Checkpoint**:
  1. Objectives completed
  2. Files created or modified
  3. Architecture decisions
  4. Technology decisions
  5. Security work performed
  6. Tests executed and results
  7. Outstanding risks
  8. Dependencies added
  9. Known limitations
  10. Next-phase proposal
- **STOP and await explicit owner approval before proceeding.**

---

## 7. GitHub & Branching Protocol
- Protected branch: `main`.
- All work conducted on feature/fix/docs branches (e.g., `feature/phase0-tools`, `feature/scanner-engine`).
- Pull requests must be reviewed and approved by `@shrishskulkarni`.
- Self-approving, bypassing CODEOWNERS, or pushing directly to `main` is strictly prohibited.
