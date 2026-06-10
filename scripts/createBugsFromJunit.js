// scripts/createBugsFromJunit.js
// Парсит junit-results.xml, для каждого FAIL: создаёт/находит issue в Jira,
// прикрепляет screenshot. Пишет bugs-map.json для uploadResultsToTestRail.js
// (TestRail-линковка вынесена туда — теперь один аккуратный результат, без дублей).
//
// Обогащение баг-репорта:
//   - TestRail Case ссылка (clickable C<id>)
//   - Environment / Branch / BASE_URL
//   - Severity / Feature / Story (из allure-results)
//   - Reproduction command
//   - GitHub deep-link на строку теста (file:line из stack)
//   - Allure deep-link
//   - Screenshot attachment
//
// Использование (минимум):
//   node scripts/createBugsFromJunit.js \
//     --junit=junit-results.xml \
//     --jiraUrl=... --jiraUser=... --jiraToken=... --projectKey=KAN \
//     --buildUrl=... --buildNumber=...
//
// Полный набор аргументов — см. parseArgs ниже.

import fs from 'fs';
import path from 'path';
import { parseArgs } from 'node:util';
import { XMLParser } from 'fast-xml-parser';

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
    // Обогащение
    allureDir:        { type: 'string', default: 'allure-results' },
    testEnv:          { type: 'string', default: '' },        // Local / Staging / Production
    branch:           { type: 'string', default: '' },         // git branch
    baseUrl:          { type: 'string', default: '' },         // BASE_URL приложения
    gitRepo:          { type: 'string', default: '' },         // напр. theromed/playwrightTestFramework
    gitSha:           { type: 'string', default: '' },         // SHA для GitHub deep-link
    // TestRail (нужны только URL для clickable Case-link в баге; результаты заливает отдельный скрипт)
    testrailUrl:      { type: 'string', default: '' },
    // Output: маппинг "<className>::<cleanTitle>" -> "<jiraKey>" для uploadResultsToTestRail.js
    bugsMapOut:       { type: 'string', default: 'bugs-map.json' },
  },
});

for (const k of ['junit', 'jiraUrl', 'jiraUser', 'jiraToken', 'projectKey', 'buildUrl', 'buildNumber']) {
  if (!args[k]) { console.error(`Missing required argument: --${k}`); process.exit(1); }
}

// ─── Парсинг JUnit ───
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
    collectTestcases(s, acc);
  }
  return acc;
}

function extractAttachments(systemOut) {
  // <system-out> содержит маркеры [[ATTACHMENT|<path>]] (один на строку)
  if (!systemOut) return [];
  const text = typeof systemOut === 'object' ? (systemOut['#text'] || '') : String(systemOut);
  const re = /\[\[ATTACHMENT\|([^\]]+)\]\]/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1].trim());
  return out;
}

const failures = [];
for (const tc of collectTestcases(xml)) {
  if (!tc.failure && !tc.error) continue;
  const fail = [].concat(tc.failure || tc.error)[0] || {};
  const props = [].concat(tc.properties?.property || []);
  const prop = (n) => props.find(p => p['@_name'] === n)?.['@_value'];

  const fullName = tc['@_name'] || 'unknown';
  // testname в junit: "<describe> › <title>". Чистый title — из annotation, либо последний сегмент
  const cleanTitle = prop('test_title') || fullName.split(' › ').pop().trim();

  failures.push({
    fullName,
    cleanTitle,
    project: prop('playwright_project'),
    className: tc['@_classname'] || '',
    duration: Number(tc['@_time'] || 0),
    message: (fail['@_message'] || '').slice(0, 500),
    stackTrace: (typeof fail === 'object' ? (fail['#text'] || '') : String(fail)).trim().slice(0, 2500),
    caseId: prop('test_id') ? String(prop('test_id')).replace(/^C/i, '').trim() : null,
    attachments: extractAttachments(tc['system-out']),
  });
}

if (failures.length === 0) { console.log('No failures found in JUnit report.'); process.exit(0); }
console.log(`Found ${failures.length} failure(s). Processing...`);

// ─── Allure: severity / feature / story / uuid ───
function loadAllureResults(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('-result.json')) continue;
    try { out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))); } catch {}
  }
  return out;
}
const allureResults = loadAllureResults(args.allureDir);

function findAllureFor(fail) {
  // Матчим по чистому имени теста + status=failed + (при наличии) project через parentSuite label
  const candidates = allureResults.filter(r =>
    r.status === 'failed' && r.name === fail.cleanTitle
  );
  if (!candidates.length) return null;
  if (fail.project) {
    const byProject = candidates.find(r =>
      (r.labels || []).some(l => l.name === 'parentSuite' && l.value === fail.project)
    );
    if (byProject) return byProject;
  }
  // Самый свежий
  candidates.sort((a, b) => (b.stop || 0) - (a.stop || 0));
  return candidates[0];
}

