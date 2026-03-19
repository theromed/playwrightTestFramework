import { allure } from 'allure-playwright';

export class AdministrationInteractions {
  constructor(administrationPage) {
    this.administrationPage = administrationPage;
  }

  async getUsersCount() {
    return await allure.step('Get users count in admin panel', async () => {
      await this.administrationPage.userRows.first().waitFor({ state: 'visible' });
      return await this.administrationPage.userRows.count();
    });
  }

  async getUserEmails() {
    return await allure.step('Get all user emails', async () => {
      await this.administrationPage.userEmail.first().waitFor({ state: 'visible', timeout: 10000 });
      return await this.administrationPage.userEmail.allTextContents();
    });
  }

  async getFeedbacksCount() {
    return await allure.step('Get feedbacks count in admin panel', async () => {
      return await this.administrationPage.feedbackRows.count();
    });
  }
}
