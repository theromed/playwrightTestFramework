import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';

test.describe('Search', () => {

  test('Should find products matching search query', async ({ pm, homePage }) => {
    await allure.severity('critical');
    await allure.feature('Search');
    await allure.story('Successful search');

    // Arrange
    const query = 'juice';

    // Act
    await pm.searchInteractions.searchFor(query);

    // Assert
    const count = await pm.searchInteractions.getSearchResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('Should show no results for non-existent product', async ({ pm, homePage }) => {
    await allure.severity('normal');
    await allure.feature('Search');
    await allure.story('No results');

    // Arrange
    const query = 'xyznonexistentproduct123';

    // Act
    await pm.searchInteractions.searchFor(query);

    // Assert
    const noResults = await pm.searchInteractions.isNoResultsVisible();
    expect(noResults).toBeTruthy();
  });
});
