export class PaymentPage {
  constructor(page) {
    this.page = page;

    // Add new card (inside mat-expansion-panel)
    this.nameInput         = page.locator('mat-expansion-panel').getByLabel('Name');
    this.cardNumberInput   = page.locator('mat-expansion-panel').getByLabel('Card Number');
    this.expiryMonthSelect = page.locator('mat-expansion-panel').getByLabel('Expiry Month');
    this.expiryYearSelect  = page.locator('mat-expansion-panel').getByLabel('Expiry Year');
    this.submitButton      = page.locator('#submitButton');

    // Existing cards
    this.cardOptions       = page.locator('mat-row');
    this.cardRadio         = page.locator('mat-radio-button').first();
  }
}
