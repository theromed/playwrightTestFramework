import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';
import { TEST_DATA }    from '../../../config/testData.js';

test.describe('Login Page', () => {

  test.beforeEach(async ({ page, pm }) => {
    await page.goto(ENV.baseUrl + URLS.login);
    await pm.navigationInteractions.dismissAllDialogs();
  });

  test('Should login with valid credentials', async ({ pm }) => {
    await allure.severity('critical');
    await allure.feature('Login');
    await allure.story('Valid credentials');

    // Arrange
    const { email, password } = TEST_DATA.adminUser;

    // Act
    await pm.loginInteractions.loginAs(email, password);

    // Assert
    await expect(pm.productListPage.productCards.first()).toBeVisible();
  });

  test('Should show error with invalid credentials', async ({ pm }) => {
    await allure.severity('critical');
    await allure.feature('Login');
    await allure.story('Invalid credentials');

    // Arrange
    const email = 'wrong@email.com';
    const password = 'wrongPassword';

    // Act
    await pm.loginInteractions.loginAs(email, password);

    // Assert
    const errorText = await pm.loginInteractions.getErrorMessage();
    expect(errorText).toContain('Invalid');
  });

  test('Should navigate to registration page', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('Login');
    await allure.story('Navigation to Registration');

    // Act
    await pm.loginInteractions.navigateToRegistration();

    // Assert
    await expect(pm.registrationPage.emailInput).toBeVisible();
  });
});
