import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class RecycleAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getAll(token) {
    return await allure.step('API: Get all recycle requests', async () => {
      return await this.get('/api/Recycles', {
        headers: this.authHeader(token),
      });
    });
  }

  async create(recycleData, token) {
    return await allure.step('API: Create recycle request', async () => {
      return await this.post('/api/Recycles', {
        data: recycleData,
        headers: this.authHeader(token),
      });
    });
  }
}