const getLabel = (allure, name) => (allure?.labels || []).find(l => l.name === name)?.value;

// ─── Stack parsing: file:line ───
function extractLine(stack, fileHint) {
  if (!stack || !fileHint) return null;
  const escaped = fileHint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = stack.match(new RegExp(`${escaped}:(\\d+):\\d+`));
  return m ? Number(m[1]) : null;
}

// ─── Builders ───
function reproCommand(fail) {
  const file = fail.className.startsWith('tests/') ? fail.className : `tests/${fail.className}`;
  const safeName = fail.cleanTitle.replace(/"/g, '\\"');
  const proj = fail.project ? ` --project=${fail.project}` : '';
  return `npx playwright test ${file} -g "${safeName}"${proj}`;
}

function githubLink(fail) {
  if (!args.gitRepo || !args.gitSha) return null;
  const file = fail.className.startsWith('tests/') ? fail.className : `tests/${fail.className}`;
  const line = extractLine(fail.stackTrace, fail.className);
  return `https://github.com/${args.gitRepo}/blob/${args.gitSha}/${file}${line ? `#L${line}` : ''}`;
}

function testRailCaseLink(caseId) {
  if (!caseId || !args.testrailUrl) return null;
  return `${args.testrailUrl.replace(/\/+$/, '')}/index.php?/cases/view/${caseId}`;
}

function allureLink() {
  // Allure plugin отдаёт UI по ${BUILD_URL}allure/. Корневая ссылка —
  // без углублённого роутинга (uuid меняется между прогонами). В UI
  // искать по UUID/historyId из подсказки в теле.
  return args.buildUrl ? `${args.buildUrl}allure/` : null;
}

// ─── ADF helpers ───
const para = (...nodes) => ({ type: 'paragraph', content: nodes });
const text = (t, marks) => ({ type: 'text', text: String(t), ...(marks ? { marks } : {}) });
const link = (t, href) => text(t, [{ type: 'link', attrs: { href } }]);
const strong = (t) => text(t, [{ type: 'strong' }]);
const heading = (level, t) => ({ type: 'heading', attrs: { level }, content: [text(t)] });
const code = (t, lang = 'text') => ({
  type: 'codeBlock', attrs: { language: lang },
  content: [text(t)],
});
const rule = () => ({ type: 'rule' });

function buildDescription(fail, allure, jiraIssueKey) {
  const content = [];
  content.push(heading(3, 'Automated test failure'));

  content.push(para(
    strong('Test: '), text(`${fail.className} → ${fail.cleanTitle}`),
  ));
  content.push(para(
    strong('Duration: '), text(`${fail.duration.toFixed(2)}s`),
  ));

  // Environment box
  const envBits = [];
  if (args.testEnv) envBits.push(['Env', args.testEnv]);
  if (args.branch)  envBits.push(['Branch', args.branch]);
  if (args.baseUrl) envBits.push(['BASE_URL', args.baseUrl]);
  if (envBits.length) {
    content.push(heading(4, 'Environment'));
    const inline = [];
    envBits.forEach(([k, v], i) => {
      if (i) inline.push(text(' | '));
      inline.push(strong(`${k}: `), text(v));
    });
    content.push(para(...inline));
  }

  // Metadata from Allure
  if (allure) {
    const bits = [];
    const sev = getLabel(allure, 'severity');
    const feat = getLabel(allure, 'feature');
    const story = getLabel(allure, 'story');
    if (sev)   bits.push(['Severity', sev]);
    if (feat)  bits.push(['Feature', feat]);
    if (story) bits.push(['Story', story]);
    if (bits.length) {
      content.push(heading(4, 'Test metadata'));
      const inline = [];
      bits.forEach(([k, v], i) => {
        if (i) inline.push(text(' | '));
        inline.push(strong(`${k}: `), text(v));
      });
      content.push(para(...inline));
    }
  }

  // Error + stack
  content.push(heading(4, 'Error'));
  content.push(para(text(fail.message || '(no message)')));
  if (fail.stackTrace) {
    content.push(code(fail.stackTrace));
  }

  // Links
  const links = [];
  const trLink = testRailCaseLink(fail.caseId);
  const ghLink = githubLink(fail);
  const alLink = allureLink();
  if (trLink) links.push(['TestRail Case', `C${fail.caseId}`, trLink]);
  if (ghLink) links.push(['Source on GitHub', fail.className, ghLink]);
  if (alLink) links.push(['Allure Report', `Build #${args.buildNumber}`, alLink]);
  links.push(['Jenkins Build', `#${args.buildNumber}`, args.buildUrl]);
  if (links.length) {
    content.push(heading(4, 'Links'));
    content.push({
      type: 'bulletList',
      content: links.map(([label, txt, href]) => ({
        type: 'listItem',
        content: [para(strong(`${label}: `), link(txt, href))],
      })),
    });
  }

  // Allure UUID hint (для поиска в UI, т.к. deep-link нестабильный)
  if (allure?.uuid) {
    content.push(para(text(`Allure UUID: ${allure.uuid}`, [{ type: 'em' }])));
  }

  // Repro command
  content.push(heading(4, 'Reproduce locally'));
  content.push(code(reproCommand(fail), 'bash'));

  // Attachment note
  if (jiraIssueKey && fail.attachments.some(a => /test-failed-\d+\.png$/.test(a))) {
    content.push(para(text('Screenshot attached. See Attachments section below.', [{ type: 'em' }])));
  }

  return { type: 'doc', version: 1, content };
}

// ─── Jira ───
const jiraAuth = Buffer.from(`${args.jiraUser}:${args.jiraToken}`).toString('base64');
const jiraHeaders = {
  Authorization: `Basic ${jiraAuth}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function attachScreenshotToJira(issueKey, screenshotPath) {
  if (!screenshotPath || !fs.existsSync(screenshotPath)) return false;
  try {
    const buf = fs.readFileSync(screenshotPath);
    const form = new FormData();
    form.append('file', new Blob([buf], { type: 'image/png' }), path.basename(screenshotPath));
    const res = await fetch(`${args.jiraUrl}/rest/api/3/issue/${issueKey}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: jiraHeaders.Authorization,
        Accept: 'application/json',
        'X-Atlassian-Token': 'no-check',
        // НЕ ставим Content-Type — fetch сам сделает multipart boundary
      },
      body: form,
    });
    if (!res.ok) {
      console.warn(`    Jira: attach failed: ${res.status} ${await res.text()}`);
      return false;
    }
    console.log(`    Jira: attached ${path.basename(screenshotPath)} → ${issueKey}`);
    return true;
  } catch (e) {
    console.warn(`    Jira: attach error — ${e.message}`);
    return false;
  }
}

