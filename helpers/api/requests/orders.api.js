import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class OrdersAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async checkout(basketId, token) {
    return await allure.step(`API: Checkout basket ID=${basketId}`, async () => {
      return await this.post(`/rest/basket/${basketId}/checkout`, {
        headers: this.authHeader(token),
      });
    });
  }

  async getOrderHistory(token) {
    return await allure.step('API: Get order history', async () => {
      return await this.get('/rest/track-order', {
        headers: this.authHeader(token),
      });
    });
  }
}
