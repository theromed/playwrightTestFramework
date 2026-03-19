// scripts/createBugsFromJunit.js
// Парсит junit-results.xml, находит FAIL, создаёт Bug в Jira через REST API
// Использование: node scripts/createBugsFromJunit.js --junit=junit-results.xml --jiraUrl=... --jiraUser=... --jiraToken=... --projectKey=KAN --buildUrl=... --buildNumber=...

import fs from 'fs';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    junit:       { type: 'string' },
    jiraUrl:     { type: 'string' },
    jiraUser:    { type: 'string' },
    jiraToken:   { type: 'string' },
    projectKey:  { type: 'string' },
    buildUrl:    { type: 'string' },
    buildNumber: { type: 'string' },
  },
});

// Validate required args
for (const [key, val] of Object.entries(args)) {
  if (!val) {
    console.error(`Missing required argument: --${key}`);
    process.exit(1);
  }
}

// Simple JUnit XML parser (no external deps)
const xml = fs.readFileSync(args.junit, 'utf-8');
const failureRegex = /<testcase\s+[^>]*name="([^"]+)"[^>]*classname="([^"]+)"[^>]*>[\s\S]*?<failure[^>]*message="([^"]*)"[^>]*>([\s\S]*?)<\/failure>/g;

let match;
const failures = [];
while ((match = failureRegex.exec(xml)) !== null) {
  failures.push({
    testName: match[1],
    className: match[2],
    message: match[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
    stackTrace: match[4].trim().substring(0, 2000),
  });
}

if (failures.length === 0) {
  console.log('No failures found in JUnit report.');
  process.exit(0);
}

console.log(`Found ${failures.length} failure(s). Processing...`);

const auth = Buffer.from(`${args.jiraUser}:${args.jiraToken}`).toString('base64');
const headers = {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

let createdCount = 0;
let skippedCount = 0;
let errorCount = 0;

for (const fail of failures) {
  const summary = `[Auto] Test failed: ${fail.className} — ${fail.testName}`;

  try {
    // Check for existing open bug with similar test name
    const searchJql = `project = "${args.projectKey}" AND summary ~ "${fail.testName.replace(/"/g, '\\"')}" AND status != Done AND type = Bug`;
    const searchUrl = `${args.jiraUrl}/rest/api/3/search?jql=${encodeURIComponent(searchJql)}&maxResults=1`;

    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();

    if (searchData.total > 0) {
      const existingKey = searchData.issues[0].key;
      console.log(`  Skip: "${fail.testName}" — bug already exists: ${existingKey}`);

      // Add comment about repeated failure
      const commentUrl = `${args.jiraUrl}/rest/api/3/issue/${existingKey}/comment`;
      await fetch(commentUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          body: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [
                { type: 'text', text: `Still failing in Build #${args.buildNumber}: ` },
                { type: 'text', text: args.buildUrl, marks: [{ type: 'link', attrs: { href: args.buildUrl } }] },
              ],
            }],
          },
        }),
      });

      skippedCount++;
      continue;
    }

    // Create new bug
    const createUrl = `${args.jiraUrl}/rest/api/3/issue`;
    const res = await fetch(createUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fields: {
          project: { key: args.projectKey },
          issuetype: { name: 'Bug' },
          summary: summary.substring(0, 255),
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'heading', attrs: { level: 3 },
                content: [{ type: 'text', text: 'Automated test failure' }],
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Test: ', marks: [{ type: 'strong' }] },
                  { type: 'text', text: `${fail.className} → ${fail.testName}` },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Error: ', marks: [{ type: 'strong' }] },
                  { type: 'text', text: fail.message || 'No message' },
                ],
              },
              {
                type: 'codeBlock', attrs: { language: 'text' },
                content: [{ type: 'text', text: fail.stackTrace || 'No stack trace' }],
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Jenkins Build: ' },
                  { type: 'text', text: `#${args.buildNumber}`, marks: [{ type: 'link', attrs: { href: args.buildUrl } }] },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Allure Report: ' },
                  { type: 'text', text: 'Open Report', marks: [{ type: 'link', attrs: { href: `${args.buildUrl}allure` } }] },
                ],
              },
            ],
          },
          labels: ['auto-bug', 'playwright'],
          priority: { name: 'High' },
        },
      }),
    });

    const data = await res.json();
    if (data.key) {
      console.log(`  Created: ${data.key} — "${fail.testName}"`);
      createdCount++;
    } else {
      console.error(`  Failed to create bug for "${fail.testName}":`, JSON.stringify(data));
      errorCount++;
    }
  } catch (error) {
    console.error(`  Error processing "${fail.testName}":`, error.message);
    errorCount++;
  }
}

console.log(`\nSummary: ${createdCount} created, ${skippedCount} skipped (existing), ${errorCount} errors`);
