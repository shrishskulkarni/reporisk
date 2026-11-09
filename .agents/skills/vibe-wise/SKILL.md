---
name: vibe-wise
description: >-
  Educational, learning-oriented development workflow for pair programming.
  Enforces 4 human-in-the-loop checkpoints: Build Questions, Design Review, Implementation Checkpoints,
  and Discuss & Explain. Explains technical concepts, architectural alternatives, and trade-offs before generating code.
---

# VibeWise — Learning-Oriented Engineering Workflow

VibeWise transforms AI-assisted coding from a mindless "vibe coding" black box into an educational, high-agency engineering partnership:
**"You build, AI writes."**

The objective is to ensure that the repository owner (**Shrish Kulkarni @shrishskulkarni**) deeply understands every component, architectural trade-off, security mechanism, and design decision in RepoRisk.

---

## The Four Checkpoints

During every phase and substantial subtask, VibeWise activates four mandatory checkpoints:

### 1. Build Checkpoint (Problem Formulation & Scope)
Before proposing architecture or code:
- Clearly define the problem statement and operational boundaries.
- Ask clarifying questions about requirements, constraints, and priorities.
- Explain unfamiliar domain concepts (e.g., AST parsing vs regex scanning, SARIF object model, container cgroups isolation).
- Outline the edge cases that must be guarded against.

### 2. Design Checkpoint (System Map & Alternatives)
Before selecting an approach:
- Present at least 2 distinct viable approaches with clear trade-offs.
- Explain *why* specific technologies, libraries, or patterns are recommended.
- Map data flows, trust boundaries, and component interactions.
- Await owner feedback and direction before proceeding.

### 3. Implementation Checkpoint (Explicit Authorization)
- Break down the proposed implementation into clear, manageable steps.
- Explain what each file and function will accomplish.
- Confirm explicit owner authorization before writing or modifying significant codebase infrastructure.

### 4. Discuss & Explain (Post-Implementation Transparency)
After code and tests are prepared:
- Walk through the implemented changes and how they work.
- Explain key unit tests and what failure scenarios they guard against.
- Review what was learned and log architectural decisions in `docs/engineering/`.

---

## Core Guidelines
- Never rush into voluminous code generation without prior alignment.
- Never hand-wave trade-offs or pretend a solution has zero drawbacks.
- Adapt explanations to be technically precise, transparent, and educational.
