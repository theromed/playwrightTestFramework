export class SidebarComponent {
  constructor(page) {
    this.page = page;

    this.menuButton       = page.locator('button[aria-label="Open Sidenav"]');
    this.container        = page.locator('mat-sidenav');
    this.aboutLink        = page.locator('a[routerlink="/about"]');
    this.scoreBoardLink   = page.locator('a[routerlink="/score-board"]');
    this.complainLink     = page.locator('a[routerlink="/complain"]');
    this.recycleLink      = page.locator('a[routerlink="/recycle"]');
    this.photoWallLink    = page.locator('a[routerlink="/photo-wall"]');
    this.deluxeLink       = page.locator('a[routerlink="/deluxe-membership"]');
    this.accountOrdersLink = page.locator('a[routerlink="/order-history"]');
    this.privacyPolicyLink = page.locator('a[routerlink="/privacy-security/privacy-policy"]');
  }
}
