export class DialogComponent {
  constructor(page) {
    this.page = page;

    this.container    = page.locator('mat-dialog-container');
    this.title        = page.locator('mat-dialog-container h1, mat-dialog-container h2');
    this.content      = page.locator('mat-dialog-container mat-dialog-content');
    this.closeButton  = page.locator('mat-dialog-container button[aria-label="Close Dialog"]');
    this.actions      = page.locator('mat-dialog-container mat-dialog-actions');
  }
}
