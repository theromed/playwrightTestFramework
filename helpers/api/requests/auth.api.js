import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class AuthAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async login(email, password) {
    return await allure.step(`API: Login as ${email}`, async () => {
      return await this.post('/rest/user/login', {
        data: { email, password },
      });
    });
  }

  async whoAmI(token) {
    return await allure.step('API: Get current user (whoami)', async () => {
      return await this.get('/rest/user/whoami', {
        headers: { Cookie: `token=${token}` },
      });
    });
  }

  async changePassword(currentPassword, newPassword, repeatNewPassword, token) {
    return await allure.step('API: Change password', async () => {
      const query = `current=${encodeURIComponent(currentPassword)}&new=${encodeURIComponent(newPassword)}&repeat=${encodeURIComponent(repeatNewPassword)}`;
      return await this.get(`/rest/user/change-password?${query}`, {
        headers: this.authHeader(token),
      });
    });
  }

  async register(email, password, passwordRepeat, securityQuestion, securityAnswer) {
    return await allure.step(`API: Register user ${email}`, async () => {
      return await this.post('/api/Users', {
        data: {
          email,
          password,
          passwordRepeat: passwordRepeat || password,
          securityQuestion: securityQuestion || { id: 1 },
          securityAnswer: securityAnswer || 'default',
        },
      });
    });
  }
}
