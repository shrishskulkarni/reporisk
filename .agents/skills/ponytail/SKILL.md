---
name: ponytail
description: >-
  Enforces minimal, maintainable, disciplined engineering. Prioritizes standard library,
  reusable existing code, and YAGNI over-engineering elimination. Requires tracing execution flows,
  simplifying implementations, and reviewing code for bloat while strictly preserving security boundaries.
---

# Ponytail Skill — Minimal & Defensible Engineering

Ponytail embodies the philosophy of the pragmatic, disciplined senior developer:
**"The best code is the code you never wrote."**

Every line of code added to RepoRisk is a liability: it must be compiled, tested, debugged, secured, and maintained. Ponytail keeps the repository lean, readable, and focused.

---

## The Decision Ladder

Before writing, generating, or refactoring code, walk down this ladder and stop at the first rung that solves the problem:

1. **Does this need to exist at all?** (Apply YAGNI ruthlessly. If a feature or abstraction is speculative, eliminate it).
2. **Is it already in this codebase?** (Search existing utilities and patterns before writing new helpers).
3. **Does the standard library do it?** (Use built-in modules before introducing custom code).
4. **Does the native platform / runtime do it?** (Leverage native OS, runtime, or shell capabilities).
5. **Can an already-installed dependency handle it?** (Never add a new dependency for 20 lines of logic).
6. **Can it be written in a single clean, readable line?** (If a reader can grasp it at a glance, keep it simple).
7. **Only as a last resort:** Write the absolute minimum custom code that completely and correctly solves the problem.

---

## Lazy, But NEVER Negligent

Ponytail rejects bloat, NOT safety. The following are **NON-NEGOTIABLE** and must never be stripped or simplified away:
- **Trust-boundary validation:** Untrusted repository input, URLs, commits, and file paths must be strictly validated.
- **Security controls & isolation:** Subprocess sandboxing, timeouts, memory limits, and secret redaction must remain hardened.
- **Error handling & recovery:** Subprocess failures and edge cases must be handled cleanly, never swallowed.
- **Data integrity:** Finding fingerprints, deduplication logic, and schemas must maintain strict correctness.
- **Automated tests:** Critical security logic and parser edge cases must have high-quality unit tests.

---

## Review Checklist

Before proposing or committing code changes, perform a Ponytail review:
1. Did I read and trace existing code and callers before modifying?
2. Did I introduce any unnecessary abstractions, interfaces, or wrappers?
3. Did I add a dependency that standard library features could replace?
4. Is there dead code, speculative configuration, or premature optimization?
5. Did I preserve documentation and comments?

## Required Review Sign-Off
Significant changes should conclude with a brief note detailing:
1. What was not checked or intentionally skipped.
2. Any residual risk the owner should be aware of.
