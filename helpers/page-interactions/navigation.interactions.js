import { allure } from 'allure-playwright';
import { URLS } from '../../config/urls.js';
import { ENV } from '../../config/env.js';

export class NavigationInteractions {
  constructor(page, productListPage, welcomeBanner, cookieBanner, loginInteractions) {
    this.page = page;
    this.productListPage = productListPage;
    this.welcomeBanner = welcomeBanner;
    this.cookieBanner = cookieBanner;
    this.loginInteractions = loginInteractions;
  }

  async goToHomePage() {
    await allure.step('Navigate to Home page', async () => {
      await this.page.goto(ENV.baseUrl + URLS.home);
    });
  }

  async goToLoginPage() {
    await allure.step('Navigate to Login page', async () => {
      await this.productListPage.header.accountButton.click();
      await this.productListPage.header.loginOption.click();
    });
  }

  async goToBasket() {
    await allure.step('Navigate to Basket', async () => {
      await this.productListPage.header.basketButton.click();
    });
  }

  async logout() {
    await allure.step('Logout', async () => {
      await this.productListPage.header.accountButton.click();
      await this.productListPage.header.logoutButton.click();
    });
  }

  async closeWelcomeBanner() {
    try {
      await this.welcomeBanner.dismissButton.waitFor({ state: 'visible', timeout: 3000 });
      await this.welcomeBanner.dismissButton.click();
    } catch {
      // Not present — fine
    }
  }

  async closeCookieBanner() {
    try {
      await this.cookieBanner.dismissLink.waitFor({ state: 'visible', timeout: 2000 });
      await this.cookieBanner.dismissLink.click();
    } catch {
      // Not present — fine
    }
  }

  async dismissAllDialogs() {
    await this.closeWelcomeBanner();
    await this.closeCookieBanner();
  }

  async loginViaUI(email, password) {
    await allure.step(`Login via UI as ${email}`, async () => {
      await this.page.goto(ENV.baseUrl + URLS.login);
      await this.dismissAllDialogs();
      await this.loginInteractions.loginAs(email, password);
      // Wait for Angular to redirect after login
      await this.page.waitForURL('**/search**', { timeout: 10000 });
    });
  }

  async searchFor(query) {
    await allure.step(`Search for "${query}" via header`, async () => {
      await this.productListPage.header.searchIcon.click();
      await this.productListPage.header.searchInput.fill(query);
      await this.productListPage.header.searchInput.press('Enter');
    });
  }
}
