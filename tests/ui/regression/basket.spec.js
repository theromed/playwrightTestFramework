import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Basket Page', () => {

  test('Should display added product in basket', async ({ page, pm, basketAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Basket');
    await allure.story('Display added product');

    // Arrange — добавляем товар через API в изолированную корзину
    await basketAPI.addItem(tempUser.basketId, { ProductId: 1, quantity: 1 }, tempUser.token);

    // Act — login via UI so Angular fully recognizes the user
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);
    await page.goto(ENV.baseUrl + URLS.basket);
    await pm.basketPage.totalPrice.waitFor({ state: 'visible', timeout: 10000 });

    // Assert
    await expect(pm.basketPage.basketItems.first()).toBeVisible({ timeout: 10000 });
  });

  test('Should show empty basket message when no items', async ({ page, pm, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Basket');
    await allure.story('Empty basket');

    // Act — login via UI so Angular fully recognizes the user
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);
    await page.goto(ENV.baseUrl + URLS.basket);
    await pm.basketPage.totalPrice.waitFor({ state: 'visible', timeout: 10000 });

    // Assert — total price should be 0 for empty basket (no mat-row items)
    await expect(pm.basketPage.totalPrice).toContainText('0');
  });

  test('Should increase product quantity in basket', async ({ page, pm, basketAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Basket');
    await allure.story('Increase quantity');

    // Arrange — add product via API
    await basketAPI.addItem(tempUser.basketId, { ProductId: 1, quantity: 1 }, tempUser.token);
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);
    await page.goto(ENV.baseUrl + URLS.basket);
    await pm.basketPage.basketItems.first().waitFor({ state: 'visible', timeout: 10000 });

    // Act
    const initialQty = await pm.basketInteractions.getFirstItemQuantity();
    await pm.basketInteractions.increaseFirstItemQuantity();
    await page.waitForTimeout(1000);

    // Assert
    const newQty = await pm.basketInteractions.getFirstItemQuantity();
    expect(newQty).toBe(initialQty + 1);
  });

  test('Should remove product from basket via UI', async ({ page, pm, basketAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Basket');
    await allure.story('Remove item');

    // Arrange — add product via API
    await basketAPI.addItem(tempUser.basketId, { ProductId: 1, quantity: 1 }, tempUser.token);
    await pm.navigationInteractions.loginViaUI(tempUser.email, tempUser.password);
    await page.goto(ENV.baseUrl + URLS.basket);
    await pm.basketPage.basketItems.first().waitFor({ state: 'visible', timeout: 10000 });

    // Act
    await pm.basketInteractions.removeFirstItem();
    await page.waitForTimeout(1000);

    // Assert — basket should be empty
    await expect(pm.basketPage.totalPrice).toContainText('0');
  });
});
