import { allure } from 'allure-playwright';
import { BaseAPI } from '../BaseAPI.js';

export class SecurityQuestionsAPI extends BaseAPI {
  constructor(request) {
    super(request);
  }

  async getAll() {
    return await allure.step('API: Get all security questions', async () => {
      return await this.get('/api/SecurityQuestions');
    });
  }
}
