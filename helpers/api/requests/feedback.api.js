import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class FeedbackAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getCaptcha() {
    return await allure.step('API: Get captcha', async () => {
      return await this.get('/rest/captcha');
    });
  }

  async create(comment, rating, token) {
    return await allure.step(`API: Create feedback (rating=${rating})`, async () => {
      // Juice Shop requires captcha for feedback submission
      const { body: captcha } = await this.getCaptcha();
      // Safe arithmetic evaluation (Juice Shop CAPTCHA is always a+b, a-b, or a*b)
      const expr = String(captcha.captcha).replace(/\u2212/g, '-').trim();
      if (!/^[\d\s+\-*/().]+$/.test(expr)) {
        throw new Error(`Unexpected CAPTCHA format: ${expr}`);
      }
      const captchaAnswer = String(new Function('return ' + expr)());
      return await this.post('/api/Feedbacks', {
        data: { comment, rating, captchaId: captcha.captchaId, captcha: captchaAnswer },
        headers: this.authHeader(token),
      });
    });
  }

  async getAll(token) {
    return await allure.step('API: Get all feedbacks', async () => {
      return await this.get('/api/Feedbacks', {
        headers: this.authHeader(token),
      });
    });
  }

  async deleteById(id, token) {
    return await allure.step(`API: Delete feedback ID=${id}`, async () => {
      return await this.delete(`/api/Feedbacks/${id}`, {
        headers: this.authHeader(token),
      });
    });
  }
}
