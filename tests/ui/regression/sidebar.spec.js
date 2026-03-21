import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { URLS }         from '../../../config/urls.js';

test.describe('Sidebar Navigation', () => {

  test('Should open sidebar and navigate to About page', async ({ page, pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Navigation');
    await allure.story('Sidebar to About');

    // Act
    await pm.sidebarInteractions.navigateToAbout();

    // Assert
    await page.waitForURL(`**${URLS.about}`, { timeout: 5000 });
    await expect(pm.aboutPage.heading).toBeVisible({ timeout: 5000 });
  });

  test('Should navigate to Complaint page from sidebar', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Navigation');
    await allure.story('Sidebar to Complaint');

    // Arrange — login required for complaint page
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);

    // Act
    await pm.sidebarInteractions.navigateToComplaint();

    // Assert
    await page.waitForURL(`**${URLS.complaint}`, { timeout: 5000 });
    await expect(pm.complaintPage.messageInput).toBeVisible({ timeout: 5000 });
  });
});
