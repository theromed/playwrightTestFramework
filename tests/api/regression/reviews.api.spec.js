import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }      from 'allure-playwright';

test.describe('Product Reviews API', () => {

  test('Should get reviews for a product', async ({ reviewsAPI }) => {
    await allure.severity('normal');
    await allure.feature('Product Reviews API');
    await allure.story('Get reviews');

    // Act
    const { status, body } = await reviewsAPI.getByProductId(1);

    // Assert
    expect(status).toBe(200);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('Should add a review to a product', async ({ reviewsAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Product Reviews API');
    await allure.story('Create review');

    // NOTE: Reviews cannot be deleted via API — use unique timestamp
    // Arrange
    const reviewData = {
      message: `API review ${Date.now()}`,
      author: tempUser.email,
    };

    // Act
    const { status } = await reviewsAPI.create(1, reviewData, tempUser.token);

    // Assert
    expect(status).toBe(201);
  });
});
