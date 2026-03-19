import { allure } from 'allure-playwright';

export class ContactInteractions {
  constructor(contactPage) {
    this.contactPage = contactPage;
  }

  async submitFeedback(comment, rating, captchaAnswer) {
    await allure.step(`Submit feedback with rating=${rating}`, async () => {
      await allure.step('Fill comment', async () => {
        await this.contactPage.commentTextarea.fill(comment);
      });

      await allure.step(`Set rating to ${rating}`, async () => {
        // Focus the range input and use End key to set max, then adjust
        const ratingInput = this.contactPage.ratingInput;
        await ratingInput.focus();
        // Press End to go to max (5), then ArrowLeft to reach desired rating
        await ratingInput.press('End');
        const stepsBack = 5 - rating;
        for (let i = 0; i < stepsBack; i++) {
          await ratingInput.press('ArrowLeft');
        }
      });

      await allure.step('Solve captcha', async () => {
        await this.contactPage.captchaField.fill(String(captchaAnswer));
      });

      await allure.step('Submit form', async () => {
        await this.contactPage.submitButton.click();
      });
    });
  }

  async getCaptchaExpression() {
    return await allure.step('Get captcha expression', async () => {
      // Wait for captcha to load from API before reading
      await this.contactPage.captchaResult.waitFor({ state: 'visible', timeout: 5000 });
      // Wait until the captcha text is non-empty
      await this.contactPage.page.waitForFunction(
        (sel) => {
          const el = document.querySelector(sel);
          return el && el.textContent.trim().length > 0;
        },
        '#captcha',
        { timeout: 5000 }
      );
      return await this.contactPage.captchaResult.textContent();
    });
  }
}
