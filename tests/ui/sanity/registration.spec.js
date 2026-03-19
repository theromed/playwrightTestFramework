import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Registration Page', () => {
  const createdUserIds = [];
  let adminToken;

  // Setup — получаем admin-токен для cleanup
  test.beforeAll(async ({ request }) => {
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const authAPI = new AuthAPI(request);
    const { body } = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    adminToken = body.authentication.token;
  });

  test.beforeEach(async ({ page, pm }) => {
    await page.goto(ENV.baseUrl + URLS.register);
    await pm.navigationInteractions.dismissAllDialogs();
  });

  // Cleanup — удаляем всех созданных пользователей
  test.afterEach(async ({ request }) => {
    const { UsersAPI } = await import('../../../helpers/api/requests/users.api.js');
    const usersAPI = new UsersAPI(request);
    for (const userId of createdUserIds) {
      try {
        await usersAPI.deleteById(userId, adminToken);
      } catch (error) {
        console.warn('Cleanup failed for user:', userId, error.message);
      }
    }
    createdUserIds.length = 0;
  });

  test('Should register new user via UI', async ({ pm, request }) => {
    await allure.severity('critical');
    await allure.feature('Registration');
    await allure.story('Successful registration');

    // Arrange
    const email = `reg-ui-${Date.now()}@juice-sh.op`;
    const password = 'UiTest123!';

    // Act
    await pm.registrationInteractions.registerUser(email, password, password, 1, 'Green');

    // Assert
    await expect(pm.loginPage.emailInput).toBeVisible();

    // Сохраняем ID для cleanup
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const authAPI = new AuthAPI(request);
    const { body } = await authAPI.login(email, password);
    const whoami = await authAPI.whoAmI(body.authentication.token);
    createdUserIds.push(whoami.body.user.id);
  });

  test('Should show validation error for invalid email', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('Registration');
    await allure.story('Email validation');

    // Act
    await pm.registrationPage.emailInput.fill('invalid-email');
    await pm.registrationPage.emailInput.blur();

    // Assert
    await expect(pm.registrationPage.emailError).toBeVisible();
  });

  test('Should show error when passwords do not match', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('Registration');
    await allure.story('Password mismatch');

    // Act
    await pm.registrationPage.passwordInput.fill('Password1!');
    await pm.registrationPage.repeatPasswordInput.fill('DifferentPassword1!');
    await pm.registrationPage.repeatPasswordInput.blur();

    // Assert
    await expect(pm.registrationPage.repeatPasswordError).toBeVisible();
  });
});
