export class ProductCardComponent {
  constructor(page) {
    this.page = page;

    this.cards            = page.locator('mat-card.mat-card');
    this.cardTitle        = page.locator('mat-card .item-name');
    this.cardPrice        = page.locator('mat-card .item-price');
  }

  cardByName(productName) {
    return this.page.locator('mat-card', { hasText: productName });
  }

  addToBasketButton(productName) {
    return this.page.locator(`mat-card:has-text("${productName}") button[aria-label="Add to Basket"]`);
  }
}
