import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Complaint', () => {

  test('Should display complaint form', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Complaint');
    await allure.story('View complaint form');

    // Arrange — login required for complaint page
    await page.goto(ENV.baseUrl);
    await pm.navigationInteractions.dismissAllDialogs();
    await page.evaluate((t) => localStorage.setItem('token', t), tempUser.token);
    await page.goto(ENV.baseUrl + URLS.complaint);
    await page.waitForTimeout(1000);

    // Assert
    await expect(pm.complaintPage.messageInput).toBeVisible();
    await expect(pm.complaintPage.fileUpload).toBeAttached();
    await expect(pm.complaintPage.submitButton).toBeVisible();
  });
});
