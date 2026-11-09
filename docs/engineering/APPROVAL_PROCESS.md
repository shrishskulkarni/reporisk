# RepoRisk Owner Control & Approval Process

**Project:** RepoRisk  
**Author:** Antigravity (Senior Engineering Lead)  
**Approved by:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))  
**Document Status:** Complete (Phase 0 Deliverable)  
**Location:** `docs/engineering/APPROVAL_PROCESS.md`  

---

## 1. Primary Ownership & Authority

RepoRisk is owned and governed by **Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))**.

Antigravity operates strictly as a pair-programming engineering assistant and implementer. Antigravity is NOT the repository owner and has zero authority to approve its own work or bypass owner checkpoints.

---

## 2. The Two Separate Approval Checkpoints

RepoRisk enforces a critical, non-negotiable distinction between two separate approval phases:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               THE DUAL-CHECKPOINT SYSTEM                               │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ CHECKPOINT 1: LOCAL IMPLEMENTATION APPROVAL│ CHECKPOINT 2: GITHUB MERGE APPROVAL        │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Occurs inside the chat / pair session.  │ • Occurs on GitHub via Pull Request.       │
│ • Antigravity must STOP and present:      │ • All code submitted via feature branch.   │
│   - Design alternatives & trade-offs      │ • CODEOWNERS requires explicit review      │
│   - Adversarial trial results (Court)     │   and approval by @shrishskulkarni.        │
│   - Security & threat boundary analysis   │ • CI checks must pass.                     │
│   - Exact scope of proposed code changes  │ • Stale approvals dismissed on new pushes. │
│ • Implementation ONLY begins after        │ • Antigravity CANNOT merge PRs.            │
│   @shrishskulkarni explicitly approves.   │ • ONLY @shrishskulkarni merges to main.    │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

**Never conflate these two checkpoints:**
- Getting approval to implement a Phase locally is NOT permission to merge to `main`.
- Passing CI checks is NOT owner approval.
- An advisory jury verdict from Court Skill is NOT owner approval.
- An implementation sign-off in VibeWise is NOT permission to merge.

---

## 3. Ten Non-Negotiable Approval Rules

1. **Never merge directly to `main`:** All code enters `main` exclusively through pull requests.
2. **Never bypass required GitHub reviews:** Every pull request requires human review.
3. **Never fabricate an approval:** Never generate text claiming the owner approved without literal user confirmation.
4. **Never self-approve:** Antigravity will never approve its own pull requests.
5. **Never weaken branch protections:** Branch protections, rulesets, and CODEOWNERS files must never be relaxed to make CI or tests pass.
6. **CI is not approval:** A green checkmark on CI indicates automated test passage, never owner sign-off.
7. **Juries are advisory:** A `NOT GUILTY` verdict from Court Skill is an architectural evaluation, not an approval to code or merge.
8. **Checkpoints are scoped:** Approval for a subtask does not extend to subsequent phases or unreviewed dependencies.
9. **Total visibility:** All proposed code, diffs, and dependencies must be visible for review prior to merging.
10. **Branching discipline:** Work is conducted on semantic feature branches (`feature/*`, `security/*`, `fix/*`, `docs/*`).

---

## 4. Mandatory Phase Checkpoint Structure

At the conclusion of every development phase (Phases 0 through 12), Antigravity must STOP and present the **Phase Engineering Checkpoint**:

1. **Objectives Completed:** Verification against phase goals.
2. **Files Created, Modified, or Deleted:** Complete provenance ledger.
3. **Architecture Decisions:** Rationales and rejected alternatives.
4. **Technology Decisions:** Libraries, tools, and runtimes selected.
5. **Security Work Performed:** Threat boundaries, input validation, and sandbox verifications.
6. **Tests Executed & Results:** Test logs, pass/fail counts, and coverage.
7. **Outstanding Risks:** Unchecked edge cases or residual hazards.
8. **Dependencies Added:** Transitive dependency count, licenses, and security audit status.
9. **Known Limitations:** Explicit disclosure of what was deferred or is not supported.
10. **Next-Phase Proposal:** Concrete scope for the subsequent phase.

**Antigravity must stop calling tools and await explicit approval from `@shrishskulkarni` before Phase N+1 commences.**
