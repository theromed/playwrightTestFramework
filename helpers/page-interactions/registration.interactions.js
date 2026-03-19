import { allure } from 'allure-playwright';

export class RegistrationInteractions {
  constructor(registrationPage) {
    this.registrationPage = registrationPage;
  }

  async registerUser(email, password, repeatPassword, securityQuestionId, securityAnswer) {
    await allure.step(`Register user ${email}`, async () => {
      await allure.step('Fill email', async () => {
        await this.registrationPage.emailInput.fill(email);
      });

      await allure.step('Fill password', async () => {
        await this.registrationPage.passwordInput.fill(password);
      });

      await allure.step('Fill repeat password', async () => {
        await this.registrationPage.repeatPasswordInput.fill(repeatPassword);
      });

      await allure.step('Select security question', async () => {
        const panel = this.registrationPage.page.locator('.cdk-overlay-pane mat-option');
        // Retry clicking the select until dropdown opens (handles load-induced flakiness)
        for (let attempt = 0; attempt < 3; attempt++) {
          await this.registrationPage.securityQuestionSelect.scrollIntoViewIfNeeded();
          await this.registrationPage.securityQuestionSelect.click();
          try {
            await panel.first().waitFor({ state: 'visible', timeout: 3000 });
            break; // Dropdown opened
          } catch {
            // Dropdown didn't open — close any stale overlay and retry
            await this.registrationPage.page.keyboard.press('Escape');
            await this.registrationPage.page.locator('.cdk-overlay-pane').waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
          }
        }
        await panel.nth(securityQuestionId - 1).click();
      });

      await allure.step('Fill security answer', async () => {
        await this.registrationPage.securityAnswerInput.fill(securityAnswer);
      });

      await allure.step('Click Register button', async () => {
        await this.registrationPage.registerButton.click();
      });
    });
  }

  async getEmailError() {
    return await allure.step('Get email validation error', async () => {
      await this.registrationPage.emailError.waitFor({ state: 'visible' });
      return await this.registrationPage.emailError.textContent();
    });
  }

  async getPasswordError() {
    return await allure.step('Get password validation error', async () => {
      await this.registrationPage.passwordError.waitFor({ state: 'visible' });
      return await this.registrationPage.passwordError.textContent();
    });
  }
}
