import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('User Profile', () => {

  test.beforeEach(async ({ page, pm, tempUser }) => {
    // Login via UI to establish Angular session, then navigate to profile
    await page.goto(ENV.baseUrl + URLS.login);
    await pm.navigationInteractions.dismissAllDialogs();
    await pm.loginInteractions.loginAs(tempUser.email, tempUser.password);
    await pm.productListPage.productCards.first().waitFor({ state: 'visible' });
    await page.goto(ENV.baseUrl + URLS.profile);
    await pm.userProfilePage.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Should display user profile page', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('User Profile');
    await allure.story('View profile');

    // Assert
    const isVisible = await pm.userProfileInteractions.isProfilePageVisible();
    expect(isVisible).toBe(true);
  });

  test('Should update username on profile page', async ({ page, pm }) => {
    await allure.severity('normal');
    await allure.feature('User Profile');
    await allure.story('Edit username');

    // Arrange
    const newUsername = `TestUser${Date.now()}`;

    // Act
    await pm.userProfileInteractions.setUsername(newUsername);

    // Assert — reload and verify username persisted
    await page.reload();
    await page.waitForTimeout(1000);
    const currentUsername = await pm.userProfileInteractions.getUsername();
    expect(currentUsername).toBe(newUsername);
  });
});
