# Juice Shop Test Framework

Automated test framework for [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) built with **Playwright**, **Allure**, and **Jenkins CI/CD**.

**73 tests** (71 active + 2 skipped) | **33 spec files** | **4 test suites** | **Jira/Xray integration**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deploying Juice Shop](#deploying-juice-shop)
- [Framework Setup](#framework-setup)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Framework Architecture](#framework-architecture)
- [Project Structure](#project-structure)
- [Reports](#reports)
- [Jenkins CI/CD](#jenkins-cicd)
- [Jira/Xray Integration](#jiraxray-integration)
- [Writing New Tests](#writing-new-tests)
- [Cheat Sheet](#cheat-sheet)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Runtime for tests and Playwright |
| **npm** | 10+ | Package manager |
| **Docker** | 20+ | Running Juice Shop (recommended) |
| **Java** | 17+ | Jenkins (if using CI) |
| **Git** | 2.30+ | Version control |
| **Allure CLI** | 2.x | Report generation (optional, installed via npm) |

---

## Quick Start

```bash
# 1. Start Juice Shop
docker run -d -p 3000:3000 --name juice-shop bkimminich/juice-shop

# 2. Clone the framework
git clone https://github.com/theromed/playwrightTestFramework.git
cd playwrightTestFramework

# 3. Install dependencies
npm ci
npx playwright install chromium --with-deps

# 4. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 5. Run tests
npm test
```

---

## Deploying Juice Shop

### Option 1: Docker (Recommended)

```bash
# Pull and run
docker run -d -p 3000:3000 --name juice-shop bkimminich/juice-shop

# Verify it's running
curl http://localhost:3000

# Stop/Start
docker stop juice-shop
docker start juice-shop

# Reset database (fresh state)
docker restart juice-shop
```

### Option 2: From Source (Node.js)

```bash
git clone https://github.com/juice-shop/juice-shop.git
cd juice-shop
npm install
npm start
# Application will be available at http://localhost:3000
```

### Option 3: Cloud Deployment

Refer to the official [Juice Shop setup guide](https://pwning.owasp-juice.shop/companion-guide/latest/part1/running.html) for Heroku, Gitpod, Vagrant, and other deployment options.

### Verify Deployment

Open `http://localhost:3000` in a browser. You should see the Juice Shop storefront with products. The REST API is available at `http://localhost:3000/api` and `http://localhost:3000/rest`.

**Default admin credentials:**
- Email: `admin@juice-sh.op`
- Password: `admin123`

---

## Framework Setup

```bash
# Clone repository
git clone https://github.com/theromed/playwrightTestFramework.git
cd playwrightTestFramework

# Install Node.js dependencies
npm ci

# Install Playwright browser (Chromium)
npx playwright install chromium --with-deps

# Create environment file
cp .env.example .env
```

Edit `.env` with your values:

```env
BASE_URL=http://localhost:3000
API_URL=http://localhost:3000
ADMIN_EMAIL=admin@juice-sh.op
ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=test@juice-sh.op
TEST_USER_PASSWORD=Test1234!
HEADLESS=true
LOG_LEVEL=info
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Juice Shop application URL |
| `API_URL` | `http://localhost:3000` | API base URL |
| `ADMIN_EMAIL` | — | Admin account email |
| `ADMIN_PASSWORD` | — | Admin account password |
| `TEST_USER_PASSWORD` | — | Default password for temp users |
| `HEADLESS` | `true` | Run browser in headless mode |
| `LOG_LEVEL` | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`) |

### Playwright Projects

| Project | Directory | Browser | Purpose |
|---------|-----------|---------|---------|
| `ui-sanity` | `tests/ui/sanity/` | Desktop Chrome | Core UI smoke tests |
| `ui-regression` | `tests/ui/regression/` | Desktop Chrome | Extended UI coverage |
| `api-sanity` | `tests/api/sanity/` | — | Core API endpoint tests |
| `api-regression` | `tests/api/regression/` | — | Extended API coverage |

### Key Config Files

| File | Purpose |
|------|---------|
| `config/env.js` | Loads `.env` via dotenv, exports `ENV` object |
| `config/urls.js` | Application route mappings (`URLS` hash) |
| `config/testData.js` | Static test data constants (`TEST_DATA`) |
| `playwright.config.js` | Playwright configuration (projects, reporters, timeouts) |

---

## Running Tests

### NPM Scripts

```bash
# Run all tests (all 4 projects)
npm test

# Run by suite
npm run test:ui:sanity
npm run test:ui:regression
npm run test:api:sanity
npm run test:api:regression

# Run in headed mode (visible browser)
npm run test:headed
```

### Playwright CLI

```bash
# Run specific project
npx playwright test --project=ui-sanity

# Run multiple projects
npx playwright test --project=ui-sanity --project=api-sanity

# Run a single test file
npx playwright test tests/ui/sanity/login.spec.js

# Run tests matching a name pattern
npx playwright test --grep "login"

# Run with retries
npx playwright test --retries=2

# Run with specific number of workers
npx playwright test --workers=2

# Debug mode (step through tests)
npx playwright test --debug

# UI mode (interactive test runner)
npx playwright test --ui
```

---

## Framework Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Test Layer                         │
│  (spec files — AAA pattern, Allure metadata)         │
├─────────────────────────────────────────────────────┤
│              Interaction Layer                        │
│  (business logic, allure.step() wrapping)            │
├──────────────────────┬──────────────────────────────┤
│   Page Object Layer  │       API Layer               │
│  (locators only,     │  (BaseAPI → specific clients) │
│   NO methods)        │                               │
├──────────────────────┴──────────────────────────────┤
│  POManager (lazy-init factory) │ Fixtures (DI)       │
├──────────────────────┬──────────────────────────────┤
│     Components       │        Utilities              │
│  (reusable UI blocks)│  (Logger, Schema Validator)   │
└──────────────────────┴──────────────────────────────┘
```

### Key Patterns

- **Two-Layer UI**: Page Objects contain only locators (no methods). Interaction classes contain business logic wrapped in `allure.step()`.
- **POManager**: Lazy-initialization factory — objects are created on first access and cached for reuse within a test.
- **API Layer**: `BaseAPI` base class with `get()`, `post()`, `put()`, `delete()` methods. Specific API clients extend it.
- **Fixtures**: Custom Playwright `test` with dependency-injected fixtures (`pm`, `authAPI`, `tempUser`, etc.).
- **Self-Cleaning**: `tempUser` and `basketWithProduct` fixtures auto-create and auto-delete test data.
- **AAA Pattern**: Every test follows Arrange-Act-Assert with explicit comments.
- **API-First Setup**: Test data is created via API, not UI, for speed and isolation.

### Available Fixtures

| Fixture | Description |
|---------|-------------|
| `pm` | POManager — access to all page objects and interactions |
| `authAPI` | Authentication API client |
| `productsAPI` | Products API client |
| `basketAPI` | Basket API client |
| `feedbackAPI` | Feedback API client |
| `usersAPI` | Users API client |
| `addressAPI` | Address API client |
| `ordersAPI` | Orders API client |
| `cardAPI` | Payment Card API client |
| `securityQuestionsAPI` | Security Questions API client |
| `complaintAPI` | Complaint API client |
| `reviewsAPI` | Product Reviews API client |
| `authToken` | Pre-cached admin JWT token |
| `homePage` | Navigates to home page, dismisses banners |
| `tempUser` | Creates temp user, auto-deletes after test |
| `basketWithProduct` | Adds product to basket, auto-removes after test |

---

## Project Structure

```
juice-shop-tests-opus/
├── .env.example                  # Environment variables template
├── package.json                  # ESM project ("type": "module")
├── playwright.config.js          # 4 projects, Allure + JUnit reporters
├── Jenkinsfile                   # CI/CD pipeline
├── TEST_CASES.md                 # 73 test cases documentation
│
├── config/
│   ├── env.js                    # ENV from dotenv
│   ├── urls.js                   # Application route mappings
│   └── testData.js               # Static test data constants
│
├── framework/
│   └── POManager.js              # Lazy-init factory (pages + interactions)
│
├── fixtures/
│   └── base.fixture.js           # Custom test with all fixtures
│
├── pages/                        # Page Objects — locators only (*.page.js)
│   ├── login.page.js
│   ├── registration.page.js
│   ├── productList.page.js
│   ├── productDetail.page.js
│   ├── basket.page.js
│   ├── checkout.page.js
│   ├── changePassword.page.js
│   ├── forgotPassword.page.js
│   ├── userProfile.page.js
│   ├── about.page.js
│   └── ...                       # 20 page objects total
│
├── components/                   # Reusable UI blocks (*.component.js)
│   ├── welcomeBanner.component.js
│   ├── cookieBanner.component.js
│   ├── sidebar.component.js
│   └── header.component.js
│
├── helpers/
│   ├── page-interactions/        # Business logic (*.interactions.js)
│   │   ├── login.interactions.js
│   │   ├── registration.interactions.js
│   │   ├── basket.interactions.js
│   │   ├── checkout.interactions.js
│   │   └── ...                   # 13 interaction classes total
│   │
│   └── api/
│       ├── BaseAPI.js            # Base class (get/post/put/delete + logging)
│       ├── requests/             # API clients (*.api.js)
│       │   ├── auth.api.js
│       │   ├── products.api.js
│       │   ├── basket.api.js
│       │   ├── users.api.js
│       │   └── ...               # 12 API clients total
│       └── schemas/              # JSON schemas for validation
│           ├── login.schema.json
│           ├── product.schema.json
│           └── ...
│
├── utils/
│   ├── logger.js                 # Logger with Allure attachment flush
│   └── schemaValidator.js        # Ajv JSON schema validation
│
├── scripts/
│   ├── createBugsFromJunit.js    # Parse JUnit → create Jira bugs
│   └── syncTestStepsToXray.js    # Sync test steps to Xray issues
│
└── tests/
    ├── ui/
    │   ├── sanity/               # 9 spec files (18 tests)
    │   │   ├── login.spec.js
    │   │   ├── registration.spec.js
    │   │   ├── navigation.spec.js
    │   │   ├── search.spec.js
    │   │   ├── about.spec.js
    │   │   ├── pagination.spec.js
    │   │   ├── profile.spec.js
    │   │   ├── complaint.spec.js
    │   │   └── forgotPassword.spec.js
    │   └── regression/           # 13 spec files (24 tests)
    │       ├── changePassword.spec.js
    │       ├── productReview.spec.js
    │       ├── feedback.spec.js
    │       ├── administration.spec.js
    │       ├── basket.spec.js
    │       ├── checkout.spec.js
    │       ├── productDetail.spec.js
    │       ├── searchExtended.spec.js
    │       ├── sidebar.spec.js
    │       ├── scoreBoard.spec.js
    │       ├── deluxe.spec.js
    │       ├── forgotPassword.spec.js
    │       └── orderHistory.spec.js
    └── api/
        ├── sanity/               # 4 spec files (15 tests)
        │   ├── auth.api.spec.js
        │   ├── products.api.spec.js
        │   ├── users.api.spec.js
        │   └── securityQuestions.api.spec.js
        └── regression/           # 7 spec files (18 tests)
            ├── feedback.api.spec.js
            ├── basket.api.spec.js
            ├── orders.api.spec.js
            ├── address.api.spec.js
            ├── card.api.spec.js
            ├── complaint.api.spec.js
            └── reviews.api.spec.js
```

---

## Reports

### Allure Report

```bash
# Generate and open report
npm run report

# Or step by step:
npm run allure:generate    # Generate HTML from allure-results/
npm run allure:open        # Open the generated report

# Serve from results (live mode)
npm run allure:serve
```

Allure reports include:
- Test execution timeline
- Step-by-step breakdown with `allure.step()` annotations
- Screenshots and video on failure
- API request/response logs
- Severity, Feature, and Story metadata

### JUnit XML

Test results are also exported to `junit-results.xml` for CI integration (Jenkins, Xray).

### Cleanup

```bash
npm run clean       # Remove allure-results/, test-results/, junit-results.xml
npm run clean:all   # Full cleanup + reinstall node_modules
```

---

## Jenkins CI/CD

### Installing Jenkins

#### Option A: Docker (Recommended)

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts-jdk17

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

#### Option B: macOS (Homebrew)

```bash
brew install jenkins-lts
brew services start jenkins-lts
# Jenkins will be available at http://localhost:8080
```

#### Option C: WAR File

```bash
wget https://get.jenkins.io/war-stable/latest/jenkins.war
java -jar jenkins.war --httpPort=8080
```

### Required Plugins

Install these plugins via **Manage Jenkins > Plugins > Available**:

| Plugin | Purpose |
|--------|---------|
| **NodeJS** | Provides Node.js 20 runtime |
| **Allure Jenkins Plugin** | Generates and displays Allure reports |
| **Xray for Jira** | Imports test results to Jira Xray |
| **Slack Notification** | Sends test results to Slack |
| **Email Extension** | Sends email notifications on failure |
| **Pipeline** | Jenkins Pipeline support (usually pre-installed) |

### Global Tool Configuration

Go to **Manage Jenkins > Tools**:

1. **NodeJS installations**: Add `NodeJS-20` pointing to Node.js 20.x
2. **Allure Commandline**: Add `Allure` installation (auto-install from Maven Central)

### Credentials Setup

Go to **Manage Jenkins > Credentials > System > Global credentials**:

| Credential ID | Type | Description |
|---------------|------|-------------|
| `juice-admin-password` | Secret text | Juice Shop admin password |
| `juice-test-password` | Secret text | Default test user password |
| `jira-api-token` | Username with password | Jira email + API token |

### Creating the Pipeline Job

1. **New Item** > Enter name `juice-shop-tests` > Select **Pipeline** > OK
2. **Pipeline section**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/theromed/playwrightTestFramework.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. **Save**

### Xray Server Configuration

Go to **Manage Jenkins > System > Xray for Jira**:

1. Add Xray Server instance
2. Server URL: `https://theromed.atlassian.net`
3. Credentials: Select the `jira-api-token` credential
4. Note the Server Instance ID for the Jenkinsfile

### Pipeline Parameters

When running the job, you can configure:

| Parameter | Options | Default | Description |
|-----------|---------|---------|-------------|
| `TEST_SUITE` | all, ui-sanity, ui-regression, api-sanity, api-regression | `all` | Test suite to run |
| `BASE_URL` | Any URL | `http://localhost:3000` | Juice Shop URL |
| `RETRY_COUNT` | 0, 1, 2, 3 | `2` | Retries for failed tests |
| `WORKERS` | 1, 2, 4, 8 | `4` | Parallel Playwright workers |

### Pipeline Stages

```
Health Check → Install Dependencies → Run Tests → Allure Report → Import to Xray → Create Bugs
```

1. **Health Check** — Verifies Juice Shop is reachable (5 attempts, 10s intervals)
2. **Install Dependencies** — `npm ci` + Playwright browser install
3. **Run Tests** — Executes selected suite with configured retries/workers
4. **Allure Report** — Generates interactive HTML report
5. **Import to Xray** — Uploads `junit-results.xml` to Jira Xray, creates Test Executions
6. **Create Bugs for Failures** — Parses JUnit XML, creates Jira Bug issues for failed tests (only if tests failed)

### Automatic Scheduling

The pipeline runs automatically **Monday through Friday at ~2:00 AM** (cron: `H 2 * * 1-5`). Manual runs can be triggered via **Build with Parameters**.

### Post-Build Actions

- **Slack**: Sends notification to `#test-results` channel with status, duration, and report links
- **Email**: Sends detailed email on failure/instability
- **Artifacts**: Archives `allure-results/` and `test-results/` for download

---

## Jira/Xray Integration

### Automatic Test Result Import

When tests run in Jenkins, the **Import to Xray** stage uploads `junit-results.xml`. Xray automatically:

- Creates **Test** issues for each test case (if not already existing)
- Creates a **Test Execution** linked to a **Test Plan**
- Records pass/fail/skip status for each test

**Test Plan mapping:**

| Suite | Test Plan |
|-------|-----------|
| ui-sanity, api-sanity | QA-51 (Sanity Plan) |
| all | QA-52 (Regression Plan) |
| other | QA-53 (Ad-hoc Plan) |

### Automatic Bug Creation

When tests fail, `scripts/createBugsFromJunit.js` runs:

- Parses `junit-results.xml` for failures
- Checks for existing open bugs (avoids duplicates)
- Creates **Bug** issues in Jira project `KAN` with:
  - Test name, error message, stack trace
  - Links to Jenkins build and Allure report
  - Labels: `auto-bug`, `playwright`
- For existing bugs: adds a comment about repeated failure

### Syncing Test Steps to Xray

To populate Xray Test issues with detailed steps and expected results:

```bash
node scripts/syncTestStepsToXray.js \
  --jiraUrl=https://theromed.atlassian.net \
  --jiraUser=your@email.com \
  --jiraToken=YOUR_API_TOKEN \
  --projectKey=QA \
  --testCasesFile=TEST_CASES.md

# Preview without writing (dry run)
node scripts/syncTestStepsToXray.js \
  --jiraUrl=... --jiraUser=... --jiraToken=... \
  --projectKey=QA --dryRun
```

The script reads `TEST_CASES.md`, matches TC-IDs to Xray issue keys via an internal mapping, and updates each issue's description with structured test steps and expected results.

---

## Writing New Tests

### Step-by-step Guide

#### 1. Create Page Object (if new page)

```javascript
// pages/myPage.page.js
export class MyPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.submitButton = page.locator('#submit');
    // Locators ONLY — no methods
  }
}
```

#### 2. Create Interaction Class

```javascript
// helpers/page-interactions/myPage.interactions.js
import { allure } from 'allure-playwright';

export class MyPageInteractions {
  constructor(myPage) {
    this.mp = myPage;
  }

  async submitForm(data) {
    await allure.step('Submit the form', async () => {
      await this.mp.inputField.fill(data);
      await this.mp.submitButton.click();
    });
  }
}
```

#### 3. Register in POManager

```javascript
// framework/POManager.js — add getter
get myPage() { return this._getOrCreate('myPage', () => new MyPage(this.page)); }
get myPageInteractions() {
  return this._getOrCreate('myPageInteractions', () => new MyPageInteractions(this.myPage));
}
```

#### 4. Write the Test

```javascript
// tests/ui/sanity/myFeature.spec.js
import { test } from '../../../fixtures/base.fixture.js';
import { expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('My Feature', () => {
  test('Should do something expected', async ({ pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('My Feature');
    await allure.story('Expected behavior');

    // Arrange
    await pm.page.goto('/#/my-page');

    // Act
    await pm.myPageInteractions.submitForm('test data');

    // Assert
    await expect(pm.myPage.heading).toBeVisible();
  });
});
```

### Conventions

- **File naming**: `*.page.js`, `*.interactions.js`, `*.api.js`, `*.spec.js`
- **Test names**: `Should <expected behavior>`
- **AAA pattern**: Arrange-Act-Assert with explicit comments
- **Allure metadata**: Every test must have `severity`, `feature`, `story`
- **API-first setup**: Create test data via API, not UI
- **Cleanup**: Use `afterEach`/`afterAll` or self-cleaning fixtures (`tempUser`)
- **No locators in tests**: Only call Interaction methods

---

## Cheat Sheet

```bash
# ── Juice Shop ──
docker run -d -p 3000:3000 --name juice-shop bkimminich/juice-shop
docker restart juice-shop                    # Reset database

# ── Setup ──
npm ci                                       # Install deps
npx playwright install chromium --with-deps  # Install browser

# ── Run Tests ──
npm test                                     # All suites
npm run test:ui:sanity                       # UI smoke tests
npm run test:api:sanity                      # API smoke tests
npm run test:headed                          # Visible browser
npx playwright test --grep "login"           # Filter by name
npx playwright test --debug                  # Step-through debug
npx playwright test --ui                     # Interactive UI mode

# ── Reports ──
npm run report                               # Generate + open Allure
npm run allure:serve                         # Live report server

# ── Cleanup ──
npm run clean                                # Remove test artifacts
npm run clean:all                            # Full reset

# ── Jira/Xray ──
node scripts/syncTestStepsToXray.js \
  --jiraUrl=https://theromed.atlassian.net \
  --jiraUser=email --jiraToken=token \
  --projectKey=QA --dryRun                   # Preview sync
```

---

## Test Coverage

| Category | Suites | Tests | Active | Skipped |
|----------|--------|-------|--------|---------|
| UI Sanity | 9 | 18 | 16 | 2 |
| UI Regression | 13 | 24 | 24 | — |
| API Sanity | 4 | 15 | 15 | — |
| API Regression | 7 | 18 | 18 | — |
| **Total** | **33** | **73** | **71** | **2** |

**Covered areas**: Authentication, Registration, Navigation, Search, Products, Basket, Checkout, Orders, Feedback, Complaints, Administration, User Profile, Change Password, Forgot Password, Score Board, Deluxe Membership, Address, Payment Cards, Product Reviews, Security Questions.

