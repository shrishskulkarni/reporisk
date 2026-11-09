# Contributing to RepoRisk

Thank you for your interest in contributing to **RepoRisk**!

RepoRisk is an open-source Repository Risk Intelligence platform designed to build a complete, evidence-backed map of what can go wrong in any codebase. We welcome contributions that align with our architectural standards, security invariants, and quality rigor.

---

## 1. Project Governance & Approval Process

RepoRisk operates under an explicit owner-led governance model:

- **Repository Owner & Principal Maintainer:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni)).
- **Dual Approval Checkpoint:**
  1. *Architectural / Design Alignment:* Substantial changes or feature additions must be reviewed and approved prior to complex implementation.
  2. *Merge Authority:* All Pull Requests require explicit review and merge approval by `@shrishskulkarni`. Automated or self-merges to `main` are strictly forbidden.

---

## 2. Core Architectural & Security Invariants

All contributions must adhere to the core principles defined in `docs/`:

1. **Untrusted Code Execution Prohibition (Category B):**
   RepoRisk must **NEVER** execute target repository code during analysis. Do not invoke `npm install`, `setup.py`, `make`, arbitrary shell scripts, or test runners belonging to the repository being audited. Static analysis inspects ASTs, manifests, and text directly.
2. **Category A Sandboxed Tool Invocation:**
   Third-party scanners (Gitleaks, Semgrep, OSV-Scanner, Checkov) must execute via direct argument arrays (`execFile`) with zero shell interpolation (`shell: false`), a 120-second timeout, memory caps, and temporary directory sandboxing.
3. **The Tri-Factor Independence Invariant:**
   $$\text{Severity (Impact)} \neq \text{Confidence (Certainty)} \neq \text{Validation Status (Provenance)}$$
   Never conflate confidence with severity. AI models are strictly analytical and explanatory; they must never fabricate findings, CVEs, CWEs, package versions, or line numbers.
4. **Edge-Level Evidence Model:**
   Exploit chains and attack paths must attach evidence (`CALL_GRAPH`, `EXACT_STRING_MATCH`, `TOPOLOGICAL_PROXIMITY`) to individual graph edges. Inferred or hypothetical links must never be branded as confirmed.
5. **No False Precision:**
   Risk scores are explainable integers ($0 - 100$). Never output arbitrary decimal fractions to simulate algorithmic precision.

---

## 3. Development Environment Setup

### Prerequisites
- **Node.js:** $\ge 20.0.0$ (v20+ LTS recommended)
- **pnpm:** $\ge 9.0.0$
- **Git:** Standard CLI

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/shrishskulkarni/reporisk.git
cd reporisk

# Install workspace dependencies
pnpm install

# Verify workspace build and tests
pnpm run build
pnpm test
```

---

## 4. Monorepo Structure

RepoRisk is organized as a pnpm workspace:

```text
reporisk/
├── docs/                   # Architecture, threat model, risk model, and specifications
├── packages/
│   ├── core/               # @reporisk/core: Core engine, types, scanners, correlation, risk
│   └── cli/                # reporisk: CLI interface, formatting, command runner
├── pnpm-workspace.yaml     # Workspace configuration
├── vitest.config.ts        # Monorepo test configuration
└── tsconfig.base.json      # Shared TypeScript compiler options
```

---

## 5. Coding & Testing Standards

- **TypeScript Strict Mode:** All code must compile cleanly under `strict: true` with zero TypeScript errors. Run `pnpm run typecheck`.
- **Vitest Unit & Integration Tests:** Every new module, schema normalizer, scanner adapter, and correlation rule must be covered by comprehensive automated tests. Run `pnpm test`.
- **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - `feat: add OSV-Scanner lockfile normalizer`
  - `fix: correct regex bounds in Gitleaks secret redactor`
  - `docs: update attack path edge taxonomy in risk model`
  - `test: add edge cases for cyclomatic path traversal`
  *(Note: Internal development phases are internal references; do not use phase numbers as commit messages).*

---

## 6. Submitting a Pull Request

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes adhering to all formatting and security rules.
3. Ensure all tests and type checks pass locally:
   ```bash
   pnpm run typecheck
   pnpm run build
   pnpm test
   ```
4. Push your branch to your fork and submit a Pull Request to `shrishskulkarni/reporisk:main`.
5. Describe your changes clearly in the PR description, referencing any relevant issues or documentation.
6. Await review from `@shrishskulkarni`.
