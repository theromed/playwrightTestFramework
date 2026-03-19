export class LoginPage {
  constructor(page) {
    this.page = page;

    // Локаторы — только стабильные селекторы
    this.emailInput    = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('#loginButton');
    this.errorMessage  = page.locator('.error');

    // Связанные навигационные элементы
    this.forgotPasswordLink    = page.locator('#forgot-password');
    this.notYetCustomerLink    = page.locator('#newCustomerLink');
    this.rememberMeCheckbox    = page.locator('#rememberMe-input');
    this.googleLoginButton     = page.locator('#loginButtonGoogle');
  }
}
