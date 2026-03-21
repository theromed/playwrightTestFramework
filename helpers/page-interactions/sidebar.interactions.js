import { allure } from 'allure-playwright';

export class SidebarInteractions {
  constructor(sidebarComponent) {
    this.sidebar = sidebarComponent;
  }

  async openSidebar() {
    await allure.step('Open sidebar menu', async () => {
      await this.sidebar.menuButton.click();
      await this.sidebar.container.waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  async navigateToAbout() {
    await allure.step('Navigate to About page via sidebar', async () => {
      await this.openSidebar();
      await this.sidebar.aboutLink.click();
    });
  }

  async navigateToComplaint() {
    await allure.step('Navigate to Complaint page via sidebar', async () => {
      await this.openSidebar();
      await this.sidebar.complainLink.click();
    });
  }

  async navigateToScoreBoard() {
    await allure.step('Navigate to Score Board via sidebar', async () => {
      await this.openSidebar();
      await this.sidebar.scoreBoardLink.click();
    });
  }

  async navigateToDeluxe() {
    await allure.step('Navigate to Deluxe Membership via sidebar', async () => {
      await this.openSidebar();
      await this.sidebar.deluxeLink.click();
    });
  }

  async navigateToOrderHistory() {
    await allure.step('Navigate to Order History via sidebar', async () => {
      await this.openSidebar();
      await this.sidebar.accountOrdersLink.click();
    });
  }
}
