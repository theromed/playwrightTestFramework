import { allure } from 'allure-playwright';

export class ChangePasswordInteractions {
  constructor(changePasswordPage) {
    this.changePasswordPage = changePasswordPage;
  }

  async changePassword(currentPassword, newPassword) {
    await allure.step('Change password', async () => {
      await this.changePasswordPage.currentPasswordInput.fill(currentPassword);
      await this.changePasswordPage.newPasswordInput.fill(newPassword);
      await this.changePasswordPage.repeatPasswordInput.fill(newPassword);
      await this.changePasswordPage.submitButton.click();
    });
  }

  async fillMismatchedPasswords(currentPassword, newPassword, repeatPassword) {
    await allure.step('Fill mismatched passwords', async () => {
      await this.changePasswordPage.currentPasswordInput.fill(currentPassword);
      await this.changePasswordPage.newPasswordInput.fill(newPassword);
      await this.changePasswordPage.repeatPasswordInput.fill(repeatPassword);
      await this.changePasswordPage.repeatPasswordInput.blur();
    });
  }

  async submitWithWrongPassword(wrongCurrentPassword, newPassword) {
    await allure.step('Submit with wrong current password', async () => {
      await this.changePasswordPage.currentPasswordInput.fill(wrongCurrentPassword);
      await this.changePasswordPage.newPasswordInput.fill(newPassword);
      await this.changePasswordPage.repeatPasswordInput.fill(newPassword);
      await this.changePasswordPage.submitButton.click();
    });
  }
}
