import { allure } from 'allure-playwright';
import { apiLogger as logger } from '../../utils/logger.js';
import { ENV } from '../../config/env.js';

export class BaseAPI {
  constructor(request) {
    this.request = request;
    this.baseURL = ENV.baseUrl;
  }

  /**
   * Универсальный метод запроса с логированием и Allure-интеграцией.
   */
  async sendRequest(method, endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();

    logger.info(`→ ${method.toUpperCase()} ${url}`, {
      headers: options.headers ? '***' : undefined,
      body: options.data,
    });

    const response = await this.request[method](url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      data: options.data,
      params: options.params,
    });

    const duration = Date.now() - startTime;
    const status = response.status();

    let responseBody;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }

    logger.info(`← ${status} ${method.toUpperCase()} ${url} (${duration}ms)`);

    // Allure attachment с деталями запроса
    await allure.attachment(
      `${method.toUpperCase()} ${endpoint}`,
      JSON.stringify({
        request: { method, url, headers: options.headers, body: options.data },
        response: { status, body: responseBody, duration: `${duration}ms` },
      }, null, 2),
      'application/json'
    );

    return { status, body: responseBody, response };
  }

  async get(endpoint, options = {}) {
    return this.sendRequest('get', endpoint, options);
  }

  async post(endpoint, options = {}) {
    return this.sendRequest('post', endpoint, options);
  }

  async put(endpoint, options = {}) {
    return this.sendRequest('put', endpoint, options);
  }

  async delete(endpoint, options = {}) {
    return this.sendRequest('delete', endpoint, options);
  }

  /**
   * Хелпер для создания заголовка авторизации.
   */
  authHeader(token) {
    return { Authorization: `Bearer ${token}` };
  }
}
