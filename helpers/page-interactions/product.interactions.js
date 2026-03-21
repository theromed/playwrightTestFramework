import { allure } from 'allure-playwright';

export class ProductInteractions {
  constructor(productListPage) {
    this.productListPage = productListPage;
  }

  async addProductToBasket(productName) {
    await allure.step(`Add "${productName}" to basket`, async () => {
      await allure.step('Click "Add to Basket" button', async () => {
        await this.productListPage.productCard.addToBasketButton(productName).click();
      });
    });
  }

  async openProductDetail(productName) {
    await allure.step(`Open product detail for "${productName}"`, async () => {
      await this.productListPage.productCard.cardByName(productName).locator('.item-name').click();
    });
  }

  async getProductsCount() {
    return await allure.step('Get products count on page', async () => {
      await this.productListPage.productCards.first().waitFor({ state: 'visible' });
      return await this.productListPage.productCards.count();
    });
  }

  async isPaginatorVisible() {
    return await allure.step('Check if paginator is visible', async () => {
      return await this.productListPage.paginator.isVisible();
    });
  }

  async goToNextPage() {
    await allure.step('Navigate to next page of products', async () => {
      await this.productListPage.nextPageButton.click();
    });
  }

  async getProductNames() {
    return await allure.step('Get all product names on page', async () => {
      await this.productListPage.productCards.first().waitFor({ state: 'visible' });
      return await this.productListPage.productCard.cardTitle.allTextContents();
    });
  }

  async setItemsPerPage(count) {
    await allure.step(`Set items per page to ${count}`, async () => {
      await this.productListPage.itemsPerPageSelect.click();
      await this.productListPage.page.locator(`mat-option`, { hasText: String(count) }).click();
    });
  }
}
