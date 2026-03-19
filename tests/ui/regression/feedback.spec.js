import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Customer Feedback', () => {
  let token;
  const createdFeedbackIds = [];

  test.beforeAll(async ({ request }) => {
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const authAPI = new AuthAPI(request);
    const { body } = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    token = body.authentication.token;
  });

  test.beforeEach(async ({ page, pm }) => {
    await page.goto(ENV.baseUrl);
    await pm.navigationInteractions.dismissAllDialogs();
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    // Reload so Angular recognizes the authenticated user
    await page.reload();
    await pm.productListPage.header.accountButton.waitFor({ state: 'visible', timeout: 10000 });
    await pm.navigationInteractions.dismissAllDialogs();
    await page.goto(ENV.baseUrl + URLS.contact);
    await pm.contactPage.commentTextarea.waitFor({ state: 'visible', timeout: 10000 });
  });

  // Cleanup — удаляем созданные фидбеки
  test.afterEach(async ({ request }) => {
    const { FeedbackAPI } = await import('../../../helpers/api/requests/feedback.api.js');
    const feedbackAPI = new FeedbackAPI(request);
    for (const id of createdFeedbackIds) {
      try {
        await feedbackAPI.deleteById(id, token);
      } catch (error) {
        console.warn('Cleanup failed for feedback:', id, error.message);
      }
    }
    createdFeedbackIds.length = 0;
  });

  test('Should submit feedback with valid captcha', async ({ pm, page }) => {
    await allure.severity('critical');
    await allure.feature('Feedback');
    await allure.story('Submit feedback');

    // Arrange — получаем CAPTCHA (wait for it to load)
    const captchaText = await pm.contactInteractions.getCaptchaExpression();
    // Replace Unicode minus (U+2212) with regular hyphen
    const normalizedCaptcha = captchaText.replace(/\u2212/g, '-').trim();
    // Safe arithmetic evaluation (Juice Shop CAPTCHA is always a+b, a-b, or a*b)
    if (!/^[\d\s+\-*/().]+$/.test(normalizedCaptcha)) {
      throw new Error(`Unexpected CAPTCHA format: ${normalizedCaptcha}`);
    }
    const captchaAnswer = new Function('return ' + normalizedCaptcha)();

    // Act
    await pm.contactInteractions.submitFeedback('Great shop!', 5, captchaAnswer);

    // Assert
    await expect(page.locator('simple-snack-bar')).toBeVisible({ timeout: 5000 });
  });

  test('Should not submit feedback without comment', async ({ pm }) => {
    await allure.severity('normal');
    await allure.feature('Feedback');
    await allure.story('Required fields validation');

    // Assert — кнопка должна быть disabled без заполнения полей
    await expect(pm.contactPage.submitButton).toBeDisabled();
  });
});
