import { test, expect }    from '../../../fixtures/base.fixture.js';
import { allure }          from 'allure-playwright';
import { validateSchema }  from '../../../utils/schemaValidator.js';
import basketSchema        from '../../../helpers/api/schemas/basket.schema.json' with { type: 'json' };

test.describe('Basket API', () => {
  let addedItemId = null;

  test.afterEach(async ({ basketAPI, tempUser }) => {
    if (addedItemId) {
      try {
        await basketAPI.removeItem(addedItemId, tempUser.token);
      } catch {
        // Item may not exist — fine
      }
      addedItemId = null;
    }
  });

  test('Should get basket by ID', async ({ basketAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Basket API');
    await allure.story('Get basket');

    // Act
    const { status, body } = await basketAPI.getById(tempUser.basketId, tempUser.token);

    // Assert
    expect(status).toBe(200);
    expect(body.data.id).toBe(tempUser.basketId);
    await validateSchema(body, basketSchema, 'BasketResponse');
  });

  test('Should add item to basket', async ({ basketAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Basket API');
    await allure.story('Add item');

    // Act
    const { status, body } = await basketAPI.addItem(
      tempUser.basketId,
      { ProductId: 1, quantity: 2 },
      tempUser.token
    );
    addedItemId = body.data.id;

    // Assert
    expect(status).toBe(200);
    expect(body.data.ProductId).toBe(1);
    expect(body.data.quantity).toBe(2);
  });
});