// ─── Main loop ───
// bugsMap: "<className>::<cleanTitle>" -> "<jiraKey>" (читает uploadResultsToTestRail.js)
const bugsMap = {};
let created = 0, skipped = 0, errors = 0;

for (const fail of failures) {
  const allure = findAllureFor(fail);
  const screenshotPath = fail.attachments.find(a => /test-failed-\d+\.png$/.test(a)) || null;
  const summary = `[Auto] Test failed: ${fail.className} — ${fail.cleanTitle}`;

  try {
    // Dedup
    const jql = `project = "${args.projectKey}" AND summary ~ "${fail.cleanTitle.replace(/"/g, '\\"')}" AND status != Done AND type = "${args.issueType}"`;
    const searchRes = await fetch(`${args.jiraUrl}/rest/api/3/search/jql`, {
      method: 'POST', headers: jiraHeaders,
      body: JSON.stringify({ jql, maxResults: 1, fields: ['summary', 'status'] }),
    });
    const searchData = await searchRes.json();

    if (searchData.total > 0) {
      const existingKey = searchData.issues[0].key;
      console.log(`  Skip: "${fail.cleanTitle}" — issue exists: ${existingKey}`);
      await fetch(`${args.jiraUrl}/rest/api/3/issue/${existingKey}/comment`, {
        method: 'POST', headers: jiraHeaders,
        body: JSON.stringify({ body: { type: 'doc', version: 1, content: [
          para(
            text(`Still failing in Build #${args.buildNumber}: `),
            link(args.buildUrl, args.buildUrl),
          ),
        ] } }),
      });
      bugsMap[`${fail.className}::${fail.cleanTitle}`] = existingKey;
      skipped++;
      continue;
    }

    // Create
    const description = buildDescription(fail, allure, null);
    const res = await fetch(`${args.jiraUrl}/rest/api/3/issue`, {
      method: 'POST', headers: jiraHeaders,
      body: JSON.stringify({ fields: {
        project: { key: args.projectKey },
        issuetype: { name: args.issueType },
        summary: summary.slice(0, 255),
        description,
        labels: ['auto-bug', 'playwright'],
      } }),
    });
    const data = await res.json();
    if (data.key) {
      console.log(`  Created: ${data.key} — "${fail.cleanTitle}"`);
      if (screenshotPath) await attachScreenshotToJira(data.key, screenshotPath);
      bugsMap[`${fail.className}::${fail.cleanTitle}`] = data.key;
      created++;
    } else {
      console.error(`  Failed to create issue for "${fail.cleanTitle}":`, JSON.stringify(data));
      errors++;
    }
  } catch (e) {
    console.error(`  Error processing "${fail.cleanTitle}":`, e.message);
    errors++;
  }
}

if (Object.keys(bugsMap).length) {
  fs.writeFileSync(args.bugsMapOut, JSON.stringify(bugsMap, null, 2) + '\n');
  console.log(`\nWrote ${args.bugsMapOut} (${Object.keys(bugsMap).length} entries — used by uploadResultsToTestRail.js for Defects)`);
}

console.log(`\nSummary: ${created} created, ${skipped} skipped (existing), ${errors} errors`);
