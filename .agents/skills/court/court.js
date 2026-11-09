#!/usr/bin/env node
/**
 * Court Skill — Adversarial Decision Evaluation Engine (Node.js implementation)
 * Zero-dependency runner providing deterministic trial management for Antigravity on Windows/Node.
 */

const fs = require('fs');
const path = require('path');

const COURT_DIR = path.resolve(process.cwd(), '.court');
const CURRENT_TRIAL_FILE = path.join(COURT_DIR, 'current_trial.json');
const DEFAULT_JURORS_FILE = path.join(__dirname, 'jurors.json');

function ensureCourtDir() {
  if (!fs.existsSync(COURT_DIR)) {
    fs.mkdirSync(COURT_DIR, { recursive: true });
  }
}

function loadCurrentTrial() {
  if (!fs.existsSync(CURRENT_TRIAL_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(CURRENT_TRIAL_FILE, 'utf-8'));
}

function saveCurrentTrial(data) {
  ensureCourtDir();
  fs.writeFileSync(CURRENT_TRIAL_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function loadJurors(mode = 'full') {
  if (!fs.existsSync(DEFAULT_JURORS_FILE)) {
    return [];
  }
  const allJurors = JSON.parse(fs.readFileSync(DEFAULT_JURORS_FILE, 'utf-8'));
  if (mode === 'quick') {
    const quickIds = ['sec_appsec', 'arch_minimalist', 'devops_sre'];
    const filtered = allJurors.filter(j => quickIds.includes(j.id));
    return filtered.length > 0 ? filtered : allJurors.slice(0, 3);
  }
  return allJurors;
}

function parseArgs(args) {
  const parsed = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed[key] = args[i + 1];
        i++;
      } else {
        parsed[key] = true;
      }
    } else {
      parsed._.push(arg);
    }
  }
  return parsed;
}

function cmdInit(parsed) {
  ensureCourtDir();
  let caseText = parsed.case || '';
  if (parsed['case-file'] && fs.existsSync(parsed['case-file'])) {
    caseText = fs.readFileSync(parsed['case-file'], 'utf-8').trim();
  }

  if (!caseText) {
    console.error('Error: Case description (--case) or case file (--case-file) required.');
    process.exit(1);
  }

  const mode = parsed.mode === 'quick' ? 'quick' : 'full';
  const now = new Date();
  const trialId = `trial_${now.toISOString().replace(/[-:T]/g, '').slice(0, 15)}`;
  const trialDir = path.join(COURT_DIR, trialId);
  fs.mkdirSync(trialDir, { recursive: true });

  const jurors = loadJurors(mode);

  const trialData = {
    trial_id: trialId,
    mode: mode,
    case: caseText,
    created_at: now.toISOString(),
    status: 'INITIALIZED',
    phase: 'OPENING',
    jurors: jurors,
    briefs: {
      prosecution: null,
      defense: null,
      rebuttal_prosecution: null,
      rebuttal_defense: null
    },
    juror_votes: {},
    verdict: null
  };

  saveCurrentTrial(trialData);
  fs.writeFileSync(path.join(trialDir, 'trial.json'), JSON.stringify(trialData, null, 2), 'utf-8');

  console.log(`Trial initialized: ${trialId} [Mode: ${mode.toUpperCase()}]`);
  console.log(`Case: ${caseText.length > 100 ? caseText.slice(0, 100) + '...' : caseText}`);
  console.log(`Jurors impaneled: ${jurors.length}`);
}

function cmdRecord(parsed) {
  const trial = loadCurrentTrial();
  if (!trial) {
    console.error("Error: No active trial found. Run 'init' first.");
    process.exit(1);
  }

  let content = parsed.content || '';
  if (parsed.file && fs.existsSync(parsed.file)) {
    content = fs.readFileSync(parsed.file, 'utf-8').trim();
  }

  if (!content) {
    console.error('Error: --content or --file required.');
    process.exit(1);
  }

  const phase = (parsed.phase || '').toLowerCase();
  if (phase in trial.briefs) {
    trial.briefs[phase] = content;
    console.log(`Recorded brief for ${phase}.`);
  } else if (phase === 'juror') {
    const jurorId = parsed['juror-id'];
    if (!jurorId) {
      console.error('Error: --juror-id required for juror votes.');
      process.exit(1);
    }
    const upper = content.toUpperCase();
    let voteVal = 'UNKNOWN';
    if (upper.includes('NOT GUILTY') || upper.includes('APPROVE') || upper.includes('ADOPT')) {
      voteVal = 'NOT GUILTY';
    } else if (upper.includes('GUILTY') || upper.includes('REJECT') || upper.includes('DENY')) {
      voteVal = 'GUILTY';
    }

    trial.juror_votes[jurorId] = {
      vote: voteVal,
      rationale: content,
      recorded_at: new Date().toISOString()
    };
    console.log(`Recorded vote for juror ${jurorId}: ${voteVal}`);
  } else if (phase === 'judge') {
    trial.verdict = {
      summary: content,
      rendered_at: new Date().toISOString()
    };
    trial.status = 'VERDICT_RENDERED';
    console.log("Recorded judge's verdict synthesis.");
  } else {
    console.error(`Unknown phase: ${phase}`);
    process.exit(1);
  }

  saveCurrentTrial(trial);
  const trialDir = path.join(COURT_DIR, trial.trial_id);
  fs.writeFileSync(path.join(trialDir, 'trial.json'), JSON.stringify(trial, null, 2), 'utf-8');
}

