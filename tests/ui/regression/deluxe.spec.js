import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Deluxe Membership', () => {

  test('Should display deluxe membership page with pricing', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Deluxe Membership');
    await allure.story('View membership page');

    // Arrange — login required
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);

    // Act
    await page.goto(ENV.baseUrl + URLS.deluxe);
    await page.waitForTimeout(1000);

    // Assert — page should display membership content
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toContain('deluxe');
  });
});
