// scripts/syncTestStepsToXray.js
// Парсит TEST_CASES.md, находит Test issues в Xray, добавляет шаги и ожидаемые результаты
// Использование:
//   node scripts/syncTestStepsToXray.js \
//     --jiraUrl=https://theromed.atlassian.net \
//     --jiraUser=your@email.com \
//     --jiraToken=YOUR_API_TOKEN \
//     --projectKey=QA \
//     --testCasesFile=TEST_CASES.md \
//     --dryRun        (опционально — только показывает что будет сделано, без записи)

import fs from 'fs';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    jiraUrl:       { type: 'string' },
    jiraUser:      { type: 'string' },
    jiraToken:     { type: 'string' },
    projectKey:    { type: 'string' },
    testCasesFile: { type: 'string', default: 'TEST_CASES.md' },
    dryRun:        { type: 'boolean', default: false },
  },
});

// Validate required args
const required = ['jiraUrl', 'jiraUser', 'jiraToken', 'projectKey'];
for (const key of required) {
  if (!args[key]) {
    console.error(`Missing required argument: --${key}`);
    process.exit(1);
  }
}

const auth = Buffer.from(`${args.jiraUser}:${args.jiraToken}`).toString('base64');
const headers = {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ─── Parse TEST_CASES.md ───

const md = fs.readFileSync(args.testCasesFile, 'utf-8');

function parseTestCases(markdown) {
  const testCases = [];

  // Split by test case headers (#### TC-...)
  const tcBlocks = markdown.split(/####\s+(TC-[A-Z]+-[A-Z]+-\d+:\s+.+)/);

  for (let i = 1; i < tcBlocks.length; i += 2) {
    const header = tcBlocks[i].trim();
    const body = tcBlocks[i + 1] || '';

    // Extract TC ID and test name
    const headerMatch = header.match(/^(TC-[A-Z]+-[A-Z]+-\d+):\s+(.+)$/);
    if (!headerMatch) continue;

    const tcId = headerMatch[1];
    const testName = headerMatch[2].trim();

    // Extract steps
    const stepsMatch = body.match(/\*\*Steps\*\*:\s*\n([\s\S]*?)(?=\n\*\*Expected Result\*\*)/);
    const steps = [];
    if (stepsMatch) {
      const stepsText = stepsMatch[1];
      const stepLines = stepsText.match(/^\d+\.\s+.+$/gm);
      if (stepLines) {
        for (const line of stepLines) {
          steps.push(line.replace(/^\d+\.\s+/, '').trim());
        }
      }
    }

    // Extract expected result
    const expectedMatch = body.match(/\*\*Expected Result\*\*:\s*\n([\s\S]*?)(?=\n---|\n####|\n###|\n##|$)/);
    let expectedResult = '';
    if (expectedMatch) {
      expectedResult = expectedMatch[1]
        .trim()
        .split('\n')
        .map(l => l.replace(/^[-*]\s+/, '').trim())
        .filter(l => l.length > 0)
        .join('\n');
    }

    // Extract severity
    const severityMatch = body.match(/\*\*Severity\*\*\s*\|\s*(\w+)/);
    const severity = severityMatch ? severityMatch[1] : 'Normal';

    // Extract preconditions
    const precondMatch = body.match(/\*\*Preconditions\*\*\s*\|\s*(.+)\s*\|/);
    const preconditions = precondMatch ? precondMatch[1].trim() : '';

    testCases.push({
      tcId,
      testName,
      steps,
      expectedResult,
      severity,
      preconditions,
    });
  }

  return testCases;
}

const testCases = parseTestCases(md);
console.log(`Parsed ${testCases.length} test cases from ${args.testCasesFile}\n`);

if (testCases.length === 0) {
  console.error('No test cases found. Check the file format.');
  process.exit(1);
}

// ─── Find Xray Test issues and update steps ───

async function findTestIssue(testName) {
  // Search for Test issue by summary (Xray auto-provisioned from JUnit)
  const jql = `project = "${args.projectKey}" AND issuetype = Test AND summary ~ "${testName.replace(/"/g, '\\"')}"`;
  const url = `${args.jiraUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=5&fields=summary,status`;

  const res = await fetch(url, { headers });
  const data = await res.json();

  if (!data.issues || data.issues.length === 0) return null;

  // Find best match — exact or closest summary
  const exactMatch = data.issues.find(issue =>
    issue.fields.summary.includes(testName)
  );

  return exactMatch || data.issues[0];
}

async function updateTestSteps(issueKey, tc) {
  // Xray Cloud REST API: Update test steps
  // Endpoint: PUT /rest/raven/2.0/api/test/{issueKey}/steps
  // Note: This uses Xray's own REST API, not Jira's

  // For Xray Cloud, we use the Jira REST API to update the description with structured steps
  // since direct Xray REST API requires separate authentication

  // Build structured description with steps
  const content = [];

  // Preconditions
  if (tc.preconditions) {
    content.push({
      type: 'heading', attrs: { level: 3 },
      content: [{ type: 'text', text: 'Preconditions' }],
    });
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: tc.preconditions }],
    });
  }

  // Test Steps
  content.push({
    type: 'heading', attrs: { level: 3 },
    content: [{ type: 'text', text: 'Test Steps' }],
  });

  // Ordered list of steps
  content.push({
    type: 'orderedList',
    attrs: { order: 1 },
    content: tc.steps.map(step => ({
      type: 'listItem',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: step }],
      }],
    })),
  });

  // Expected Result
  content.push({
    type: 'heading', attrs: { level: 3 },
    content: [{ type: 'text', text: 'Expected Result' }],
  });

  const expectedLines = tc.expectedResult.split('\n');
  if (expectedLines.length > 1) {
    content.push({
      type: 'bulletList',
      content: expectedLines.map(line => ({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: line }],
        }],
      })),
    });
  } else {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: tc.expectedResult }],
    });
  }

  // Metadata
  content.push({
    type: 'paragraph',
    content: [
      { type: 'text', text: `Severity: ${tc.severity}`, marks: [{ type: 'em' }] },
      { type: 'text', text: ` | TC ID: ${tc.tcId}`, marks: [{ type: 'em' }] },
    ],
  });

  const updateUrl = `${args.jiraUrl}/rest/api/3/issue/${issueKey}`;
  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      fields: {
        description: {
          type: 'doc',
          version: 1,
          content,
        },
      },
    }),
  });

  if (res.status === 204 || res.status === 200) {
    return true;
  }

  const errorData = await res.text();
  console.error(`    Error updating ${issueKey}: ${res.status} ${errorData}`);
  return false;
}

