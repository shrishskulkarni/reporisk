---
name: court
description: >-
  Adversarial evaluation of important architectural, security, technology, scanner, and implementation decisions.
  Conducts structured trials (Prosecution, Defense, Cross-examination, Jury, Judge) using court.js or court.py.
  Use when proposing major system changes, database selection, sandbox boundaries, or AI integrations.
---

# Court Skill — Adversarial Decision Trial

Court is an architectural and security review mechanism that challenges assumptions and prevents unexamined decisions from entering RepoRisk.

## Purpose & Scope
Use Court whenever a decision carries architectural, security, reliability, or operational consequences:
- System and component architecture
- Security boundaries and sandbox design
- Technology and framework selection
- Database and storage strategy
- Deterministic scanner selection and execution strategy
- AI model integration and untrusted input defenses
- Risk scoring and attack path algorithms
- Major refactoring or dependency additions

> [!NOTE]
> Do NOT run a full 12-juror trial for minor, trivial code edits. Use **Quick Mode** (3 jurors) for moderate design questions, and **Full Trial Mode** (12 jurors) for high-impact decisions.
>
> **Court verdicts are ADVISORY.** Only repository owner **Shrish Kulkarni (@shrishskulkarni)** has implementation and merge approval authority.

---

## Trial Protocol

Every trial follows five rigorous phases:

1. **PROSECUTION:**
   Build the strongest, technically honest argument *against* the proposed solution. Highlight failure modes, security vectors, maintenance debt, operational complexity, and hidden costs.

2. **DEFENSE:**
   Build the strongest, technically honest argument *in favor* of the proposed solution. Ground arguments in concrete requirements, developer ergonomics, standard library capabilities, and verifiable evidence.

3. **CROSS-EXAMINATION:**
   Probe weak premises, inspect edge cases, and expose any logical fallacies on either side.

4. **JURY DELIBERATION:**
   Independent jurors evaluate the trial record from distinct perspectives (AppSec, DevSecOps, SRE, Minimalism, Governance, Supply Chain, AI Security, Scalability, Data Integrity, Red Team, Core Principles). Jurors vote:
   - `GUILTY` (the proposal is deficient, unsafe, or over-engineered as presented).
   - `NOT GUILTY` (the proposal is sound, defensible, and viable).

5. **JUDGE'S SYNTHESIS:**
   Synthesizes the arguments into `VERDICT.md`, highlighting:
   - What survived scrutiny
   - Remaining deficiencies and conditions required to overturn objections
   - Explicit advisory recommendation for the repository owner

---

## Execution Guide

Trials are managed deterministically using `court.js` (Node.js) or `court.py` (Python 3):

```bash
# 1. Initialize trial (Quick or Full mode)
node .agents/skills/court/court.js init --case "Case description" --mode quick

# 2. Record briefs
node .agents/skills/court/court.js record --phase prosecution --content "..."
node .agents/skills/court/court.js record --phase defense --content "..."

# 3. Record juror votes
node .agents/skills/court/court.js record --phase juror --juror-id sec_appsec --content "VOTE + Rationale"

# 4. Record judge synthesis
node .agents/skills/court/court.js record --phase judge --content "Synthesis..."

# 5. Tally and Render
node .agents/skills/court/court.js tally
node .agents/skills/court/court.js render
```
Rendered verdicts are stored in `.court/` and presented to the repository owner during phase checkpoints.
