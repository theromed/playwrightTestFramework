export class OrderHistoryPage {
  constructor(page) {
    this.page = page;

    this.orderRows    = page.locator('mat-row, .order-row, tr').filter({ hasText: /\d/ });
    this.heading      = page.locator('h1, mat-card-title').first();
    this.emptyMessage = page.locator('.emptyState, :text("no orders")');
  }
}
