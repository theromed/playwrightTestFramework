import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';

test.describe('Product List', () => {

  test('Should display products with pagination', async ({ pm, homePage }) => {
    await allure.severity('critical');
    await allure.feature('Product List');
    await allure.story('Pagination');

    // Assert — paginator is visible
    const isPaginatorVisible = await pm.productInteractions.isPaginatorVisible();
    expect(isPaginatorVisible).toBe(true);

    // Assert — products are displayed
    const count = await pm.productInteractions.getProductsCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(12);
  });

  test('Should navigate to next page of products', async ({ pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Product List');
    await allure.story('Page navigation');

    // Arrange — get initial product names
    const initialNames = await pm.productInteractions.getProductNames();

    // Act
    await pm.productInteractions.goToNextPage();

    // Assert — products changed
    const newNames = await pm.productInteractions.getProductNames();
    expect(newNames[0]).not.toBe(initialNames[0]);
  });
});
