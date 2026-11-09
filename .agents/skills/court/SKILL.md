---
name: court
description: >-
  Adversarial evaluation of important architectural, security, technology, scanner, and implementation decisions.
  Delegates directly to the upstream court.py engine in tools/court-skill/.
  Conducts structured trials (Prosecution, Defense, Cross-examination, Jury, Judge).
  Use when proposing major system changes, database selection, sandbox boundaries, or AI integrations.
argument-hint: "[--jury N | --quick] [--seed S] <the idea, plan or claim>"
license: MIT
---

# Court Skill — Adversarial Decision Trial (RepoRisk Adapter)

This skill is a thin adapter delegating directly to the authentic upstream **Court** engine:
- **Upstream Repository:** `tools/court-skill/` (`https://github.com/alexyc9381/court-skill.git`)
- **Upstream Author:** Alex Chen ([@alexyc9381](https://github.com/alexyc9381))
- **Execution Engine:** `tools/court-skill/skills/court/court.py`
- **Default Upstream Jurors:** `tools/court-skill/skills/court/jurors.json`
- **RepoRisk Domain Juror Profile:** `.agents/skills/court/reporisk_jurors.json`

> [!IMPORTANT]
> Court verdicts are **strictly advisory** architectural stress-tests. They do NOT constitute approval.
> Final implementation and merge decisions rest solely with repository owner **Shrish Kulkarni (@shrishskulkarni)**.
> This skill is subordinate to [`AGENTS.md`](../../AGENTS.md).

---

## Operating Protocol

Every trial follows the upstream state machine driven by `court.py`:

```text
  CASE STATEMENT (.court/case.md)
              │
              ▼
  COURT init --case-file .court/case.md [--jury N | --quick]
              │
              ▼
  COURT next ──▶ COURT prompts opening
              │
              ▼
  Prosecution Brief vs. Defense Brief
              │
              ▼
  COURT next ──▶ COURT prompts rebuttal
              │
              ▼
  Prosecution Rebuttal vs. Defense Rebuttal
              │
              ▼
  COURT next ──▶ COURT prompts jury
              │
              ▼
  Independent Juror Deliberations & Votes
              │
              ▼
  COURT next ──▶ COURT tally & prompts judge
              │
              ▼
  Judge Verdict Synthesis ──▶ COURT render (.court/<run>/VERDICT.md)
```

---

## Execution Instructions

All execution delegates to the authentic upstream script:

```bash
# 1. Write the case file
# Write .court/case.md containing the factual proposition to test.

# 2. Initialize the trial (Default 12 jurors or --quick 6 jurors)
python tools/court-skill/skills/court/court.py init --case-file .court/case.md [--quick]

# 3. Check next step and generate briefs
python tools/court-skill/skills/court/court.py next
python tools/court-skill/skills/court/court.py prompts <phase>

# 4. Check completed briefs
python tools/court-skill/skills/court/court.py check <phase>

# 5. Tally votes and render verdict
python tools/court-skill/skills/court/court.py tally
python tools/court-skill/skills/court/court.py render
```

Rendered verdicts are stored in `.court/<run>/VERDICT.md` and presented to `@shrishskulkarni` during engineering checkpoints.
