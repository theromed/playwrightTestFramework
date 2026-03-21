import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class BasketAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getById(basketId, token) {
    return await allure.step(`API: Get basket ID=${basketId}`, async () => {
      return await this.get(`/rest/basket/${basketId}`, {
        headers: this.authHeader(token),
      });
    });
  }

  async addItem(basketId, itemData, token) {
    return await allure.step(`API: Add item to basket ID=${basketId}`, async () => {
      return await this.post('/api/BasketItems', {
        data: { BasketId: basketId, ...itemData },
        headers: this.authHeader(token),
      });
    });
  }

  async updateItem(basketItemId, quantity, token) {
    return await allure.step(`API: Update basket item ID=${basketItemId} quantity=${quantity}`, async () => {
      return await this.put(`/api/BasketItems/${basketItemId}`, {
        data: { quantity },
        headers: this.authHeader(token),
      });
    });
  }

  async removeItem(basketItemId, token) {
    return await allure.step(`API: Remove basket item ID=${basketItemId}`, async () => {
      return await this.delete(`/api/BasketItems/${basketItemId}`, {
        headers: this.authHeader(token),
      });
    });
  }
}
