import { allure } from 'allure-playwright';

export class UserProfileInteractions {
  constructor(userProfilePage) {
    this.profile = userProfilePage;
  }

  async isProfilePageVisible() {
    return await allure.step('Check if profile page is visible', async () => {
      return await this.profile.usernameInput.isVisible();
    });
  }

  async setUsername(username) {
    await allure.step(`Set username to "${username}"`, async () => {
      await this.profile.usernameInput.clear();
      await this.profile.usernameInput.fill(username);
      await this.profile.saveButton.click();
    });
  }

  async getUsername() {
    return await allure.step('Get current username', async () => {
      return await this.profile.usernameInput.inputValue();
    });
  }
}
