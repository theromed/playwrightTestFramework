import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class ProductsAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getAll(token) {
    return await allure.step('API: Get all products', async () => {
      return await this.get('/api/Products', {
        headers: this.authHeader(token),
      });
    });
  }

  async getById(id, token) {
    return await allure.step(`API: Get product by ID=${id}`, async () => {
      return await this.get(`/api/Products/${id}`, {
        headers: this.authHeader(token),
      });
    });
  }

  async search(query) {
    return await allure.step(`API: Search products for "${query}"`, async () => {
      return await this.get(`/rest/products/search?q=${encodeURIComponent(query)}`);
    });
  }
}
