import { allure } from 'allure-playwright';

export class BasketInteractions {
  constructor(basketPage) {
    this.basketPage = basketPage;
  }

  async getBasketItemsCount() {
    return await allure.step('Get basket items count', async () => {
      return await this.basketPage.basketItems.count();
    });
  }

  async getTotalPrice() {
    return await allure.step('Get basket total price', async () => {
      return await this.basketPage.totalPrice.textContent();
    });
  }

  async proceedToCheckout() {
    await allure.step('Proceed to checkout', async () => {
      await this.basketPage.checkoutButton.click();
    });
  }

  async isBasketEmpty() {
    return await allure.step('Check if basket is empty', async () => {
      return await this.basketPage.emptyBasketMessage.isVisible();
    });
  }

  async getFirstItemQuantity() {
    return await allure.step('Get first item quantity', async () => {
      const text = await this.basketPage.itemQuantity.first().textContent();
      return parseInt(text.trim(), 10);
    });
  }

  async increaseFirstItemQuantity() {
    await allure.step('Increase first item quantity', async () => {
      await this.basketPage.increaseButton.click();
    });
  }

  async removeFirstItem() {
    await allure.step('Remove first item from basket', async () => {
      await this.basketPage.removeButton.click();
    });
  }
}
