import { allure } from 'allure-playwright';

export class SearchInteractions {
  constructor(searchPage, productListPage) {
    this.searchPage = searchPage;
    this.productListPage = productListPage;
  }

  async searchFor(query) {
    await allure.step(`Search for "${query}"`, async () => {
      await this.productListPage.header.searchIcon.click();
      await this.productListPage.header.searchInput.fill(query);
      await this.productListPage.header.searchInput.press('Enter');
    });
  }

  async getSearchResultsCount() {
    return await allure.step('Get search results count', async () => {
      try {
        await this.searchPage.searchResults.first().waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        return 0;
      }
      return await this.searchPage.searchResults.count();
    });
  }

  async isNoResultsVisible() {
    return await allure.step('Check if no results message is visible', async () => {
      const noResultEl = await this.searchPage.noResultsMessage.isVisible().catch(() => false);
      if (noResultEl) return true;
      // Juice Shop may not show a dedicated element — check grid is empty
      const count = await this.searchPage.searchResults.count();
      return count === 0;
    });
  }

  async getSearchValue() {
    return await allure.step('Get displayed search value', async () => {
      return await this.searchPage.searchValue.textContent();
    });
  }
}
