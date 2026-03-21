export class AboutPage {
  constructor(page) {
    this.page = page;

    this.heading          = page.locator('h1:has-text("About Us")');
    this.companyHistory   = page.locator('h2:has-text("Corporate History")');
    this.socialMediaLinks = page.locator('a[href*="twitter"], a[href*="bsky"], a[href*="mastodon"]');
  }
}
