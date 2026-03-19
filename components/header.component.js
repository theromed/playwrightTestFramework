export class HeaderComponent {
  constructor(page) {
    this.page = page;

    this.accountButton     = page.locator('#navbarAccount');
    this.loginOption        = page.locator('#navbarLoginButton');
    this.logoutButton       = page.locator('#navbarLogoutButton');
    this.searchIcon         = page.locator('mat-icon', { hasText: 'search' });
    this.searchInput        = page.locator('#searchQuery input');
    this.basketButton       = page.locator('button[aria-label="Show the shopping cart"]');
    this.basketItemCount    = page.locator('span.fa-layers-counter');
    this.languageSelect     = page.locator('button[aria-label="Language selection menu"]');
  }
}
