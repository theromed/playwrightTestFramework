import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Checkout Flow', () => {
  test('Should complete checkout and see order confirmation', async ({ page, pm, tempUser, basketAPI, addressAPI, cardAPI }) => {
    await allure.severity('critical');
    await allure.feature('Checkout');
    await allure.story('Full checkout flow');
    await allure.tag('e2e');

    // Arrange — API-first setup с tempUser (изолированный от других тестов)
    // 1. Добавить товар в корзину
    await basketAPI.addItem(tempUser.basketId, { ProductId: 1, quantity: 1 }, tempUser.token);

    // 2. Создать адрес доставки
    await addressAPI.create({
      fullName: 'Test User', mobileNum: 1234567890,
      zipCode: '00-001', streetAddress: 'Test St 1',
      city: 'Warsaw', state: 'Mazovia', country: 'Poland',
    }, tempUser.token);

    // 3. Создать платёжную карту через API
    await cardAPI.create({
      fullName: 'Test User',
      cardNum: 4111111111111111,
      expMonth: 12,
      expYear: 2099,
    }, tempUser.token);

    // Act — login via UI so Angular fully recognizes the user
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);

    await page.goto(ENV.baseUrl + URLS.basket);
    await pm.basketPage.checkoutButton.waitFor({ state: 'visible', timeout: 10000 });

    await pm.basketInteractions.proceedToCheckout();
    await pm.checkoutInteractions.selectAddress();
    await pm.checkoutInteractions.selectDelivery();
    await pm.checkoutInteractions.selectPayment();
    await pm.checkoutInteractions.placeOrder();

    // Assert
    const isConfirmed = await pm.checkoutInteractions.isOrderConfirmed();
    expect(isConfirmed).toBeTruthy();
  });
});
