import { DialogComponent } from '../components/dialog.component.js';

export class ProductDetailPage {
  constructor(page) {
    this.page = page;

    // Components
    this.dialog = new DialogComponent(page);

    // Product detail dialog
    this.productName    = page.locator('mat-dialog-container h1');
    this.productImage   = page.locator('mat-dialog-container img');
    this.productPrice   = page.locator('mat-dialog-container .item-price');
    this.productDescription = page.locator('mat-dialog-container .item-description');

    // Reviews
    this.reviewTextarea  = page.locator('mat-dialog-container textarea');
    this.submitReview    = page.locator('mat-dialog-container #submitButton');
    this.reviewsList     = page.locator('mat-dialog-container .review-text');

    // Actions
    this.addToBasketButton = page.locator('mat-dialog-container button:has-text("Add to Basket")');

    // Close
    this.closeButton     = page.locator('mat-dialog-container button[aria-label="Close Dialog"]');
  }
}
