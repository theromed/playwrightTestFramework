import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class ComplaintAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async create(complaintData, token) {
    return await allure.step('API: Create complaint', async () => {
      return await this.post('/api/Complaints', {
        data: complaintData,
        headers: this.authHeader(token),
      });
    });
  }

  async getAll(token) {
    return await allure.step('API: Get all complaints', async () => {
      return await this.get('/api/Complaints', {
        headers: this.authHeader(token),
      });
    });
  }
}
