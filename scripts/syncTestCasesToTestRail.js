// scripts/syncTestCasesToTestRail.js
// Парсит TEST_CASES.md, создаёт/обновляет Cases в TestRail, пишет маппинги.
// Использование:
//   node scripts/syncTestCasesToTestRail.js \
//     --url=$TESTRAIL_URL --user=$TESTRAIL_USER --key=$TESTRAIL_API_KEY \
//     --projectId=$TESTRAIL_PROJECT_ID --suiteId=$TESTRAIL_SUITE_ID \
//     [--testCasesFile=TEST_CASES.md] [--dryRun]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'node:util';
import { TestRailClient } from '../config/testrailClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.resolve(__dirname, '../config');

const { values: args } = parseArgs({
  options: {
    url:           { type: 'string' },
    user:          { type: 'string' },
    key:           { type: 'string' },
    projectId:     { type: 'string' },
    suiteId:       { type: 'string' },
    testCasesFile: { type: 'string', default: 'TEST_CASES.md' },
    dryRun:        { type: 'boolean', default: false },
  },
});

for (const k of ['url', 'user', 'key', 'projectId', 'suiteId']) {
  if (!args[k]) { console.error(`Missing required argument: --${k}`); process.exit(1); }
}

// TC-префикс → { project (Playwright), section (TestRail) }
const GROUP = {
  'UI-S':  { project: 'ui-sanity',      section: 'UI Sanity' },
  'UI-R':  { project: 'ui-regression',  section: 'UI Regression' },
  'API-S': { project: 'api-sanity',     section: 'API Sanity' },
  'API-R': { project: 'api-regression', section: 'API Regression' },
};
function groupOf(tcId) {
  const m = tcId.match(/^TC-(UI|API)-(S|R)-\d+$/);
  return m ? GROUP[`${m[1]}-${m[2]}`] : null;
}

