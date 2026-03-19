import { HeaderComponent }       from '../components/header.component.js';
import { CookieBannerComponent } from '../components/cookieBanner.component.js';
import { ProductCardComponent }  from '../components/productCard.component.js';

export class ProductListPage {
  constructor(page) {
    this.page = page;

    // Components
    this.header       = new HeaderComponent(page);
    this.cookieBanner = new CookieBannerComponent(page);
    this.productCard  = new ProductCardComponent(page);

    // Page-specific locators
    this.productCards       = page.locator('mat-grid-tile');
    this.itemsPerPageSelect = page.locator('mat-select[aria-label="Items per page:"]');
    this.paginator          = page.locator('mat-paginator');
  }
}
