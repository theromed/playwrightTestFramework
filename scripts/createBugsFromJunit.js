// scripts/createBugsFromJunit.js
// Парсит junit-results.xml, для каждого FAIL: создаёт/находит Bug в Jira,
// затем линкует ключ Bug в поле Defects результата TestRail.
// Использование:
//   node scripts/createBugsFromJunit.js \
//     --junit=junit-results.xml \
//     --jiraUrl=... --jiraUser=... --jiraToken=... --projectKey=KAN \
//     --buildUrl=... --buildNumber=... \
//     --testrailUrl=... --testrailUser=... --testrailKey=... \
//     --testrailProjectId=... --testrailSuiteId=... --testrailRunTitle="..."

import fs from 'fs';
import { parseArgs } from 'node:util';
import { XMLParser } from 'fast-xml-parser';
import { TestRailClient } from '../config/testrailClient.js';

const { values: args } = parseArgs({
  options: {
    junit:            { type: 'string' },
    jiraUrl:          { type: 'string' },
    jiraUser:         { type: 'string' },
    jiraToken:        { type: 'string' },
    projectKey:       { type: 'string' },
    issueType:        { type: 'string', default: 'Bug' }, // KAN-style проекты могут не иметь Bug — передай 'Task'
    buildUrl:         { type: 'string' },
    buildNumber:      { type: 'string' },
    // TestRail (опционально — если не задано, линковка пропускается)
    testrailUrl:       { type: 'string' },
    testrailUser:      { type: 'string' },
    testrailKey:       { type: 'string' },
    testrailProjectId: { type: 'string' },
    testrailSuiteId:   { type: 'string' },
    testrailRunTitle:  { type: 'string' },
  },
});

for (const k of ['junit', 'jiraUrl', 'jiraUser', 'jiraToken', 'projectKey', 'buildUrl', 'buildNumber']) {
  if (!args[k]) { console.error(`Missing required argument: --${k}`); process.exit(1); }
}

// ─── Парсинг JUnit: достаём failures + test_id property ───
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['testsuite', 'testcase', 'property'].includes(name),
});
const xml = parser.parse(fs.readFileSync(args.junit, 'utf-8'));

function collectTestcases(node, acc = []) {
  if (!node || typeof node !== 'object') return acc;
  const suites = node.testsuites?.testsuite || node.testsuite || [];
  for (const s of [].concat(suites)) {
    for (const tc of [].concat(s.testcase || [])) acc.push(tc);
    collectTestcases(s, acc); // вложенные testsuite
  }
  return acc;
}

const failures = [];
for (const tc of collectTestcases(xml)) {
  if (!tc.failure && !tc.error) continue;
  const fail = [].concat(tc.failure || tc.error)[0] || {};
  const props = [].concat(tc.properties?.property || []);
  const testIdProp = props.find(p => p['@_name'] === 'test_id');
  failures.push({
    testName: tc['@_name'] || 'unknown',
    className: tc['@_classname'] || '',
    message: (fail['@_message'] || '').slice(0, 500),
    stackTrace: (typeof fail === 'object' ? (fail['#text'] || '') : String(fail)).trim().slice(0, 2000),
    caseId: testIdProp ? String(testIdProp['@_value']).replace(/^C/i, '').trim() : null,
  });
}

if (failures.length === 0) { console.log('No failures found in JUnit report.'); process.exit(0); }
console.log(`Found ${failures.length} failure(s). Processing...`);

// ─── Jira ───
const jiraAuth = Buffer.from(`${args.jiraUser}:${args.jiraToken}`).toString('base64');
const jiraHeaders = {
  Authorization: `Basic ${jiraAuth}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// ─── TestRail (опционально) ───
let tr = null, runId = null;
const trReady = args.testrailUrl && args.testrailUser && args.testrailKey
             && args.testrailProjectId && args.testrailRunTitle;
if (trReady) {
  tr = new TestRailClient({ url: args.testrailUrl, user: args.testrailUser, apiKey: args.testrailKey });
  try {
    const runs = await tr.getRuns(Number(args.testrailProjectId), args.testrailSuiteId ? Number(args.testrailSuiteId) : undefined);
    const run = runs.find(r => r.name === args.testrailRunTitle) || runs[0];
    if (run) { runId = run.id; console.log(`TestRail run resolved: "${run.name}" → R${runId}`); }
    else console.warn('TestRail: run not found by title — defect linking skipped.');
  } catch (e) { console.warn(`TestRail: failed to resolve run — ${e.message}`); }
} else {
  console.log('TestRail args not provided — defect linking skipped (Jira bugs only).');
}

async function linkDefectInTestRail(caseId, bugKey) {
  if (!tr || !runId || !caseId) return;
  try {
    await tr.addResultForCase(runId, Number(caseId), {
      status_id: 5, // 5 = Failed
      comment: `Auto-linked bug: ${bugKey} (Jenkins #${args.buildNumber})`,
      defects: bugKey,
    });
    console.log(`    TestRail: linked ${bugKey} → C${caseId} in R${runId}`);
  } catch (e) {
    console.warn(`    TestRail: link failed for C${caseId}: ${e.message}`);
  }
}

