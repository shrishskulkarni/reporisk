# RepoRisk Engineering Rules & Standards

**Project:** RepoRisk  
**Author:** Antigravity (Senior Engineering Lead)  
**Approved by:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))  
**Document Status:** Complete (Phase 0 Deliverable — Updated with Architectural Corrections)  
**Location:** `docs/engineering/ENGINEERING_RULES.md`  

---

## 1. Foundational Principles

Every commit, architecture document, and pull request must adhere to seven foundational principles:

1. **SECURITY OVER FEATURES:** An insecure scanner is a critical vulnerability. Security controls, sandbox boundaries, and input validation will never be compromised to expedite a feature.
2. **CORRECTNESS OVER SPEED:** A scan result must be accurate and verifiable. A false claim or inaccurate severity rating undermines the platform's credibility.
3. **EVIDENCE OVER GUESSES:** Speculation has no place in vulnerability assessment. Every finding must include verifiable evidence (file, line number, pattern match, rule identifier, CVE/CWE reference, AST node).
4. **TRANSPARENCY OVER MARKETING:** Be ruthlessly honest about what RepoRisk detects and what it misses. Limitations, false-positive risks, and coverage boundaries must be explicitly reported.
5. **REPRODUCIBILITY OVER MAGIC:** A scan run on commit `X` under identical configuration must produce identical results every time. Deterministic engines form the platform core; AI provides an optional explanatory and correlative layer.
6. **SIMPLE ARCHITECTURE OVER COMPLEXITY:** Avoid premature microservices, message queues, and distributed orchestration. Prefer a modular monolith with clean internal module boundaries.
7. **REAL FUNCTIONALITY OVER PLACEHOLDERS:** Never commit mock scanner engines, fake UI counters, simulated vulnerability outputs, or stubbed risk calculations.

---

## 2. Execution Security & Sandboxing Standard

### 2.1 The Core Execution Principle
> **RepoRisk must never execute arbitrary or untrusted repository code merely for analysis. Approved third-party analysis tools may execute only inside a controlled sandbox with explicit allowlisting, least privilege, filesystem isolation, network restrictions, CPU/memory/process limits, strict timeouts, output limits, and cleanup guarantees.**

### 2.2 Strict Distinction of Execution Categories
RepoRisk establishes an uncompromising boundary between two categories of execution:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               EXECUTION TRUST BOUNDARIES                               │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ CATEGORY A: REPORISK-CONTROLLED TOOLS     │ CATEGORY B: TARGET REPOSITORY CODE         │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Approved, explicitly allowlisted tools  │ • Any code originating from the repository │
│   (e.g., Gitleaks, Semgrep, OSV-Scanner,  │   being analyzed or audited.               │
│   Trivy, Syft, court.py, history.sh).     │ • Package scripts (package.json install/   │
│ • Fixed argument vectors (execFile).      │   postinstall, setup.py, Cargo build).     │
│ • No shell interpolation (shell=False).   │ • Makefiles, shell scripts, Dockerfiles.   │
│ • Sandboxed with strict memory, CPU,      │ • Repository test suites, CI workflows.    │
│   network, and execution timeouts.        │                                            │
│                                           │ STATUS: STRICTLY UNTRUSTED & HOSTILE.      │
│ STATUS: PERMITTED UNDER STRICT SANDBOX    │ EXECUTION PROHIBITION: NEVER EXECUTED      │
│ CONTROLS & RESOURCE CAPS.                 │ MERELY FOR SCANNING OR STATIC ANALYSIS.    │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### 2.3 Sandboxing Controls for Approved Tools (Category A)
When invoking allowlisted analysis tools or internal engineering scripts:
1. **No Shell Interpolation:** Always pass direct argument arrays (`execFile` / `subprocess.run(args, shell=False)`). Concatenating parameters into raw shell strings is prohibited.
2. **Execution Timeouts:** Non-negotiable timeout per tool run (default: 120 seconds for scanners; 30 seconds for workflow scripts).
3. **Process Tree Termination:** On timeout or abort, the entire process group/tree is killed (`taskkill /F /T` on Windows, `SIGKILL` to process group on POSIX) to prevent orphaned processes.
4. **Buffer & Memory Limits:** Cap `maxBuffer` on stdout/stderr to 50 MB to prevent memory exhaustion DoS.
5. **Network Isolation:** Category A tools run with network access disabled unless an explicit remote vulnerability database sync is triggered under administrative configuration.
6. **Filesystem Isolation:** Category A tools operate strictly within designated temporary workspace paths; access to parent directories, system directories, and user configurations is denied.
7. **Cleanup Guarantees:** Temporary directories are tracked by UUID and registered in process exit handlers that guarantee deletion upon process completion or unexpected crash.

