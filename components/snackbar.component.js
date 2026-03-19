export class SnackbarComponent {
  constructor(page) {
    this.page = page;

    this.container    = page.locator('simple-snack-bar');
    this.message      = page.locator('simple-snack-bar span.mat-mdc-snack-bar-label');
    this.actionButton = page.locator('simple-snack-bar button');
  }
}
