export class ForgotPasswordPage {
  constructor(page) {
    this.page = page;

    this.emailInput            = page.locator('#email');
    this.securityQuestionLabel  = page.locator('mat-form-field:has(#securityAnswer) label');
    this.securityAnswerInput   = page.locator('#securityAnswer');
    this.newPasswordInput      = page.locator('#newPassword');
    this.repeatPasswordInput   = page.locator('#newPasswordRepeat');
    this.resetButton           = page.locator('#resetButton');
    this.errorMessage          = page.locator('.error');
  }
}
