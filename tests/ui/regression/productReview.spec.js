import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';
import { TEST_DATA }    from '../../../config/testData.js';

// NOTE: Juice Shop API не поддерживает удаление product reviews.
// Reviews, созданные тестами, используют уникальный timestamp в тексте для избежания коллизий.
test.describe('Product Review', () => {
  let token;

  test.beforeAll(async ({ request }) => {
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const authAPI = new AuthAPI(request);
    const { body } = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    token = body.authentication.token;
  });

  test.beforeEach(async ({ page, pm }) => {
    await page.goto(ENV.baseUrl);
    await pm.navigationInteractions.dismissAllDialogs();
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.goto(ENV.baseUrl + URLS.home);
  });

  test('Should write a product review', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('Product Review');
    await allure.story('Write review');

    // Arrange
    const productName = TEST_DATA.products.appleJuice;
    const reviewText = `Test review ${Date.now()}`;

    // Act — открываем карточку товара
    await pm.productInteractions.openProductDetail(productName);
    await pm.productDetailPage.reviewTextarea.fill(reviewText);
    await pm.productDetailPage.submitReview.click();

    // Assert
    await expect(pm.productDetailPage.reviewsList.last()).toContainText(reviewText);
  });

  test('Should display existing reviews on product detail', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('Product Review');
    await allure.story('View reviews');

    // Arrange
    const productName = TEST_DATA.products.appleJuice;

    // Act
    await pm.productInteractions.openProductDetail(productName);

    // Assert
    await expect(pm.productDetailPage.productName).toBeVisible();
    await expect(pm.productDetailPage.dialog.container).toBeVisible();
  });
});
