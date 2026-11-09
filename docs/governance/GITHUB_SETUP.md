# RepoRisk GitHub Governance & Enforcement Guide

**Project:** RepoRisk  
**Author:** Antigravity (Senior Engineering Lead)  
**Approved by:** Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))  
**Document Status:** Complete (Phase 0 Deliverable)  
**Location:** `docs/governance/GITHUB_SETUP.md`  

---

## 1. Governance Overview

To ensure that no code enters the production repository without explicit review and approval by **Shrish Kulkarni ([@shrishskulkarni](https://github.com/shrishskulkarni))**, RepoRisk enforces a layered defense combining:
1. `.github/CODEOWNERS` (Code Ownership definition)
2. GitHub Repository Rulesets / Branch Protection (Cryptographic & administrative policy enforcement)
3. Mandatory Pull Request workflows across all feature branches

---

## 2. GitHub Plan Differences & Security Capabilities

GitHub applies different enforcement mechanisms depending on repository visibility and account tier:

| Plan / Repository Type | Branch Protection Rules | CODEOWNERS Enforcement | Recommended Configuration |
| :--- | :--- | :--- | :--- |
| **Public Repository (Free Plan)** | **Fully Supported** | **Fully Supported** (Free on public OSS repos) | **Standard GitHub Ruleset + Required CODEOWNERS Review** |
| **Private Repository (Free Plan)** | Basic protections only | Notification only (enforcement requires Team tier) | If private, branch protection requires 1 approval + status checks; manual verification required. |
| **Team / Enterprise Plan** | **Fully Supported** | **Fully Supported** | **Enterprise Rulesets with strict reviewer delegation** |

> [!NOTE]
> Since RepoRisk is targeted for a public open-source release, **GitHub Free on public repositories provides 100% full enforcement of required CODEOWNERS reviews and branch protection rulesets.**

---

## 3. Step-by-Step GitHub Ruleset Configuration

Follow these exact steps in the GitHub repository settings to configure the `main` branch protection:

### Step 1: Navigate to Repository Rulesets
1. Open the repository on GitHub: `https://github.com/shrishskulkarni/reporisk`
2. Click **Settings** (top navigation bar).
3. In the left sidebar, under **Code and automation**, click **Rules** ➔ **Rulesets**.
4. Click the green **New ruleset** button ➔ Select **New branch ruleset**.

### Step 2: Configure General Settings
- **Ruleset Name:** `main-branch-protection`
- **Enforcement status:** Select **Active**.

### Step 3: Target the `main` Branch
1. Under **Target branches**, click **Add target** ➔ Select **Include default branch** (or **Include by pattern** and enter `main`).

### Step 4: Configure Protection Rules
Check and enable the following mandatory rules:

1. **Restrict deletions:**
   - [x] Check `Restrict deletions` (prevents deleting the `main` branch).
2. **Block force pushes:**
   - [x] Check `Block force pushes` (prevents history rewriting).
3. **Require a pull request before merging:**
   - [x] Check `Require a pull request before merging`.
   - **Required approvals:** Set to `1`.
   - [x] Check `Dismiss stale pull request approvals when new commits are pushed`.
   - [x] Check `Require review from Code Owners`. *(Ensures @shrishskulkarni must approve all files covered by CODEOWNERS).*
   - [x] Check `Require conversation resolution before merging`.
4. **Require status checks to pass:**
   - [x] Check `Require status checks to pass`.
   - [x] Check `Require branches to be up to date before merging`.
   - Add status checks once CI workflows are established in Phase 2/10 (`test`, `lint`, `typecheck`).

### Step 5: Save & Activate
Click **Create** or **Save changes**.

---

## 4. CODEOWNERS Verification

The `.github/CODEOWNERS` file is established at the repository root:

```text
# Global default owner: Shrish Kulkarni owns every part of RepoRisk
* @shrishskulkarni

# Critical CI/CD workflows and repository governance
/.github/ @shrishskulkarni
/.github/workflows/ @shrishskulkarni
/.github/CODEOWNERS @shrishskulkarni

# Architecture and Security documentation
/docs/ @shrishskulkarni

# Agent workflows, rules, and skills
/.agents/ @shrishskulkarni
/AGENTS.md @shrishskulkarni

# Core application engine, scanners, and risk models
/src/ @shrishskulkarni
/packages/ @shrishskulkarni
/tests/ @shrishskulkarni
```

### Verification Rule
Whenever a pull request touches any file in the repository, GitHub will automatically request review from `@shrishskulkarni`. The pull request cannot be merged until `@shrishskulkarni` submits an approving review.