// ─── Main loop ───

let updatedCount = 0;
let notFoundCount = 0;
let errorCount = 0;

for (const tc of testCases) {
  process.stdout.write(`[${tc.tcId}] "${tc.testName}" → `);

  const issue = await findTestIssue(tc.testName);

  if (!issue) {
    console.log('NOT FOUND in Xray (skipped)');
    notFoundCount++;
    continue;
  }

  if (args.dryRun) {
    console.log(`WOULD UPDATE ${issue.key} (${tc.steps.length} steps)`);
    updatedCount++;
    continue;
  }

  const success = await updateTestSteps(issue.key, tc);
  if (success) {
    console.log(`UPDATED ${issue.key} ✓ (${tc.steps.length} steps)`);
    updatedCount++;
  } else {
    console.log(`FAILED ${issue.key}`);
    errorCount++;
  }

  // Rate limiting: small delay between requests
  await new Promise(r => setTimeout(r, 200));
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`Summary: ${updatedCount} updated, ${notFoundCount} not found, ${errorCount} errors`);
console.log(`Total test cases in file: ${testCases.length}`);

if (notFoundCount > 0) {
  console.log(`\nNote: ${notFoundCount} test(s) not found in Xray.`);
  console.log('Make sure you ran a Jenkins build first so Xray auto-provisions Test issues.');
}
