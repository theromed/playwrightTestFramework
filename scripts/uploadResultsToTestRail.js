// scripts/uploadResultsToTestRail.js
// Создаёт TestRail Run и заливает результаты пачкой (add_results_for_cases).
// Заменяет trcli: один аккуратный результат на кейс, с уже выставленным
// полем Defects (Jira-key из bugs-map.json) — без дублей.
//
// Использование:
//   node scripts/uploadResultsToTestRail.js \
//     --junit=junit-results.xml \
//     --url=$TESTRAIL_URL --user=$TR_USER --key=$TR_KEY \
//     --projectId=$TESTRAIL_PROJECT_ID --suiteId=$TESTRAIL_SUITE_ID \
//     --runTitle="$TESTRAIL_RUN_TITLE" \
//     [--bugsMap=bugs-map.json] [--allureDir=allure-results] \
//     [--testEnv=Local] [--branch=main] [--baseUrl=http://...] \
//     [--buildUrl=...] [--buildNumber=...] \
//     [--gitRepo=org/repo] [--gitSha=abc123] [--dryRun]

import fs from 'fs';
import path from 'path';
import { parseArgs } from 'node:util';
import { XMLParser } from 'fast-xml-parser';
import { TestRailClient } from '../config/testrailClient.js';

const { values: args } = parseArgs({
  options: {
    junit:       { type: 'string' },
    url:         { type: 'string' },
    user:        { type: 'string' },
    key:         { type: 'string' },
    projectId:   { type: 'string' },
    suiteId:     { type: 'string' },
    runTitle:    { type: 'string' },
    bugsMap:     { type: 'string', default: 'bugs-map.json' },
    allureDir:   { type: 'string', default: 'allure-results' },
    testEnv:     { type: 'string', default: '' },
    branch:      { type: 'string', default: '' },
    baseUrl:     { type: 'string', default: '' },
    buildUrl:    { type: 'string', default: '' },
    buildNumber: { type: 'string', default: '' },
    gitRepo:     { type: 'string', default: '' },
    gitSha:      { type: 'string', default: '' },
    dryRun:      { type: 'boolean', default: false },
  },
});

for (const k of ['junit', 'url', 'user', 'key', 'projectId', 'suiteId', 'runTitle']) {
  if (!args[k]) { console.error(`Missing required argument: --${k}`); process.exit(1); }
}

// ─── JUnit parsing ───
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (n) => ['testsuite', 'testcase', 'property'].includes(n),
});
const xml = parser.parse(fs.readFileSync(args.junit, 'utf-8'));

function collectTestcases(node, acc = []) {
  if (!node || typeof node !== 'object') return acc;
  const suites = node.testsuites?.testsuite || node.testsuite || [];
  for (const s of [].concat(suites)) {
    for (const tc of [].concat(s.testcase || [])) acc.push(tc);
    collectTestcases(s, acc);
  }
  return acc;
}

function statusOf(tc) {
  if (tc.failure || tc.error) return 'failed';
  if (tc.skipped !== undefined) return 'skipped';
  return 'passed';
}

const testcases = collectTestcases(xml).map(tc => {
  const props = [].concat(tc.properties?.property || []);
  const prop = (n) => props.find(p => p['@_name'] === n)?.['@_value'];
  const fullName = tc['@_name'] || 'unknown';
  const cleanTitle = prop('test_title') || fullName.split(' › ').pop().trim();
  const fail = tc.failure || tc.error;
  return {
    className: tc['@_classname'] || '',
    cleanTitle,
    project: prop('playwright_project'),
    duration: Number(tc['@_time'] || 0),
    caseId: prop('test_id') ? String(prop('test_id')).replace(/^C/i, '').trim() : null,
    status: statusOf(tc),
    failMessage: fail ? (fail['@_message'] || '').slice(0, 500) : '',
    failStack: fail
      ? (typeof fail === 'object' ? (fail['#text'] || '') : String(fail)).trim().slice(0, 2500)
      : '',
  };
});

// ─── Allure ───
function loadAllureResults(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('-result.json')) continue;
    try { out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))); } catch {}
  }
  return out;
}
const allure = loadAllureResults(args.allureDir);

function findAllureFor(tc) {
  const cs = allure.filter(r =>
    r.name === tc.cleanTitle &&
    (tc.status === 'failed' ? r.status === 'failed' : true)
  );
  if (!cs.length) return null;
  if (tc.project) {
    const m = cs.find(r => (r.labels || []).some(l => l.name === 'parentSuite' && l.value === tc.project));
    if (m) return m;
  }
  cs.sort((a, b) => (b.stop || 0) - (a.stop || 0));
  return cs[0];
}
const getLabel = (a, name) => (a?.labels || []).find(l => l.name === name)?.value;

// ─── Bug map (Jira keys) ───
const bugsMap = fs.existsSync(args.bugsMap)
  ? JSON.parse(fs.readFileSync(args.bugsMap, 'utf-8'))
  : {};
const bugFor = (tc) => bugsMap[`${tc.className}::${tc.cleanTitle}`];

// ─── Comment builders (Markdown — TestRail 5.6+) ───
function envBitsLine() {
  const bits = [];
  if (args.testEnv) bits.push(`**Env:** ${args.testEnv}`);
  if (args.branch)  bits.push(`**Branch:** ${args.branch}`);
  if (args.baseUrl) bits.push(`**BASE_URL:** ${args.baseUrl}`);
  return bits.length ? bits.join(' | ') : '';
}

function metadataLine(allureRes) {
  if (!allureRes) return '';
  const bits = [];
  const sev = getLabel(allureRes, 'severity');
  const feat = getLabel(allureRes, 'feature');
  const story = getLabel(allureRes, 'story');
  if (sev)   bits.push(`**Severity:** ${sev}`);
  if (feat)  bits.push(`**Feature:** ${feat}`);
  if (story) bits.push(`**Story:** ${story}`);
  return bits.length ? bits.join(' | ') : '';
}

