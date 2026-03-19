export class ForgotPasswordPage {
  constructor(page) {
    this.page = page;

    this.emailInput            = page.locator('#email');
    this.securityQuestionSelect = page.locator('#securityQuestion');
    this.securityAnswerInput   = page.locator('#securityAnswer');
    this.newPasswordInput      = page.locator('#newPassword');
    this.repeatPasswordInput   = page.locator('#newPasswordRepeat');
    this.resetButton           = page.locator('#resetButton');
    this.errorMessage          = page.locator('.error');
  }
}
