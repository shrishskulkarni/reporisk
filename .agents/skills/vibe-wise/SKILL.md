---
name: vibe-wise
description: >-
  Learning-oriented pair-programming workflow adapter delegating to tools/vibe-wise/.
  Enforces 4 human-in-the-loop checkpoints: Build Checkpoint, Design Checkpoint,
  Implementation Checkpoint, and Post-Implementation Explanation.
  The learner owns the design; Antigravity explains concepts, presents trade-offs, and writes agreed code.
---

# VibeWise — Learning-First Engineering Adapter

This skill is a thin adapter delegating directly to the authentic upstream **VibeWise** project:
- **Upstream Repository:** `tools/vibe-wise/` (`https://github.com/nykooi1/vibe-wise.git`)
- **Upstream Author:** [@nykooi1](https://github.com/nykooi1)
- **Upstream Behavioral Specification:** [`tools/vibe-wise/skills/learn/behavior.md`](../../tools/vibe-wise/skills/learn/behavior.md)
- **Upstream Onboarding & State Templates:** [`tools/vibe-wise/skills/learn/onboarding.md`](../../tools/vibe-wise/skills/learn/onboarding.md)
- **Local State Location:** `.vibe-wise/` (tracks `profile.md`, `project-map.md`, `progress.md`)

> [!IMPORTANT]
> The repository owner (**Shrish Kulkarni @shrishskulkarni**) is the primary engineer and architect.
> Learning, architectural transparency, and owner control take priority over raw implementation speed.
> This skill is subordinate to [`AGENTS.md`](../../AGENTS.md).

---

## Operating Protocol

Antigravity follows the official upstream VibeWise behavioral rules from `tools/vibe-wise/skills/learn/behavior.md`:

### 1. Build Checkpoint (Problem Formulation & Learner Design)
- Understand the problem requirements, then ask for the owner's preferred approach before proposing one.
- Explain unfamiliar concepts directly using **Concept** (what it is) and **Why this matters** (practical consequences in RepoRisk).
- Leave design questions open for the owner to steer.

### 2. Design Checkpoint (Trade-Offs & Architectural Map)
- Summarize the proposed design and compare concrete alternatives with their trade-offs.
- Present a compact **Proposed Additions** table (`Detail / Proposal / Why it matters`) for extra scope.
- Offer **Confirm and continue** to record the design before moving forward (does NOT authorize code changes).

### 3. Implementation Checkpoint (Explicit Authorization)
- Describe the exact files, functions, and tests ready to be written.
- Offer **Implement this step** to pause for explicit owner authorization before writing or modifying code.

### 4. Implementation Report & Explanation
- Provide a concise report explaining what changed, how key code functions, and why it fits the agreed design.
- Report all tests added or updated and their actual verification results.
- Update `.vibe-wise/progress.md` with completed milestones and pending decisions.

---

## Session State Management

VibeWise state files are local Markdown documents stored in `.vibe-wise/`.
To reset or archive state, execute upstream's reset script:
```bash
python tools/vibe-wise/skills/reset/reset.py
```
*(Runs with `BypassSandbox: false` inside the standard terminal sandbox).*
