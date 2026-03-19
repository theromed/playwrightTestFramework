export class CookieBannerComponent {
  constructor(page) {
    this.page = page;

    this.banner       = page.locator('.cc-window');
    this.dismissLink  = page.locator('a.cc-dismiss');
  }
}
