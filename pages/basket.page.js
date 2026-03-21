import { HeaderComponent } from '../components/header.component.js';

export class BasketPage {
  constructor(page) {
    this.page = page;

    // Components
    this.header = new HeaderComponent(page);

    // Basket items
    this.basketItems       = page.locator('mat-row');
    this.itemName          = page.locator('mat-cell.mat-column-product');
    this.itemPrice         = page.locator('mat-cell.mat-column-price');
    this.itemQuantity      = page.locator('mat-cell.mat-column-quantity span');
    this.increaseButton    = page.locator('mat-cell.mat-column-quantity button svg[data-icon="plus-square"]').first().locator('..');
    this.decreaseButton    = page.locator('mat-cell.mat-column-quantity button svg[data-icon="minus-square"]').first().locator('..');
    this.removeButton      = page.locator('mat-cell.mat-column-remove button').first();
    this.totalPrice        = page.locator('#price');
    this.checkoutButton    = page.locator('#checkoutButton');
    this.emptyBasketMessage = page.locator('.mat-typography');
  }
}
