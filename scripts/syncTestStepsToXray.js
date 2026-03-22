// scripts/syncTestStepsToXray.js
// Парсит TEST_CASES.md, обновляет Test issues в Xray с шагами и ожидаемыми результатами
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
    debug:         { type: 'boolean', default: false },
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

// ─── Direct mapping: Test Case ID → Xray issue key ───
// Based on Xray auto-provisioned issues from first Jenkins run
const TC_TO_XRAY = {
  'TC-UI-S-001': 'QA-2',   // Should login with valid credentials
  'TC-UI-S-002': 'QA-3',   // Should show error with invalid credentials
  'TC-UI-S-003': 'QA-4',   // Should navigate to registration page
  'TC-UI-S-004': 'QA-7',   // Should register new user via UI
  'TC-UI-S-005': 'QA-8',   // Should show validation error for invalid email
  'TC-UI-S-006': 'QA-9',   // Should show error when passwords do not match
  'TC-UI-S-007': 'QA-5',   // Should navigate to main pages from header
  'TC-UI-S-008': 'QA-6',   // Should display header elements on home page
  'TC-UI-S-009': 'QA-10',  // Should find products matching search query
  'TC-UI-S-010': 'QA-11',  // Should show no results for non-existent product
  'TC-UI-R-001': 'QA-16',  // Should change password successfully
  'TC-UI-R-002': 'QA-17',  // Should show error when passwords do not match
  'TC-UI-R-003': 'QA-18',  // Should show error with wrong current password
  'TC-UI-R-004': 'QA-22',  // Should write a product review
  'TC-UI-R-005': 'QA-23',  // Should display existing reviews on product detail
  'TC-UI-R-006': 'QA-20',  // Should submit feedback with valid captcha
  'TC-UI-R-007': 'QA-21',  // Should not submit feedback without comment
  'TC-UI-R-008': 'QA-12',  // Should display registered users in admin panel
  'TC-UI-R-009': 'QA-13',  // Should display user emails in admin panel
  'TC-UI-R-010': 'QA-14',  // Should display added product in basket
  'TC-UI-R-011': 'QA-15',  // Should show empty basket message when no items
  'TC-UI-R-012': 'QA-19',  // Should complete checkout and see order confirmation
  'TC-API-S-001': 'QA-24', // Should return JWT token on valid login
  'TC-API-S-002': 'QA-25', // Should return 401 on invalid credentials
  'TC-API-S-003': 'QA-26', // Should return user info via whoami
  'TC-API-S-004': 'QA-27', // Should return list of all products
  'TC-API-S-005': 'QA-28', // Should return products matching search query
  'TC-API-S-006': 'QA-29', // Should register a new user
  'TC-API-S-007': 'QA-30', // Should return 400 for duplicate email
  'TC-API-R-001': 'QA-33', // Should create feedback via API
  'TC-API-R-002': 'QA-34', // Should delete feedback via API
  'TC-API-R-003': 'QA-31', // Should get basket by ID
  'TC-API-R-004': 'QA-32', // Should add item to basket
  'TC-API-R-005': 'QA-35', // Should checkout basket with items
  'TC-API-R-006': 'QA-36', // Should checkout empty basket and return confirmation

  // ─── New tests (Batch 1–4, Jenkins run created QA-57..QA-96) ───
  // UI Sanity — new
  'TC-UI-S-011': 'QA-57',  // Should display About Us page with company information
  'TC-UI-S-016': 'QA-58',  // Should display complaint form
  'TC-UI-S-017': 'QA-59',  // Should reset password with correct security answer (skipped)
  'TC-UI-S-018': 'QA-60',  // Should show error with wrong security answer (skipped)
  'TC-UI-S-012': 'QA-61',  // Should display products with pagination
  'TC-UI-S-013': 'QA-62',  // Should navigate to next page of products
  'TC-UI-S-014': 'QA-63',  // Should display user profile page
  'TC-UI-S-015': 'QA-64',  // Should update username on profile page

  // UI Regression — new
  'TC-UI-R-023': 'QA-65',  // Should increase product quantity in basket
  'TC-UI-R-024': 'QA-66',  // Should remove product from basket via UI
  'TC-UI-R-020': 'QA-67',  // Should display deluxe membership page with pricing
  'TC-UI-R-021': 'QA-68',  // Should show security question after entering email
  'TC-UI-R-022': 'QA-69',  // Should display order history page for logged-in user
  'TC-UI-R-013': 'QA-70',  // Should display product detail dialog with all fields
  'TC-UI-R-014': 'QA-71',  // Should close product detail dialog
  'TC-UI-R-019': 'QA-72',  // Should display score board with challenges
  'TC-UI-R-015': 'QA-73',  // Should display product names matching search query
  'TC-UI-R-016': 'QA-74',  // Should persist search query in URL
  'TC-UI-R-017': 'QA-75',  // Should open sidebar and navigate to About page
  'TC-UI-R-018': 'QA-76',  // Should navigate to Complaint page from sidebar

  // API Sanity — new
  'TC-API-S-012': 'QA-77', // Should reject login with empty credentials
  'TC-API-S-013': 'QA-78', // Should return token for SQL injection in email
  'TC-API-S-014': 'QA-79', // Should return user data via authentication details
  'TC-API-S-015': 'QA-80', // Should change password via API
  'TC-API-S-009': 'QA-81', // Should return single product by ID
  'TC-API-S-010': 'QA-82', // Should return 404 for non-existent product
  'TC-API-S-011': 'QA-83', // Should return empty results for non-matching search
  'TC-API-S-008': 'QA-84', // Should return list of security questions

  // API Regression — new
  'TC-API-R-007': 'QA-85', // Should create a new address
  'TC-API-R-008': 'QA-86', // Should get all addresses for user
  'TC-API-R-009': 'QA-87', // Should delete address by ID
  'TC-API-R-016': 'QA-88', // Should update basket item quantity
  'TC-API-R-017': 'QA-89', // Should not access another user basket (IDOR)
  'TC-API-R-018': 'QA-90', // Should reject adding item with non-existent product
  'TC-API-R-010': 'QA-91', // Should create a payment card
  'TC-API-R-011': 'QA-92', // Should delete payment card
  'TC-API-R-012': 'QA-93', // Should create a complaint
  'TC-API-R-013': 'QA-94', // Should get all complaints
  'TC-API-R-014': 'QA-95', // Should get reviews for a product
  'TC-API-R-015': 'QA-96', // Should add a review to a product
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

// ─── Update Test issues via Jira REST API ───

async function updateTestSteps(issueKey, tc) {
  // Build structured description (Atlassian Document Format)
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
  const body = JSON.stringify({
    fields: {
      description: {
        type: 'doc',
        version: 1,
        content,
      },
    },
  });

  if (args.debug) {
    console.log(`    PUT ${updateUrl}`);
  }

  const res = await fetch(updateUrl, {
    method: 'PUT',
    headers,
    body,
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
let skippedCount = 0;
let errorCount = 0;

for (const tc of testCases) {
  const issueKey = TC_TO_XRAY[tc.tcId];

  if (!issueKey) {
    console.log(`[${tc.tcId}] "${tc.testName}" → NO MAPPING (skipped)`);
    skippedCount++;
    continue;
  }

  process.stdout.write(`[${tc.tcId}] "${tc.testName}" → ${issueKey} `);

  if (args.dryRun) {
    console.log(`(dry run — ${tc.steps.length} steps, would update)`);
    updatedCount++;
    continue;
  }

  const success = await updateTestSteps(issueKey, tc);
  if (success) {
    console.log(`UPDATED (${tc.steps.length} steps)`);
    updatedCount++;
  } else {
    console.log('FAILED');
    errorCount++;
  }

  // Rate limiting: small delay between requests
  await new Promise(r => setTimeout(r, 200));
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`Summary: ${updatedCount} updated, ${skippedCount} skipped, ${errorCount} errors`);
console.log(`Total test cases: ${testCases.length}`);
