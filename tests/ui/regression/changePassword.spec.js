import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Change Password', () => {

  test('Should change password successfully', async ({ page, pm, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Change Password');
    await allure.story('Successful password change');

    // Arrange
    const newPassword = 'NewPassword123!';
    await page.goto(ENV.baseUrl);
    await pm.navigationInteractions.dismissAllDialogs();
    await page.evaluate((t) => localStorage.setItem('token', t), tempUser.token);
    await page.goto(ENV.baseUrl + URLS.changePassword);

    // Act
    await pm.changePasswordInteractions.changePassword(tempUser.password, newPassword);

    // Assert
    await expect(pm.changePasswordPage.successMessage).toBeVisible();
  });

  test('Should show error when passwords do not match', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Change Password');
    await allure.story('Password mismatch');

    // Arrange
    await page.goto(ENV.baseUrl);
    await pm.navigationInteractions.dismissAllDialogs();
    await page.evaluate((t) => localStorage.setItem('token', t), tempUser.token);
    await page.goto(ENV.baseUrl + URLS.changePassword);

    // Act
    await pm.changePasswordInteractions.fillMismatchedPasswords(
      tempUser.password, 'NewPassword1!', 'DifferentPassword1!',
    );

    // Assert
    await expect(pm.changePasswordPage.submitButton).toBeDisabled();
  });

  test('Should show error with wrong current password', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Change Password');
    await allure.story('Wrong current password');

    // Arrange
    await page.goto(ENV.baseUrl);
    await pm.navigationInteractions.dismissAllDialogs();
    await page.evaluate((t) => localStorage.setItem('token', t), tempUser.token);
    await page.goto(ENV.baseUrl + URLS.changePassword);

    // Act
    await pm.changePasswordInteractions.submitWithWrongPassword('WrongPassword!', 'NewPassword1!');

    // Assert
    await expect(pm.changePasswordPage.errorMessage).toBeVisible();
  });
});
