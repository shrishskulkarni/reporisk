---
name: rederive
description: >-
  Specialized target repository understanding, component import mapping, and architectural verification adapter.
  Delegates directly to upstream scripts in tools/rederive/.
  Use strictly for target repository structural analysis (structure.py, history.sh),
  internal subsystem first-principles verification, and Phase 11 adversarial audits.
argument-hint: "[target-path | git-url]"
license: MIT
---

# Rederive — Target Repository Structural & Architectural Analysis (RepoRisk Adapter)

This skill is a dedicated adapter delegating directly to the authentic upstream **Rederive** project:
- **Upstream Repository:** `tools/rederive/` (`https://github.com/EricJujianZou/rederive.git`)
- **Upstream Author:** Eric Zou ([@EricJujianZou](https://github.com/EricJujianZou))
- **Upstream Structure Script:** `tools/rederive/skills/rederive/scripts/structure.py`
- **Upstream History Script:** `tools/rederive/skills/rederive/scripts/history.sh`
- **Upstream Behavioral Specification:** `tools/rederive/skills/rederive/SKILL.md`

> [!NOTE]
> **Operational Separation:** Rederive's "withhold explanations / Socratic quiz" model is NOT used for standard RepoRisk feature development (which is guided by VibeWise).
> Instead, Rederive is reserved strictly for specialized repository analysis, component import mapping, and Phase 11 adversarial audits.
> This skill is subordinate to [`AGENTS.md`](../../AGENTS.md).

---

## Assigned Capabilities & Roles

Rederive is invoked strictly for the capabilities empirically verified in its upstream implementation:

1. **Target Repository Structural Mapping (`structure.py`):**
   Summarizes entry points, internal import graphs, and most-used external packages across Python, JS/TS, Go, and Rust:
   ```bash
   python tools/rederive/skills/rederive/scripts/structure.py <target-repo-path>
   ```

2. **Git Evolution Analysis (`history.sh`):**
   Analyzes commit diffs and tracks structural changes across the repository's evolutionary timeline:
   ```bash
   bash tools/rederive/skills/rederive/scripts/history.sh <target-repo-path>
   ```

3. **Subsystem First-Principles Verification (Internal Audits):**
   Used at major milestones to verify whether newly implemented RepoRisk modules can be logically derived from first principles without unexplained architectural debt.

4. **Phase 11 Adversarial Target Analysis:**
   Used during Phase 11 to analyze synthetic test repositories and map out their foundational architecture before executing vulnerability scanners.

---

## Output Location

Rederive writes its architectural maps and session logs strictly to `.rederive/` inside the target workspace:
- `.rederive/map.md`: Sequenced architectural decision map.
- `.rederive/log.md`: Analysis performance and tracking log.
No target repository source code is modified.
