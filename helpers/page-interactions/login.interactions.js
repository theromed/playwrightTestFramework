import { allure } from 'allure-playwright';

export class LoginInteractions {
  constructor(loginPage) {
    this.loginPage = loginPage;
  }

  async loginAs(email, password) {
    await allure.step(`Login as ${email}`, async () => {
      await this.loginPage.emailInput.fill(email);
      await this.loginPage.passwordInput.fill(password);
      await this.loginPage.loginButton.click();
    });
  }

  async loginWithRememberMe(email, password) {
    await allure.step(`Login with Remember Me as ${email}`, async () => {
      await this.loginPage.emailInput.fill(email);
      await this.loginPage.passwordInput.fill(password);
      await this.loginPage.rememberMeCheckbox.check();
      await this.loginPage.loginButton.click();
    });
  }

  async getErrorMessage() {
    return await allure.step('Get login error message', async () => {
      await this.loginPage.errorMessage.waitFor({ state: 'visible' });
      return await this.loginPage.errorMessage.textContent();
    });
  }

  async navigateToForgotPassword() {
    await allure.step('Navigate to Forgot Password', async () => {
      await this.loginPage.forgotPasswordLink.click();
    });
  }

  async navigateToRegistration() {
    await allure.step('Navigate to Registration', async () => {
      await this.loginPage.notYetCustomerLink.click();
    });
  }
}
