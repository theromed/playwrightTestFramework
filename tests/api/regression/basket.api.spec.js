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

  test('Should update basket item quantity', async ({ basketAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Basket API');
    await allure.story('Update quantity');

    // Arrange — add item first
    const { body: added } = await basketAPI.addItem(
      tempUser.basketId,
      { ProductId: 1, quantity: 1 },
      tempUser.token
    );
    addedItemId = added.data.id;

    // Act
    const { status, body } = await basketAPI.updateItem(addedItemId, 5, tempUser.token);

    // Assert
    expect(status).toBe(200);
    expect(body.data.quantity).toBe(5);
  });

  test('Should not access another user basket', async ({ request, basketAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Basket API');
    await allure.story('Authorization check');

    // Arrange — create a second user
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const { UsersAPI } = await import('../../../helpers/api/requests/users.api.js');
    const authAPI = new AuthAPI(request);
    const usersAPI = new UsersAPI(request);

    const email2 = `temp2-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@juice-sh.op`;
    await usersAPI.register(email2, 'TempUser123!');
    const loginResult = await authAPI.login(email2, 'TempUser123!');
    const user2Token = loginResult.body.authentication.token;

    // Act — user2 tries to access tempUser's basket
    const { status, body } = await basketAPI.getById(tempUser.basketId, user2Token);

    // NOTE: Juice Shop is intentionally vulnerable — IDOR allows access to other baskets
    // This test documents the known Broken Access Control vulnerability
    expect(status).toBe(200);
    expect(body.data.id).toBe(tempUser.basketId);

    // Cleanup user2
    const adminLogin = await authAPI.login('admin@juice-sh.op', 'admin123');
    const user2Id = (await authAPI.whoAmI(user2Token)).body.user.id;
    await usersAPI.deleteById(user2Id, adminLogin.body.authentication.token);
  });

  test('Should reject adding item with non-existent product', async ({ basketAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Basket API');
    await allure.story('Invalid product');

    // Act
    const { status } = await basketAPI.addItem(
      tempUser.basketId,
      { ProductId: 99999, quantity: 1 },
      tempUser.token
    );

    // Assert — server should reject invalid product
    expect([400, 500]).toContain(status);
  });
});
