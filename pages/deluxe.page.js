export class DeluxePage {
  constructor(page) {
    this.page = page;

    this.heading          = page.locator('h1, .heading').filter({ hasText: /deluxe/i }).first();
    this.membershipCard   = page.locator('.card, .membership-card, mat-card').first();
    this.becomeAMemberBtn = page.locator('button:has-text("Become a Member"), button:has-text("Member")').first();
  }
}
