import { allure } from 'allure-playwright';

export class CheckoutInteractions {
  constructor(checkoutPage) {
    this.checkoutPage = checkoutPage;
  }

  async selectAddress() {
    await allure.step('Select delivery address', async () => {
      await this.checkoutPage.addressRadio.click();
      await this.checkoutPage.continueButton.click();
    });
  }

  async selectDelivery() {
    await allure.step('Select delivery method', async () => {
      await this.checkoutPage.deliveryRadio.click();
      await this.checkoutPage.continueDelivery.click();
    });
  }

  async selectPayment() {
    await allure.step('Select payment method', async () => {
      await this.checkoutPage.paymentRadio.click();
      await this.checkoutPage.continuePayment.click();
    });
  }

  async placeOrder() {
    await allure.step('Place order', async () => {
      await this.checkoutPage.placeOrderButton.click();
    });
  }

  async isOrderConfirmed() {
    return await allure.step('Check order confirmation', async () => {
      await this.checkoutPage.orderConfirmation.waitFor({ state: 'visible' });
      return await this.checkoutPage.orderConfirmation.isVisible();
    });
  }
}
