import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';

test.describe('Orders API', () => {

  test('Should checkout basket with items', async ({ basketAPI, ordersAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Orders API');
    await allure.story('Checkout');

    // Arrange — добавляем товар в изолированную корзину
    await basketAPI.addItem(
      tempUser.basketId,
      { ProductId: 1, quantity: 1 },
      tempUser.token
    );

    // Act
    const { status, body } = await ordersAPI.checkout(tempUser.basketId, tempUser.token);

    // Assert
    expect(status).toBe(200);
    expect(body.orderConfirmation).toBeTruthy();
  });

  test('Should checkout empty basket and return confirmation', async ({ ordersAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Orders API');
    await allure.story('Empty basket checkout');

    // Act — Juice Shop allows checkout of empty basket
    const { status, body } = await ordersAPI.checkout(tempUser.basketId, tempUser.token);

    // Assert
    expect(status).toBe(200);
    expect(body.orderConfirmation).toBeTruthy();
  });
});
