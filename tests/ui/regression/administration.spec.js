import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Administration Panel', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const authAPI = new AuthAPI(request);
    const { body } = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    token = body.authentication.token;
  });

  test.beforeEach(async ({ page, pm }) => {
    await page.goto(ENV.baseUrl);
    await pm.navigationInteractions.dismissAllDialogs();
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
    await pm.productListPage.header.accountButton.waitFor({ state: 'visible', timeout: 10000 });
    await pm.navigationInteractions.dismissAllDialogs();
    await page.goto(ENV.baseUrl + URLS.administration);
    await pm.administrationPage.userRows.first().waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Should display registered users in admin panel', async ({ pm }) => {
    await allure.severity('critical');
    await allure.feature('Administration');
    await allure.story('View users');

    // Assert
    const usersCount = await pm.administrationInteractions.getUsersCount();
    expect(usersCount).toBeGreaterThan(0);
  });

  test('Should display user emails in admin panel', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('Administration');
    await allure.story('View user details');

    // Act
    const emails = await pm.administrationInteractions.getUserEmails();

    // Assert
    expect(emails.length).toBeGreaterThan(0);
    expect(emails.some(email => email.includes('@'))).toBeTruthy();
  });
});
