import { allure } from 'allure-playwright';

export class ForgotPasswordInteractions {
  constructor(forgotPasswordPage) {
    this.fp = forgotPasswordPage;
  }

  async resetPassword(email, securityAnswer, newPassword) {
    await allure.step(`Reset password for ${email}`, async () => {
      await allure.step('Enter email', async () => {
        await this.fp.emailInput.fill(email);
        await this.fp.emailInput.press('Tab');
      });

      await allure.step('Fill security answer', async () => {
        await this.fp.securityAnswerInput.waitFor({ state: 'attached', timeout: 5000 });
        await this.fp.securityAnswerInput.fill(securityAnswer, { force: true });
      });

      await allure.step('Enter new password', async () => {
        await this.fp.newPasswordInput.fill(newPassword, { force: true });
        await this.fp.repeatPasswordInput.fill(newPassword, { force: true });
      });

      await allure.step('Click Reset button', async () => {
        await this.fp.resetButton.click();
      });
    });
  }

  async getErrorMessage() {
    return await allure.step('Get error message', async () => {
      await this.fp.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      return await this.fp.errorMessage.textContent();
    });
  }

  async isSecurityQuestionVisible() {
    return await allure.step('Check if security question is visible', async () => {
      return await this.fp.securityAnswerInput.isVisible();
    });
  }
}
