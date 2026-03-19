export class OrderSummaryPage {
  constructor(page) {
    this.page = page;

    this.orderItems        = page.locator('mat-row');
    this.totalPrice        = page.locator('.total-price');
    this.deliveryAddress   = page.locator('.address-text');
    this.paymentMethod     = page.locator('.payment-text');
    this.placeOrderButton  = page.locator('#checkoutButton');
    this.confirmation      = page.locator('.confirmation');
    this.orderNumber       = page.locator('.confirmation .order-id');
  }
}
