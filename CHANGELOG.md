# Changelog

All notable changes to **RepoRisk** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Ingestion Engine (`@reporisk/core`):**
  - Safe git shallow cloner (`git clone --depth 1`) via direct argument arrays (`execFile`) under strict 120s wall-clock timeouts.
  - Temporary sandbox workspace manager with automatic cleanup on completion or failure.
  - Pinned commit SHA extraction (`git rev-parse HEAD`) for verifiable finding provenance.
  - Strict input URL validator enforcing HTTPS and rejecting shell metacharacters and embedded credentials.
  - Path traversal ("Zip Slip") guard and symlink boundary validator enforcing workspace confinement (`SecurityBoundaryViolationError`).
- **Topology Discovery Engine (`@reporisk/core`):**
  - Passive, static tree scanner mapping file counts and byte volumes across 35+ programming and configuration languages.
  - Technology manifest scanner detecting Web Frameworks, ORMs, Test Runners, and CI/CD pipelines (Node.js, Python, Go, Rust, Java).
  - Static entry point and route handler extractor (Express, Fastify, Next.js App/Pages Routers, FastAPI, Flask, Go Web) with exposure classification (`PUBLIC_INGRESS`, `AUTHENTICATED`, `INTERNAL`).
  - Trust Boundary synthesizer identifying Public Ingress Perimeters, Auth Gateways, Database Isolation tiers, and CI Runner execution boundaries.
- **CLI Ingestion & Topology Output (`reporisk`):**
  - `reporisk scan <target>` now executes the complete ingestion and topology pipeline, rendering ANSI summaries and supporting `--format json`.
- Monorepo foundation established using `pnpm` workspaces (`packages/core`, `packages/cli`).
- Standard Apache License, Version 2.0.
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