function extractLine(stack, fileHint) {
  if (!stack || !fileHint) return null;
  const e = fileHint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = stack.match(new RegExp(`${e}:(\\d+):\\d+`));
  return m ? Number(m[1]) : null;
}

function reproCmd(tc) {
  const file = tc.className.startsWith('tests/') ? tc.className : `tests/${tc.className}`;
  const safe = tc.cleanTitle.replace(/"/g, '\\"');
  const proj = tc.project ? ` --project=${tc.project}` : '';
  return `npx playwright test ${file} -g "${safe}"${proj}`;
}

function passedComment(tc) {
  const env = envBitsLine();
  const parts = [`Passed in ${tc.duration.toFixed(2)}s`];
  if (env) parts.push(env);
  return parts.join('\n');
}

function failedComment(tc, allureRes, bugKey) {
  const lines = [];
  lines.push(`**Test:** \`${tc.className}\` → ${tc.cleanTitle}`);
  lines.push(`**Duration:** ${tc.duration.toFixed(2)}s`);

  const env = envBitsLine();
  if (env) { lines.push(''); lines.push('#### Environment'); lines.push(env); }

  const meta = metadataLine(allureRes);
  if (meta) { lines.push(''); lines.push('#### Test metadata'); lines.push(meta); }

  if (tc.failMessage) {
    lines.push('');
    lines.push('#### Error');
    lines.push(tc.failMessage);
  }

  if (tc.failStack) {
    lines.push('');
    lines.push('```');
    lines.push(tc.failStack);
    lines.push('```');
  }

  // Links
  const links = [];
  if (bugKey)        links.push(`**Jira Bug:** [${bugKey}](https://theromed.atlassian.net/browse/${bugKey})`);
  if (args.buildUrl) links.push(`**Jenkins Build:** [#${args.buildNumber}](${args.buildUrl})`);
  if (args.buildUrl) links.push(`**Allure Report:** [Open](${args.buildUrl}allure/)`);
  if (args.gitRepo && args.gitSha) {
    const file = tc.className.startsWith('tests/') ? tc.className : `tests/${tc.className}`;
    const line = extractLine(tc.failStack, tc.className);
    links.push(`**GitHub:** [${tc.className}${line ? `:${line}` : ''}](https://github.com/${args.gitRepo}/blob/${args.gitSha}/${file}${line ? `#L${line}` : ''})`);
  }
  if (links.length) {
    lines.push('');
    lines.push('#### Links');
    lines.push(links.map(l => `- ${l}`).join('\n'));
  }

  lines.push('');
  lines.push('#### Reproduce');
  lines.push('```');
  lines.push(reproCmd(tc));
  lines.push('```');

  if (allureRes?.uuid) {
    lines.push('');
    lines.push(`_Allure UUID: ${allureRes.uuid}_`);
  }

  return lines.join('\n');
}

// ─── Build results array (TestRail status_id: 1=Passed, 5=Failed) ───
const results = [];
const skippedNoCase = [];
const skippedNoStatus = [];

for (const tc of testcases) {
  if (!tc.caseId) { skippedNoCase.push(tc.cleanTitle); continue; }
  if (tc.status === 'skipped') { skippedNoStatus.push(tc.cleanTitle); continue; }

  const allureRes = findAllureFor(tc);
  const bugKey = bugFor(tc);

  if (tc.status === 'failed') {
    results.push({
      case_id: Number(tc.caseId),
      status_id: 5,
      comment: failedComment(tc, allureRes, bugKey),
      elapsed: tc.duration >= 1 ? `${Math.round(tc.duration)}s` : undefined,
      ...(bugKey ? { defects: bugKey } : {}),
    });
  } else {
    results.push({
      case_id: Number(tc.caseId),
      status_id: 1,
      comment: passedComment(tc),
      elapsed: tc.duration >= 1 ? `${Math.round(tc.duration)}s` : undefined,
    });
  }
}

console.log(`Testcases parsed: ${testcases.length}`);
console.log(`  Posting results: ${results.length}`);
console.log(`  Skipped (no test_id): ${skippedNoCase.length}`);
console.log(`  Skipped (status=skipped): ${skippedNoStatus.length}`);

if (!results.length) {
  console.warn('No results to post — exit.');
  process.exit(0);
}

if (args.dryRun) {
  console.log('\n--- DRY RUN ---');
  console.log(`Would create Run "${args.runTitle}" in project ${args.projectId}/suite ${args.suiteId}`);
  console.log(`First result preview:`);
  console.log(JSON.stringify(results[0], null, 2).slice(0, 2000));
  process.exit(0);
}

// ─── Create Run + post results ───
const tr = new TestRailClient({ url: args.url, user: args.user, apiKey: args.key });

const run = await tr.post(`add_run/${args.projectId}`, {
  suite_id: Number(args.suiteId),
  name: args.runTitle,
  include_all: false,
  case_ids: results.map(r => r.case_id),
});
console.log(`Created Run R${run.id}: "${run.name}" (${results.length} cases)`);

await tr.post(`add_results_for_cases/${run.id}`, { results });
console.log(`Posted ${results.length} results to R${run.id}`);

const failed = results.filter(r => r.status_id === 5).length;
const withDefect = results.filter(r => r.defects).length;
console.log(`\nSummary: ${results.length - failed} passed, ${failed} failed (${withDefect} with linked Jira bug)`);
console.log(`Run URL: ${args.url.replace(/\/+$/, '')}/index.php?/runs/view/${run.id}`);
