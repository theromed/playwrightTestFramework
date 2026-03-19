import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class CardAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getAll(token) {
    return await allure.step('API: Get all cards', async () => {
      return await this.get('/api/Cards', {
        headers: this.authHeader(token),
      });
    });
  }

  async create(cardData, token) {
    return await allure.step('API: Create payment card', async () => {
      return await this.post('/api/Cards', {
        data: cardData,
        headers: this.authHeader(token),
      });
    });
  }

  async deleteById(id, token) {
    return await allure.step(`API: Delete card ID=${id}`, async () => {
      return await this.delete(`/api/Cards/${id}`, {
        headers: this.authHeader(token),
      });
    });
  }
}
