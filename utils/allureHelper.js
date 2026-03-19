import { allure } from 'allure-playwright';

export class AllureHelper {
  static async attachScreenshot(page, name = 'Screenshot') {
    const screenshot = await page.screenshot({ fullPage: true });
    await allure.attachment(name, screenshot, 'image/png');
  }

  static async attachPageSource(page, name = 'Page HTML') {
    const html = await page.content();
    await allure.attachment(name, html, 'text/html');
  }

  static async attachApiResponse(response, name = 'API Response') {
    await allure.attachment(
      name,
      JSON.stringify(response, null, 2),
      'application/json'
    );
  }

  static async attachLogs(logs, name = 'Console Logs') {
    await allure.attachment(name, logs.join('\n'), 'text/plain');
  }
}
