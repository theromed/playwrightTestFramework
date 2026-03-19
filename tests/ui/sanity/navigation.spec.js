import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { URLS }         from '../../../config/urls.js';
import { ENV }          from '../../../config/env.js';

test.describe('Navigation', () => {

  test('Should navigate to main pages from header', async ({ pm, homePage, page }) => {
    await allure.severity('critical');
    await allure.feature('Navigation');
    await allure.story('Header navigation');

    // Act — переход на Login
    await pm.navigationInteractions.goToLoginPage();

    // Assert
    await expect(pm.loginPage.emailInput).toBeVisible();
  });

  test('Should display header elements on home page', async ({ pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Navigation');
    await allure.story('Header elements');

    // Assert — basket button is only visible after login
    await expect(pm.productListPage.header.accountButton).toBeVisible();
    await expect(pm.productListPage.header.searchIcon).toBeVisible();
    await expect(pm.productListPage.header.languageSelect).toBeVisible();
  });
});