function cmdTally() {
  const trial = loadCurrentTrial();
  if (!trial) {
    console.error('Error: No active trial found.');
    process.exit(1);
  }

  const votes = trial.juror_votes || {};
  let guilty = 0;
  let notGuilty = 0;
  for (const v of Object.values(votes)) {
    if (v.vote === 'GUILTY') guilty++;
    if (v.vote === 'NOT GUILTY') notGuilty++;
  }

  console.log(`=== TRIAL TALLY: ${trial.trial_id} ===`);
  console.log(`Total Impaneled Jurors: ${trial.jurors.length}`);
  console.log(`Votes Cast: ${Object.keys(votes).length}`);
  console.log(`GUILTY (Reject / Deficiencies Unresolved): ${guilty}`);
  console.log(`NOT GUILTY (Endorse / Defensible Baseline): ${notGuilty}`);
  console.log('------------------------------------------');
  for (const [id, v] of Object.entries(votes)) {
    console.log(`- Juror [${id}]: ${v.vote} | ${v.rationale.slice(0, 90)}...`);
  }
}

function cmdRender(parsed) {
  const trial = loadCurrentTrial();
  if (!trial) {
    console.error('Error: No active trial found.');
    process.exit(1);
  }

  const votes = trial.juror_votes || {};
  let guilty = 0;
  let notGuilty = 0;
  for (const v of Object.values(votes)) {
    if (v.vote === 'GUILTY') guilty++;
    if (v.vote === 'NOT GUILTY') notGuilty++;
  }

  const lines = [];
  lines.push(`# COURT VERDICT REPORT — ${trial.trial_id}`);
  lines.push(`**Date:** ${trial.created_at}`);
  lines.push(`**Mode:** ${trial.mode.toUpperCase()}`);
  lines.push(`**Status:** ${trial.status}\n`);
  lines.push(`## 1. Case Under Trial`);
  lines.push(`\`\`\`text\n${trial.case}\n\`\`\`\n`);

  lines.push('## 2. Prosecution Arguments (Case Against)');
  lines.push(trial.briefs.prosecution || '*No prosecution brief recorded.*');
  lines.push('\n## 3. Defense Arguments (Case In Favor)');
  lines.push(trial.briefs.defense || '*No defense brief recorded.*');

  if (trial.briefs.rebuttal_prosecution || trial.briefs.rebuttal_defense) {
    lines.push('\n## 4. Cross-Examination & Rebuttals');
    if (trial.briefs.rebuttal_prosecution) {
      lines.push('### Prosecution Rebuttal:');
      lines.push(trial.briefs.rebuttal_prosecution);
    }
    if (trial.briefs.rebuttal_defense) {
      lines.push('### Defense Rebuttal:');
      lines.push(trial.briefs.rebuttal_defense);
    }
  }

  lines.push('\n## 5. Jury Deliberations & Votes');
  lines.push(`**Final Tally:** ${guilty} GUILTY (Reject) vs ${notGuilty} NOT GUILTY (Endorse)\n`);

  const jurorDict = {};
  for (const j of trial.jurors || []) {
    jurorDict[j.id] = j;
  }

  for (const [id, v] of Object.entries(votes)) {
    const meta = jurorDict[id] || { name: id, role: 'Juror' };
    lines.push(`### Juror: ${meta.name} (${meta.role})`);
    lines.push(`**Vote:** \`${v.vote}\``);
    lines.push(`**Rationale:** ${v.rationale}\n`);
  }

  lines.push("## 6. Judge's Verdict Synthesis");
  if (trial.verdict) {
    lines.push(trial.verdict.summary);
  } else {
    lines.push('*Verdict pending synthesis.*');
  }

  lines.push('\n---');
  lines.push('> [!IMPORTANT] Court verdicts are ADVISORY architectural evaluations. Final implementation and merge decisions rest solely with the repository owner (@shrishskulkarni).\n');

  const rendered = lines.join('\n');
  const outPath = parsed.output || path.join(COURT_DIR, trial.trial_id, 'VERDICT.md');
  fs.writeFileSync(outPath, rendered, 'utf-8');
  fs.writeFileSync(path.join(COURT_DIR, 'VERDICT.md'), rendered, 'utf-8');

  console.log(`Rendered verdict to: ${outPath}`);
}

function main() {
  const rawArgs = process.argv.slice(2);
  const command = rawArgs[0];
  const parsed = parseArgs(rawArgs.slice(1));

  if (command === 'init') {
    cmdInit(parsed);
  } else if (command === 'record') {
    cmdRecord(parsed);
  } else if (command === 'tally') {
    cmdTally();
  } else if (command === 'render') {
    cmdRender(parsed);
  } else {
    console.log('Usage: node court.js <init|record|tally|render> [options]');
  }
}

main();
