import { defineConfig, devices } from '@playwright/test';
import { ENV } from './config/env.js';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ['list'],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      detail: true,
      suiteTitle: true,
    }],
    ['junit', {
      outputFile: 'junit-results.xml',
      embedAnnotationsAsProperties: true,
      includeProjectInTestName: false,
    }],
  ],

  use: {
    baseURL: ENV.baseUrl,
    headless: ENV.headless,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'ui-sanity',
      testDir: './tests/ui/sanity',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-regression',
      testDir: './tests/ui/regression',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api-sanity',
      testDir: './tests/api/sanity',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api-regression',
      testDir: './tests/api/regression',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
