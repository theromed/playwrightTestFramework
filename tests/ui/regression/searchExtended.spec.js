import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';

test.describe('Search Extended', () => {

  test('Should display product names matching search query', async ({ pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Search');
    await allure.story('Search results match query');

    // Act
    await pm.searchInteractions.searchFor('Juice');
    await pm.productListPage.productCards.first().waitFor({ state: 'visible', timeout: 5000 });

    // Assert — search results should be displayed (Juice Shop searches name + description)
    const names = await pm.productInteractions.getProductNames();
    expect(names.length).toBeGreaterThan(0);
    // At least one product name should contain search term
    const hasMatch = names.some(n => n.toLowerCase().includes('juice'));
    expect(hasMatch).toBe(true);
  });

  test('Should persist search query in URL', async ({ page, pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Search');
    await allure.story('Search query in URL');

    // Act
    await pm.searchInteractions.searchFor('Apple');
    await pm.productListPage.productCards.first().waitFor({ state: 'visible', timeout: 5000 });

    // Assert — URL should contain search query
    expect(page.url()).toContain('Apple');
  });
});
