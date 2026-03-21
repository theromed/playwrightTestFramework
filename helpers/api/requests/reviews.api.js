import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class ReviewsAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getByProductId(productId) {
    return await allure.step(`API: Get reviews for product ID=${productId}`, async () => {
      return await this.get(`/rest/products/${productId}/reviews`);
    });
  }

  async create(productId, reviewData, token) {
    return await allure.step(`API: Add review to product ID=${productId}`, async () => {
      return await this.put(`/rest/products/${productId}/reviews`, {
        data: reviewData,
        headers: this.authHeader(token),
      });
    });
  }
}
