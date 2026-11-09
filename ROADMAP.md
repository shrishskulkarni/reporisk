# RepoRisk Product Roadmap

This roadmap outlines the planned development trajectory of the RepoRisk platform, partitioned into three discrete scope tiers to maintain velocity and architectural rigor.

---

## Tier 1: Core MVP (v0.1 Release) — Current Milestone

The Core MVP delivers the foundational end-to-end Repository Risk Intelligence pipeline as a standalone developer CLI.

### Capabilities & Deliverables
- [x] **Phase 0 — Tool Integration & Infrastructure:** Pinned integration of authentic upstream tools, sandboxing architecture, and repository hygiene.
- [x] **Phase 1 — Product Research & Architecture:** Canonical 13-field finding schema, tri-factor independence, 5-domain versioned risk model, STRIDE threat model, and adversarial trial.
- [x] **Phase 2 — Repository Foundation:** pnpm monorepo workspace, TypeScript compilation, Vitest test suite, CI automation, and open-source governance.
- [x] **Phase 3 — Ingestion & Discovery Engine:** Safe sandbox cloning for public GitHub URLs and local paths, path traversal defense, and manifest-based topology discovery (languages, frameworks, entry points, trust boundaries).
- [ ] **Phase 4 — Category A Scanner Orchestrator:** Parallel sandboxed execution of Gitleaks, Semgrep OSS, OSV-Scanner, and Checkov under 120s timeouts with memory limits.
- [ ] **Phase 5 — Canonical Findings Engine:** Normalization of raw scanner outputs into the 13-field schema, SHA-256 fingerprint deduplication, and immutable raw evidence preservation.
- [ ] **Phase 6 — Graph Correlation Engine:** Construction of directed acyclic graphs for Attack Paths and Failure Paths with strict edge-level evidence (`CONFIRMED`, `INFERRED`, `HYPOTHETICAL`).
- [ ] **Phase 7 — Risk & Remediation Engine:** Explainable integer risk score ($0 - 100$) computation across 5 domains and "Fix First" prioritization based on marginal risk reduction ($\Delta R$).
- [ ] **Phase 8 — CLI Interface & Reporting:** High-density ANSI terminal dashboard, formatted Markdown Audit Report (`REPORISK_AUDIT.md`), and raw JSON export.

---

## Tier 2: Enhanced MVP (v0.2 Release)

Expanding platform ergonomics, CI automation, and distribution.

### Planned Capabilities
- **Private Repository Authentication:** Secure ingestion of private repositories via short-lived GitHub App tokens and personal access tokens without disk leakage.
- **Pull Request Differential Scanning:** Analyzing git diffs to report only newly introduced risks and severed risk paths directly in PR review threads.
- **SARIF Standard Export:** Full serialization to OASIS SARIF v2.1.0 for native integration into GitHub Code Scanning and security tabs.
- **GitHub Action Packaging:** Official composite GitHub Action (`shrishskulkarni/reporisk-action`) for one-line workflow configuration.
- **Official Container Image:** Pre-packaged, multi-arch Docker container bundling all Category A scanner binaries for zero-dependency execution.
- **Rule Customization:** Local `.reporisk.yml` configuration allowing users to customize entry-point patterns, ignore known false positives, or define custom trust boundaries.

---

## Tier 3: Platform Evolution (v0.3+ Release)

Multi-scan historical intelligence, team collaboration, and proactive remediation.

### Planned Capabilities
- **Multi-Scan Historical Storage:** Embedded SQLite engine tracking risk trajectories, remediation velocity, and regression detection across commits over time.
- **Interactive Web UI:** Standalone local dashboard for exploring topological graphs, attack path DAGs, and interactive dependency trees.
- **Automated Fix PR Generation:** Synthesizing targeted pull requests to upgrade vulnerable dependencies, revoke exposed secrets, and lock down CI workflow permissions.
- **Advanced Taint Analysis:** Deep multi-language semantic AST taint tracking via custom Tree-sitter and CodeQL query extractors.
