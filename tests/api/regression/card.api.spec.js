import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }      from 'allure-playwright';

test.describe('Card API', () => {
  const createdIds = [];

  test.afterEach(async ({ cardAPI, tempUser }) => {
    for (const id of createdIds) {
      try {
        await cardAPI.deleteById(id, tempUser.token);
      } catch {
        // Already deleted — fine
      }
    }
    createdIds.length = 0;
  });

  test('Should create a payment card', async ({ cardAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Card API');
    await allure.story('Create card');

    // Arrange
    const cardData = {
      fullName: 'Test Card User',
      cardNum: 4111111111111111,
      expMonth: 12,
      expYear: 2099,
    };

    // Act
    const { status, body } = await cardAPI.create(cardData, tempUser.token);
    createdIds.push(body.data.id);

    // Assert
    expect(status).toBe(201);
    expect(body.data.id).toBeDefined();
    expect(body.data.fullName).toBe(cardData.fullName);
  });

  test('Should delete payment card', async ({ cardAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Card API');
    await allure.story('Delete card');

    // Arrange — create card to delete
    const { body: created } = await cardAPI.create(
      { fullName: 'Delete Me', cardNum: 4222222222222222, expMonth: 6, expYear: 2098 },
      tempUser.token
    );

    // Act
    const { status } = await cardAPI.deleteById(created.data.id, tempUser.token);

    // Assert
    expect(status).toBe(200);
  });
});
