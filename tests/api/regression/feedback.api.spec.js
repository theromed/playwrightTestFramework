import { test, expect }    from '../../../fixtures/base.fixture.js';
import { allure }          from 'allure-playwright';
import { validateSchema }  from '../../../utils/schemaValidator.js';
import { ENV }             from '../../../config/env.js';
import feedbackSchema      from '../../../helpers/api/schemas/feedback.schema.json' with { type: 'json' };

test.describe('Feedback API', () => {
  let token;
  const createdFeedbackIds = [];

  test.beforeAll(async ({ request }) => {
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const authAPI = new AuthAPI(request);
    const { body } = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    token = body.authentication.token;
  });

  // Cleanup
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

  test('Should create feedback via API', async ({ feedbackAPI }) => {
    await allure.severity('critical');
    await allure.feature('Feedback API');
    await allure.story('Create feedback');

    // Arrange
    const comment = `API test feedback ${Date.now()}`;
    const rating = 4;

    // Act
    const { status, body } = await feedbackAPI.create(comment, rating, token);
    createdFeedbackIds.push(body.data.id);

    // Assert
    expect(status).toBe(201);
    expect(body.data.comment).toBe(comment);
    expect(body.data.rating).toBe(rating);
    await validateSchema(body, feedbackSchema, 'FeedbackResponse');
  });

  test('Should delete feedback via API', async ({ feedbackAPI }) => {
    await allure.severity('normal');
    await allure.feature('Feedback API');
    await allure.story('Delete feedback');

    // Arrange — создаём фидбек
    const { body: created } = await feedbackAPI.create('To be deleted', 3, token);
    const feedbackId = created.data.id;

    // Act
    const { status } = await feedbackAPI.deleteById(feedbackId, token);

    // Assert
    expect(status).toBe(200);
  });
});
