import { test as base } from '@playwright/test';
import { POManager }  from '../framework/POManager.js';
import { AuthAPI }     from '../helpers/api/requests/auth.api.js';
import { ProductsAPI } from '../helpers/api/requests/products.api.js';
import { BasketAPI }   from '../helpers/api/requests/basket.api.js';
import { FeedbackAPI } from '../helpers/api/requests/feedback.api.js';
import { UsersAPI }    from '../helpers/api/requests/users.api.js';
import { AddressAPI }  from '../helpers/api/requests/address.api.js';
import { OrdersAPI }   from '../helpers/api/requests/orders.api.js';
import { CardAPI }     from '../helpers/api/requests/card.api.js';
import { SecurityQuestionsAPI } from '../helpers/api/requests/securityQuestions.api.js';
import { ComplaintAPI }  from '../helpers/api/requests/complaint.api.js';
import { ReviewsAPI }    from '../helpers/api/requests/reviews.api.js';
import { apiLogger }   from '../utils/logger.js';
import { ENV }         from '../config/env.js';
import { URLS }        from '../config/urls.js';

export const test = base.extend({
  // Auto-flush API logs to Allure after each test
  _flushLogs: [async ({}, use) => {
    await use();
    await apiLogger.flushToAllure('API Logs');
  }, { auto: true }],

  // POManager — доступен в каждом UI-тесте
  pm: async ({ page }, use) => {
    const pm = new POManager(page);
    await use(pm);
  },

  // API-клиенты
  authAPI: async ({ request }, use) => {
    await use(new AuthAPI(request));
  },

  productsAPI: async ({ request }, use) => {
    await use(new ProductsAPI(request));
  },

  basketAPI: async ({ request }, use) => {
    await use(new BasketAPI(request));
  },

  feedbackAPI: async ({ request }, use) => {
    await use(new FeedbackAPI(request));
  },

  usersAPI: async ({ request }, use) => {
    await use(new UsersAPI(request));
  },

  addressAPI: async ({ request }, use) => {
    await use(new AddressAPI(request));
  },

  ordersAPI: async ({ request }, use) => {
    await use(new OrdersAPI(request));
  },

  cardAPI: async ({ request }, use) => {
    await use(new CardAPI(request));
  },

  securityQuestionsAPI: async ({ request }, use) => {
    await use(new SecurityQuestionsAPI(request));
  },

  complaintAPI: async ({ request }, use) => {
    await use(new ComplaintAPI(request));
  },

  reviewsAPI: async ({ request }, use) => {
    await use(new ReviewsAPI(request));
  },

  // Авторизованный контекст (предустановленный JWT)
  authToken: async ({ authAPI }, use) => {
    const { body } = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    await use(body.authentication.token);
  },

  // Навигация на главную с закрытием Welcome Banner + Cookie Banner
  homePage: async ({ page, pm }, use) => {
    await page.goto(ENV.baseUrl + URLS.home);
    await pm.navigationInteractions.closeWelcomeBanner();
    await pm.navigationInteractions.closeCookieBanner();
    await use(page);
  },

  /**
   * Fixture: создаёт временного пользователя через API,
   * передаёт credentials в тест, удаляет пользователя в teardown.
   */
  tempUser: async ({ request }, use) => {
    const authAPI = new AuthAPI(request);
    const usersAPI = new UsersAPI(request);

    // Setup — создаём пользователя через API
    const email = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@juice-sh.op`;
    const password = 'TempUser123!';
    const createResult = await usersAPI.register(email, password);
    const userId = createResult.body.data.id;

    // Логинимся, чтобы получить токен
    const loginResult = await authAPI.login(email, password);
    const token = loginResult.body.authentication.token;
    const basketId = loginResult.body.authentication.bid;

    // Передаём данные в тест
    await use({ email, password, token, basketId, userId });

    // Teardown — удаляем пользователя через admin API
    const adminLogin = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    await usersAPI.deleteById(userId, adminLogin.body.authentication.token);
  },

  /**
   * Fixture: добавляет товар в корзину через API,
   * передаёт basket item в тест, удаляет из корзины в teardown.
   */
  basketWithProduct: async ({ request }, use) => {
    const authAPI = new AuthAPI(request);
    const basketAPI = new BasketAPI(request);

    // Получаем basket ID
    const loginResult = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    const token = loginResult.body.authentication.token;
    const basketId = loginResult.body.authentication.bid;

    // Setup — добавляем товар через API
    const { body } = await basketAPI.addItem(basketId, { ProductId: 1, quantity: 1 }, token);
    const basketItemId = body.data.id;

    await use({ basketId, basketItemId, token });

    // Teardown — убираем товар из корзины
    await basketAPI.removeItem(basketItemId, token);
  },
});

export { expect } from '@playwright/test';
