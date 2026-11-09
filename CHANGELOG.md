# Changelog

All notable changes to **RepoRisk** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Monorepo foundation established using `pnpm` workspaces (`packages/core`, `packages/cli`).
- RepoRisk Non-Commercial and Patent-Restricted License (explicit written permission from Shrish Kulkarni required for commercial or patent use).
- Official RepoRisk brand logo asset and header integration.
- Core project governance, contributing guidelines, and security reporting policy.
- Canonical TypeScript base configuration supporting ES2022 and NodeNext module resolution.
- Vitest test automation harness across monorepo packages.
- GitHub Actions continuous integration matrix covering Linux and Windows environments.
- Architectural and security specifications:
  - `PRODUCT_SPECIFICATION.md`: Qualified competitive landscape, 13-field canonical schema, tri-factor independence, and 3-tier phased scope.
  - `ARCHITECTURE.md`: Typed modular monolith subsystem specifications, data flow, and adversarial review findings.
  - `RISK_MODEL.md`: Epistemic taxonomy, versioned risk engine (`1.0.0-heuristic`), edge-level evidence attack path model, failure path model, and marginal risk reduction.
  - `THREAT_MODEL.md`: STRIDE matrix for analyzing untrusted repositories, Category A vs Category B execution boundaries, and secret redaction rules.
