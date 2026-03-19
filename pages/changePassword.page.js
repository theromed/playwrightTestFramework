export class ChangePasswordPage {
  constructor(page) {
    this.page = page;

    this.currentPasswordInput = page.locator('#currentPassword');
    this.newPasswordInput     = page.locator('#newPassword');
    this.repeatPasswordInput  = page.locator('#newPasswordRepeat');
    this.submitButton         = page.locator('#changeButton');
    this.errorMessage         = page.locator('.error');
    this.successMessage       = page.locator('.confirmation');
  }
}
