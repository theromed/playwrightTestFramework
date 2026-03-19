import { HeaderComponent }      from '../components/header.component.js';
import { CookieBannerComponent } from '../components/cookieBanner.component.js';

export class SearchPage {
  constructor(page) {
    this.page = page;

    // Components
    this.header       = new HeaderComponent(page);
    this.cookieBanner = new CookieBannerComponent(page);

    // Search results
    this.searchResults     = page.locator('mat-grid-tile');
    this.noResultsMessage  = page.locator('#noResultsDiv, img[src*="emptysearch"]');
    this.searchValue       = page.locator('#searchValue');
  }
}