// ─── Парсер TEST_CASES.md (перенесён из syncTestStepsToXray.js без изменений) ───
function parseTestCases(markdown) {
  const testCases = [];
  const tcBlocks = markdown.split(/####\s+(TC-[A-Z]+-[A-Z]+-\d+:\s+.+)/);
  for (let i = 1; i < tcBlocks.length; i += 2) {
    const header = tcBlocks[i].trim();
    const body = tcBlocks[i + 1] || '';
    const headerMatch = header.match(/^(TC-[A-Z]+-[A-Z]+-\d+):\s+(.+)$/);
    if (!headerMatch) continue;
    const tcId = headerMatch[1];
    const testName = headerMatch[2].trim();

    const stepsMatch = body.match(/\*\*Steps\*\*:\s*\n([\s\S]*?)(?=\n\*\*Expected Result\*\*)/);
    const steps = [];
    if (stepsMatch) {
      const stepLines = stepsMatch[1].match(/^\d+\.\s+.+$/gm);
      if (stepLines) for (const line of stepLines) steps.push(line.replace(/^\d+\.\s+/, '').trim());
    }

    const expectedMatch = body.match(/\*\*Expected Result\*\*:\s*\n([\s\S]*?)(?=\n---|\n####|\n###|\n##|$)/);
    let expectedResult = '';
    if (expectedMatch) {
      expectedResult = expectedMatch[1].trim().split('\n')
        .map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean).join('\n');
    }

    const severityMatch = body.match(/\*\*Severity\*\*\s*\|\s*(\w+)/);
    const severity = severityMatch ? severityMatch[1] : 'Normal';
    const precondMatch = body.match(/\*\*Preconditions\*\*\s*\|\s*(.+)\s*\|/);
    const preconditions = precondMatch ? precondMatch[1].trim() : '';

    testCases.push({ tcId, testName, steps, expectedResult, severity, preconditions });
  }
  return testCases;
}

// severity (из md) → имя приоритета TestRail
const SEVERITY_TO_PRIORITY = {
  blocker: 'Critical', critical: 'Critical',
  major: 'High',
  normal: 'Medium', medium: 'Medium',
  minor: 'Low', low: 'Low', trivial: 'Low',
};

const tr = new TestRailClient({ url: args.url, user: args.user, apiKey: args.key });
const projectId = Number(args.projectId);
const suiteId = Number(args.suiteId);

const md = fs.readFileSync(args.testCasesFile, 'utf-8');
const testCases = parseTestCases(md);
console.log(`Parsed ${testCases.length} test cases from ${args.testCasesFile}\n`);
if (testCases.length === 0) { console.error('No test cases found. Check the file format.'); process.exit(1); }

// Резолвим template_id ("Test Case (Steps)") и приоритеты
const templates = await tr.getTemplates(projectId);
const stepsTemplate = templates.find(t => /step/i.test(t.name)) || templates[0];
if (!stepsTemplate) { console.error('No templates found in project.'); process.exit(1); }

const priorities = await tr.getPriorities();
const priByName = Object.fromEntries(priorities.map(p => [p.name.toLowerCase(), p.id]));
const defaultPriId = (priorities.find(p => p.is_default) || priorities[0])?.id;
function priorityIdFor(severity) {
  const name = (SEVERITY_TO_PRIORITY[String(severity).toLowerCase()] || '').toLowerCase();
  return priByName[name] || defaultPriId;
}

// Существующие/создаваемые секции
const existingSections = await tr.getSections(projectId, suiteId);
const sectionIdByName = Object.fromEntries(existingSections.map(s => [s.name, s.id]));
async function ensureSection(name) {
  if (sectionIdByName[name]) return sectionIdByName[name];
  if (args.dryRun) { console.log(`(dry) would create section "${name}"`); sectionIdByName[name] = `DRY-${name}`; return sectionIdByName[name]; }
  const created = await tr.addSection(projectId, { suite_id: suiteId, name });
  sectionIdByName[name] = created.id;
  console.log(`Created section "${name}" → id ${created.id}`);
  return created.id;
}

// Загружаем существующий маппинг (идемпотентность)
const mapPath = path.join(CONFIG_DIR, 'testrailMap.json');
const specPath = path.join(CONFIG_DIR, 'specToCase.json');
const tcToCase = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf-8')) : {};
const specToCase = {};

function caseBody(tc) {
  const steps = tc.steps.map((s, idx) => ({
    content: s,
    // весь Expected Result кладём в expected последнего шага
    expected: idx === tc.steps.length - 1 ? tc.expectedResult : '',
  }));
  return {
    title: tc.testName.slice(0, 250),
    template_id: stepsTemplate.id,
    priority_id: priorityIdFor(tc.severity),
    custom_preconds: tc.preconditions || '',
    custom_steps_separated: steps.length ? steps : [{ content: '(no steps)', expected: tc.expectedResult }],
  };
}

let created = 0, updated = 0, skipped = 0, errors = 0;

for (const tc of testCases) {
  const grp = groupOf(tc.tcId);
  if (!grp) { console.log(`[${tc.tcId}] no group mapping — skipped`); skipped++; continue; }

  try {
    const body = caseBody(tc);
    let caseId = tcToCase[tc.tcId];

    if (caseId && !args.dryRun) {
      await tr.updateCase(Number(caseId), body);
      updated++;
      console.log(`[${tc.tcId}] "${tc.testName}" → C${caseId} UPDATED`);
    } else if (caseId && args.dryRun) {
      console.log(`[${tc.tcId}] (dry) would UPDATE C${caseId}`); updated++;
    } else {
      const sectionId = await ensureSection(grp.section);
      if (args.dryRun) {
        console.log(`[${tc.tcId}] (dry) would CREATE in "${grp.section}"`); created++;
        continue; // в dry-run C-id не присваиваем
      }
      const res = await tr.addCase(sectionId, body);
      caseId = res.id;
      tcToCase[tc.tcId] = caseId;
      created++;
      console.log(`[${tc.tcId}] "${tc.testName}" → C${caseId} CREATED`);
    }

    if (caseId) specToCase[`${grp.project}::${tc.testName}`] = `C${caseId}`;
    await new Promise(r => setTimeout(r, 120)); // мягкий rate-limit
  } catch (e) {
    errors++;
    console.error(`[${tc.tcId}] ERROR: ${e.message}`);
  }
}

if (!args.dryRun) {
  fs.writeFileSync(mapPath, JSON.stringify(tcToCase, null, 2) + '\n');
  fs.writeFileSync(specPath, JSON.stringify(specToCase, null, 2) + '\n');
  console.log(`\nWrote ${mapPath} and ${specPath}`);
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`Summary: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`);