let created = 0, skipped = 0, errors = 0;

for (const fail of failures) {
  const summary = `[Auto] Test failed: ${fail.className} — ${fail.testName}`;
  try {
    // Dedup: ищем открытый issue с тем же именем теста
    const jql = `project = "${args.projectKey}" AND summary ~ "${fail.testName.replace(/"/g, '\\"')}" AND status != Done AND type = "${args.issueType}"`;
    const searchRes = await fetch(`${args.jiraUrl}/rest/api/3/search/jql`, {
      method: 'POST', headers: jiraHeaders,
      body: JSON.stringify({ jql, maxResults: 1, fields: ['summary', 'status'] }),
    });
    const searchData = await searchRes.json();

    if (searchData.total > 0) {
      const existingKey = searchData.issues[0].key;
      console.log(`  Skip: "${fail.testName}" — bug exists: ${existingKey}`);
      await fetch(`${args.jiraUrl}/rest/api/3/issue/${existingKey}/comment`, {
        method: 'POST', headers: jiraHeaders,
        body: JSON.stringify({ body: { type: 'doc', version: 1, content: [{
          type: 'paragraph', content: [
            { type: 'text', text: `Still failing in Build #${args.buildNumber}: ` },
            { type: 'text', text: args.buildUrl, marks: [{ type: 'link', attrs: { href: args.buildUrl } }] },
          ],
        }] } }),
      });
      await linkDefectInTestRail(fail.caseId, existingKey);
      skipped++;
      continue;
    }

    // Создаём новый Bug
    const res = await fetch(`${args.jiraUrl}/rest/api/3/issue`, {
      method: 'POST', headers: jiraHeaders,
      body: JSON.stringify({ fields: {
        project: { key: args.projectKey },
        issuetype: { name: args.issueType },
        summary: summary.slice(0, 255),
        description: { type: 'doc', version: 1, content: [
          { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Automated test failure' }] },
          { type: 'paragraph', content: [
            { type: 'text', text: 'Test: ', marks: [{ type: 'strong' }] },
            { type: 'text', text: `${fail.className} → ${fail.testName}` },
          ] },
          { type: 'paragraph', content: [
            { type: 'text', text: 'Error: ', marks: [{ type: 'strong' }] },
            { type: 'text', text: fail.message || 'No message' },
          ] },
          { type: 'codeBlock', attrs: { language: 'text' },
            content: [{ type: 'text', text: fail.stackTrace || 'No stack trace' }] },
          { type: 'paragraph', content: [
            { type: 'text', text: 'Jenkins Build: ' },
            { type: 'text', text: `#${args.buildNumber}`, marks: [{ type: 'link', attrs: { href: args.buildUrl } }] },
          ] },
          { type: 'paragraph', content: [
            { type: 'text', text: 'Allure Report: ' },
            { type: 'text', text: 'Open Report', marks: [{ type: 'link', attrs: { href: `${args.buildUrl}allure` } }] },
          ] },
        ] },
        labels: ['auto-bug', 'playwright'],
      } }),
    });
    const data = await res.json();
    if (data.key) {
      console.log(`  Created: ${data.key} — "${fail.testName}"`);
      await linkDefectInTestRail(fail.caseId, data.key);
      created++;
    } else {
      console.error(`  Failed to create bug for "${fail.testName}":`, JSON.stringify(data));
      errors++;
    }
  } catch (e) {
    console.error(`  Error processing "${fail.testName}":`, e.message);
    errors++;
  }
}

console.log(`\nSummary: ${created} created, ${skipped} skipped (existing), ${errors} errors`);
