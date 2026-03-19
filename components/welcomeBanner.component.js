export class WelcomeBannerComponent {
  constructor(page) {
    this.page = page;

    this.dismissButton = page.locator('button[aria-label="Close Welcome Banner"]');
  }
}
