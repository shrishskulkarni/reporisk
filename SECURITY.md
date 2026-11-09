# Security Policy

The security of RepoRisk and the environments in which it runs is of paramount importance. Because RepoRisk ingests, unpacks, and analyzes arbitrary external source code repositories, it is built with defensive security as a fundamental invariant.

---

## 1. Supported Versions

Security updates are actively applied to the following release streams:

| Version | Supported          | Status             |
| :------ | :----------------- | :----------------- |
| 0.1.x   | :white_check_mark: | Active Development |
| < 0.1.0 | :x:                | Pre-release Alpha  |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability in RepoRisk, **please do NOT open a public GitHub issue**. Doing so exposes users to risk before a fix can be prepared and distributed.

### Reporting Channel
Please report all security vulnerabilities directly to the project maintainer:
- **Primary Contact:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))
- **Email:** Report via GitHub Security Advisories at [https://github.com/shrishskulkarni/reporisk/security/advisories/new](https://github.com/shrishskulkarni/reporisk/security/advisories/new) (or email `shrishskulkarni@outlook.com`).

### Information to Include
To help us triage and resolve the issue quickly, please provide:
1. A clear description of the vulnerability.
2. The specific version(s) of RepoRisk affected.
3. Steps to reproduce or a minimal proof-of-concept repository.
4. Any potential impact or attack vectors you have identified.

### Response Timeline
- **Initial Acknowledgement:** Within 48 hours of receipt.
- **Triage & Assessment:** Within 5 business days.
- **Patch & Advisory Publication:** Coordinated with the reporter following patch verification.

---

## 3. Core Security Commitments & Invariants

RepoRisk's internal architecture enforces defensive boundaries against malicious repositories:

1. **Untrusted Target Code (Category B) is Never Executed:**
   RepoRisk strictly disallows the dynamic execution of target repository scripts, build systems (`npm`, `pip`, `make`), or unit tests during analysis. All analysis is passive and static.
2. **Category A Sandboxed Subprocesses:**
   Approved security scanners run in isolated subprocesses with direct argument arrays (`execFile`), memory ceilings (2 GB RSS), output caps (50 MB buffer), and hard wall-clock timeouts (120 seconds).
3. **Directory Traversal ("Zip Slip") & Symlink Defenses:**
   All cloned and unpacked files are validated against the temporary workspace root using canonical path resolution (`realpath`). Files or symlinks resolving outside the root boundary cause an immediate abort.
4. **Secret Redaction:**
   Credentials and sensitive tokens detected during analysis are cryptographically masked (`ghp_1234...cdef [SHA-256]`) before writing to audit reports or terminal logs.