### 2.4 Dynamic Execution Isolation (Future Phase Constraint)
If dynamic execution or containerized behavioral analysis is introduced in later phases, it must execute exclusively inside an isolated container with:
- Non-root user privileges
- Read-only root filesystem
- No network access (`--network none`)
- Strict CPU and memory limits (`--memory=2g`, `--cpus=2`)
- Wall-clock timeouts and automatic container disposal

---

## 3. Evidence Integrity & Canonical Finding Schema

### 3.1 The Authoritative Evidence Principle
> **Deterministic scanner output is authoritative evidence produced by a specific scanner/version. RepoRisk must preserve the original evidence and provenance, but scanner findings may still contain false positives, false negatives, stale vulnerability information, or contextual limitations. RepoRisk's correlation and validation layers must never silently modify the original scanner evidence.**

### 3.2 Canonical Finding Schema
Every finding ingested, normalized, or generated by RepoRisk must preserve the following 13 fields:

```text
Finding {
  1.  scanner:                   string       // Name of the scanner (e.g., "gitleaks", "semgrep", "osv-scanner")
  2.  scanner_version:           string       // Exact version of the tool engine (e.g., "8.18.2")
  3.  rule_id:                   string       // Rule/check identifier (e.g., "generic-api-key", "python.lang.security.insecure-hash")
  4.  source_file:              string       // Canonical relative path within the repository
  5.  line_range:               Range        // { start_line, end_line, start_col?, end_col? }
  6.  original_message:         string       // Unmodified description/message emitted by the underlying tool
  7.  timestamp:                string       // Execution timestamp in ISO 8601 UTC
  8.  dependency_or_db_version: string?      // Vulnerability database ref/commit (e.g., OSV snapshot 2026-11-01)
  9.  raw_evidence:             string       // Exact verbatim evidence, matched string, or raw JSON payload
  10. reporisk_interpretation:  string       // RepoRisk's normalized interpretation, context, and correlation notes
  11. confidence:               Confidence   // CONFIRMED | LIKELY | POTENTIAL | INFORMATIONAL
  12. severity:                 Severity     // CRITICAL | HIGH | MEDIUM | LOW | INFO (independent of confidence)
  13. validation_status:        Status       // UNVALIDATED | DETERMINISTICALLY_CONFIRMED | HEURISTICALLY_INFERRED | SUPPRESSED | FALSE_POSITIVE
}
```

### 3.3 Strict Independence of Severity and Confidence
Severity measures the **potential impact** if exploited. Confidence measures the **certainty of the evidence**. They must never be conflated:
- A `CRITICAL` severity finding based on contextual heuristic inference must be tagged `Confidence: POTENTIAL`, not promoted to `CONFIRMED`.
- A `LOW` severity finding verified by exact deterministic regex must be tagged `Confidence: CONFIRMED`.

---

## 4. Input Validation & Hostile Ingestion Defenses

RepoRisk treats all ingested repositories as hostile input:

1. **GitHub URLs:** Strictly validated against `^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\.git)?$`. Dangerous protocols (`git://`, `ssh://`, `file://`, IP addresses) are rejected.
2. **Commit SHAs:** Strictly validated against 40-character hexadecimal strings (`^[0-9a-fA-F]{40}$`).
3. **Canonical Path Resolution:** All file access resolves to canonical paths (`realpath`) and must be verified to start with the temporary workspace root.
4. **Symlink Traversal:** Any symlink pointing outside the workspace boundary or toward sensitive system paths (`/etc`, `/proc`, Windows system dirs, `..`) is neutralized.
5. **Archive Traversal ("Zip Slip"):** When unpacking tar/zip archives, every entry path is validated before extraction. Any archive entry containing `../` or absolute paths triggers an immediate abort.
6. **Windows Reserved Names:** Handle Windows device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`) without crashing or file-handle locking.

---

## 5. Secret Redaction Standard

1. **Never Disclose Raw Secrets:** RepoRisk reports, logs, and database records must never display raw credentials.
2. **Redaction Pattern:** Tokens must be masked preserving prefix/suffix for identification alongside a cryptographic hash:
   $$\text{ghp\_1234567890abcdef} \longrightarrow \text{ghp\_1234}\dots\text{cdef}\quad [\text{SHA-256 fingerprint}]$$

---

## 6. Testing & CI Standards

1. **Deterministic Tests:** Unit tests run offline without network access. External services must be mocked.
2. **Synthetically Vulnerable Test Fixtures:** All test fixtures must be safe, synthetic examples containing fake credentials. Real secrets or production keys are strictly prohibited.
3. **CI Status Checks:** Pull requests must pass formatting, strict linting, type-checking, and the full test suite before being considered for review.
