export class AdministrationPage {
  constructor(page) {
    this.page = page;

    // User management (scoped to .user-table to avoid matching feedback/recycle tables)
    this.userTable         = page.locator('.user-table mat-table');
    this.userRows          = page.locator('.user-table mat-row');
    this.userEmail         = page.locator('.user-table mat-cell.mat-column-email');
    this.userRole          = page.locator('.user-table mat-cell.mat-column-role');

    // Feedback management
    this.feedbackTable     = page.locator('.feedback-table');
    this.feedbackRows      = page.locator('.feedback-table mat-row');

    // Recycling requests
    this.recycleTable      = page.locator('.recycle-table');
  }
}
