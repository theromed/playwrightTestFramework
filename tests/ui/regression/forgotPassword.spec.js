import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Forgot Password Extended', () => {

  test('Should show security question after entering email', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Forgot Password');
    await allure.story('Security question display');

    // Arrange
    await page.goto(ENV.baseUrl + URLS.forgotPassword);
    await pm.navigationInteractions.dismissAllDialogs();

    // Act — enter the temp user's email
    await pm.forgotPasswordPage.emailInput.fill(tempUser.email);
    await pm.forgotPasswordPage.emailInput.press('Tab');

    // Assert — security question area should become visible
    await pm.forgotPasswordPage.securityAnswerInput.waitFor({ state: 'visible', timeout: 5000 });
    await expect(pm.forgotPasswordPage.securityAnswerInput).toBeVisible();
  });
});
