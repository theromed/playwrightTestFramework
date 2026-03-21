import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';

test.describe('Product Detail', () => {

  test('Should display product detail dialog with all fields', async ({ pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Product Detail');
    await allure.story('View product details');

    // Act — click on first product name to open detail dialog
    await pm.productInteractions.openProductDetail('Apple Juice');

    // Assert
    await expect(pm.productDetailPage.productName).toBeVisible({ timeout: 5000 });
    await expect(pm.productDetailPage.productImage).toBeVisible();
    await expect(pm.productDetailPage.productPrice).toBeVisible();
  });

  test('Should close product detail dialog', async ({ pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Product Detail');
    await allure.story('Close detail dialog');

    // Act — open product detail
    await pm.productInteractions.openProductDetail('Apple Juice');
    await pm.productDetailPage.productName.waitFor({ state: 'visible', timeout: 5000 });

    // Act — close dialog
    await pm.productDetailPage.closeButton.click();

    // Assert — dialog should be closed
    await expect(pm.productDetailPage.productName).not.toBeVisible({ timeout: 5000 });
  });
});
