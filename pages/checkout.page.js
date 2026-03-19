export class CheckoutPage {
  constructor(page) {
    this.page = page;

    // Address selection
    this.addressSelect    = page.locator('mat-row').first();
    this.addressRadio     = page.locator('mat-radio-button').first();
    this.continueButton   = page.locator('button[aria-label="Proceed to payment selection"]');
    this.addNewAddress    = page.locator('button[aria-label="Add a new address"]');

    // Delivery method
    this.deliveryOptions    = page.locator('mat-row');
    this.deliveryRadio      = page.locator('mat-radio-button').first();
    this.continueDelivery   = page.locator('button[aria-label="Proceed to delivery method selection"]');

    // Payment
    this.paymentOptions     = page.locator('mat-row');
    this.paymentRadio       = page.locator('mat-radio-button').first();
    this.continuePayment    = page.locator('button[aria-label="Proceed to review"]');
    this.addNewCard         = page.locator('mat-expansion-panel');

    // Order summary
    this.placeOrderButton   = page.locator('#checkoutButton');
    this.orderConfirmation  = page.locator('.confirmation');
  }
}
