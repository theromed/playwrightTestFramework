import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('About Us', () => {

  test('Should display About Us page with company information', async ({ page, pm }) => {
    await allure.severity('normal');
    await allure.feature('About Us');
    await allure.story('Page content');

    // Arrange
    await page.goto(ENV.baseUrl + URLS.about);
    await pm.navigationInteractions.dismissAllDialogs();

    // Assert
    await expect(pm.aboutPage.heading).toBeVisible();
    await expect(pm.aboutPage.companyHistory).toBeVisible();
    expect(page.url()).toContain(URLS.about);
  });
});
