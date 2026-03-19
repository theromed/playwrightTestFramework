import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class UsersAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async register(email, password) {
    return await allure.step(`API: Register user ${email}`, async () => {
      return await this.post('/api/Users', {
        data: {
          email,
          password,
          passwordRepeat: password,
          securityQuestion: { id: 1 },
          securityAnswer: 'default',
        },
      });
    });
  }

  async deleteById(id, token) {
    return await allure.step(`API: Delete user ID=${id}`, async () => {
      return await this.delete(`/api/Users/${id}`, {
        headers: this.authHeader(token),
      });
    });
  }
}
