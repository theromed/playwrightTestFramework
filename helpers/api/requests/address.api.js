import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class AddressAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getAll(token) {
    return await allure.step('API: Get all addresses', async () => {
      return await this.get('/api/Addresss', {
        headers: this.authHeader(token),
      });
    });
  }

  async create(addressData, token) {
    return await allure.step('API: Create address', async () => {
      return await this.post('/api/Addresss', {
        data: addressData,
        headers: this.authHeader(token),
      });
    });
  }

  async deleteById(id, token) {
    return await allure.step(`API: Delete address ID=${id}`, async () => {
      return await this.delete(`/api/Addresss/${id}`, {
        headers: this.authHeader(token),
      });
    });
  }
}
