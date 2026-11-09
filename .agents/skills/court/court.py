#!/usr/bin/env python3
"""
Court Skill — Adversarial Decision Evaluation Engine
Manages simulated courtroom proceedings for significant architectural,
security, and implementation decisions.
"""

import sys
import os
import json
import argparse
from datetime import datetime
from pathlib import Path

COURT_DIR = Path(".court")
CURRENT_TRIAL_FILE = COURT_DIR / "current_trial.json"
DEFAULT_JURORS_FILE = Path(__file__).parent / "jurors.json"


def ensure_court_dir():
    COURT_DIR.mkdir(parents=True, exist_ok=True)


def load_current_trial():
    if not CURRENT_TRIAL_FILE.exists():
        return None
    with open(CURRENT_TRIAL_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_current_trial(data):
    ensure_court_dir()
    with open(CURRENT_TRIAL_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def load_jurors(mode="full"):
    if not DEFAULT_JURORS_FILE.exists():
        return []
    with open(DEFAULT_JURORS_FILE, "r", encoding="utf-8") as f:
        all_jurors = json.load(f)
    if mode == "quick":
        # Quick mode uses 3 representative jurors: Security, Architecture/Minimalism, Governance
        quick_ids = ["sec_appsec", "arch_minimalist", "devops_sre"]
        filtered = [j for j in all_jurors if j["id"] in quick_ids]
        return filtered if filtered else all_jurors[:3]
    return all_jurors


def cmd_init(args):
    ensure_court_dir()
    case_text = args.case
    if args.case_file and os.path.exists(args.case_file):
        with open(args.case_file, "r", encoding="utf-8") as f:
            case_text = f.read().strip()
    
    if not case_text:
        print("Error: Case description or case file required.", file=sys.stderr)
        sys.exit(1)

    trial_id = f"trial_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    trial_dir = COURT_DIR / trial_id
    trial_dir.mkdir(parents=True, exist_ok=True)

    jurors = load_jurors(args.mode)

    trial_data = {
        "trial_id": trial_id,
        "mode": args.mode,
        "case": case_text,
        "created_at": datetime.utcnow().isoformat(),
        "status": "INITIALIZED",
        "phase": "OPENING",
        "jurors": jurors,
        "briefs": {
            "prosecution": None,
            "defense": None,
            "rebuttal_prosecution": None,
            "rebuttal_defense": None
        },
        "juror_votes": {},
        "verdict": None
    }

    save_current_trial(trial_data)
    with open(trial_dir / "trial.json", "w", encoding="utf-8") as f:
        json.dump(trial_data, f, indent=2)

    print(f"Trial initialized: {trial_id} [Mode: {args.mode}]")
    print(f"Case: {case_text[:100]}..." if len(case_text) > 100 else f"Case: {case_text}")
    print(f"Jurors impaneled: {len(jurors)}")


def cmd_record(args):
    trial = load_current_trial()
    if not trial:
        print("Error: No active trial found. Run 'init' first.", file=sys.stderr)
        sys.exit(1)

    content = args.content
    if args.file and os.path.exists(args.file):
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read().strip()

    if not content:
        print("Error: Content or file required.", file=sys.stderr)
        sys.exit(1)

    phase = args.phase.lower()
    if phase in trial["briefs"]:
        trial["briefs"][phase] = content
        print(f"Recorded brief for {phase}.")
    elif phase == "juror":
        if not args.juror_id:
            print("Error: --juror-id required for juror votes.", file=sys.stderr)
            sys.exit(1)
        # Parse vote: expect GUILTY or NOT GUILTY
        vote_val = "UNKNOWN"
        upper_c = content.upper()
        if "NOT GUILTY" in upper_c or "APPROVE" in upper_c or "ADOPT" in upper_c:
            vote_val = "NOT GUILTY"
        elif "GUILTY" in upper_c or "REJECT" in upper_c or "DENY" in upper_c:
            vote_val = "GUILTY"

        trial["juror_votes"][args.juror_id] = {
            "vote": vote_val,
            "rationale": content,
            "recorded_at": datetime.utcnow().isoformat()
        }
        print(f"Recorded vote for juror {args.juror_id}: {vote_val}")
    elif phase == "judge":
        trial["verdict"] = {
            "summary": content,
            "rendered_at": datetime.utcnow().isoformat()
        }
        trial["status"] = "VERDICT_RENDERED"
        print("Recorded judge's verdict synthesis.")
    else:
        print(f"Unknown phase: {phase}", file=sys.stderr)
        sys.exit(1)

    save_current_trial(trial)
    trial_dir = COURT_DIR / trial["trial_id"]
    with open(trial_dir / "trial.json", "w", encoding="utf-8") as f:
        json.dump(trial, f, indent=2)


def cmd_tally(args):
    trial = load_current_trial()
    if not trial:
        print("Error: No active trial found.", file=sys.stderr)
        sys.exit(1)

    votes = trial.get("juror_votes", {})
    guilty_count = sum(1 for v in votes.values() if v["vote"] == "GUILTY")
    not_guilty_count = sum(1 for v in votes.values() if v["vote"] == "NOT GUILTY")
    total_jurors = len(trial.get("jurors", []))

    print(f"=== TRIAL TALLY: {trial['trial_id']} ===")
    print(f"Total Jurors: {total_jurors}")
    print(f"Votes Cast: {len(votes)}")
    print(f"GUILTY (Reject/Flawed): {guilty_count}")
    print(f"NOT GUILTY (Endorse/Viable): {not_guilty_count}")
    print("------------------------------------------")
    for j_id, v_info in votes.items():
        print(f"- Juror [{j_id}]: {v_info['vote']} | {v_info['rationale'][:80]}...")


def cmd_render(args):
    trial = load_current_trial()
    if not trial:
        print("Error: No active trial found.", file=sys.stderr)
        sys.exit(1)

    votes = trial.get("juror_votes", {})
    guilty_count = sum(1 for v in votes.values() if v["vote"] == "GUILTY")
    not_guilty_count = sum(1 for v in votes.values() if v["vote"] == "NOT GUILTY")

    lines = []
    lines.append(f"# COURT VERDICT REPORT — {trial['trial_id']}")
    lines.append(f"**Date:** {trial['created_at']}")
    lines.append(f"**Mode:** {trial['mode'].upper()}")
    lines.append(f"**Status:** {trial['status']}\n")
    lines.append(f"## 1. Case Under Trial")
    lines.append(f"```text\n{trial['case']}\n```\n")

    lines.append("## 2. Prosecution Arguments (Case Against)")
    lines.append(trial["briefs"].get("prosecution") or "*No prosecution brief recorded.*")
    lines.append("\n## 3. Defense Arguments (Case In Favor)")
    lines.append(trial["briefs"].get("defense") or "*No defense brief recorded.*")

    if trial["briefs"].get("rebuttal_prosecution") or trial["briefs"].get("rebuttal_defense"):
        lines.append("\n## 4. Cross-Examination & Rebuttals")
        if trial["briefs"].get("rebuttal_prosecution"):
            lines.append("### Prosecution Rebuttal:")
            lines.append(trial["briefs"]["rebuttal_prosecution"])
        if trial["briefs"].get("rebuttal_defense"):
            lines.append("### Defense Rebuttal:")
            lines.append(trial["briefs"]["rebuttal_defense"])

    lines.append("\n## 5. Jury Deliberations & Votes")
    lines.append(f"**Final Tally:** {guilty_count} GUILTY (Reject / Fatal Flaws) vs {not_guilty_count} NOT GUILTY (Endorse / Defensible)\n")

    juror_dict = {j["id"]: j for j in trial.get("jurors", [])}
    for j_id, v_info in votes.items():
        j_meta = juror_dict.get(j_id, {"name": j_id, "role": "Juror"})
        lines.append(f"### Juror: {j_meta['name']} ({j_meta['role']})")
        lines.append(f"**Vote:** `{v_info['vote']}`")
        lines.append(f"**Rationale:** {v_info['rationale']}\n")

    lines.append("## 6. Judge's Verdict Synthesis")
    if trial.get("verdict"):
        lines.append(trial["verdict"]["summary"])
    else:
        lines.append("*Verdict pending synthesis.*")

    lines.append("\n---")
    lines.append("> [!IMPORTANT] Court verdicts are ADVISORY architectural evaluations. Final implementation and merge decisions rest solely with the repository owner (@shrishskulkarni).\n")

    rendered_text = "\n".join(lines)
    output_path = args.output or COURT_DIR / trial["trial_id"] / "VERDICT.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(rendered_text)

    # Also save as latest VERDICT.md in .court
    with open(COURT_DIR / "VERDICT.md", "w", encoding="utf-8") as f:
        f.write(rendered_text)

    print(f"Rendered verdict to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Court Skill Trial Engine")
    subparsers = parser.add_subparsers(dest="command")

    init_p = subparsers.add_parser("init")
    init_p.add_argument("--case", default="")
    init_p.add_argument("--case-file", default="")
    init_p.add_argument("--mode", choices=["quick", "full"], default="full")

    rec_p = subparsers.add_parser("record")
    rec_p.add_argument("--phase", required=True)
    rec_p.add_argument("--juror-id", default="")
    rec_p.add_argument("--content", default="")
    rec_p.add_argument("--file", default="")

    tally_p = subparsers.add_parser("tally")

    render_p = subparsers.add_parser("render")
    render_p.add_argument("--output", default="")

    args = parser.parse_args()
    if args.command == "init":
        cmd_init(args)
    elif args.command == "record":
        cmd_record(args)
    elif args.command == "tally":
        cmd_tally(args)
    elif args.command == "render":
        cmd_render(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
