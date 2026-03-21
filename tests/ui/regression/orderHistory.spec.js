import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';

test.describe('Order History', () => {

  test('Should display order history page for logged-in user', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Order History');
    await allure.story('View order history');

    // Arrange — login via UI
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);

    // Act — navigate to order history
    await page.goto(ENV.baseUrl + '/#/order-history');
    await page.waitForTimeout(1000);

    // Assert — page should load (no error), may be empty for new user
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    // New user has no orders — verify no crash
    expect(page.url()).toContain('order-history');
  });
});
