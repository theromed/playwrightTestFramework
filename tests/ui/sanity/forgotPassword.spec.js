import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Forgot Password', () => {

  // TODO: Needs investigation — Material Design mat-label overlays intercept pointer events,
  // force:true fill doesn't trigger Angular change detection so form stays invalid (reset button disabled).
  test.skip('Should reset password with correct security answer', async ({ page, pm, tempUser, authAPI }) => {
    await allure.severity('critical');
    await allure.feature('Forgot Password');
    await allure.story('Successful password reset');

    // Arrange
    const newPassword = 'ResetPass123!';
    await page.goto(ENV.baseUrl + URLS.forgotPassword);
    await pm.navigationInteractions.dismissAllDialogs();

    // Act — tempUser was created with securityAnswer 'default'
    await pm.forgotPasswordInteractions.resetPassword(tempUser.email, 'default', newPassword);

    // Assert — should redirect to login page
    await page.waitForURL(`**${URLS.login}`, { timeout: 10000 });
    expect(page.url()).toContain(URLS.login);

    // Verify new password works via API
    const loginResult = await authAPI.login(tempUser.email, newPassword);
    expect(loginResult.status).toBe(200);
  });

  // TODO: Same mat-label overlay issue as above
  test.skip('Should show error with wrong security answer', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Forgot Password');
    await allure.story('Wrong security answer');

    // Arrange
    await page.goto(ENV.baseUrl + URLS.forgotPassword);
    await pm.navigationInteractions.dismissAllDialogs();

    // Act
    await pm.forgotPasswordInteractions.resetPassword(tempUser.email, 'WrongAnswer', 'NewPass123!');

    // Assert
    const errorText = await pm.forgotPasswordInteractions.getErrorMessage();
    expect(errorText).toBeTruthy();
  });
});
