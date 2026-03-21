import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }       from 'allure-playwright';
import { ENV }          from '../../../config/env.js';
import { URLS }         from '../../../config/urls.js';

test.describe('Score Board', () => {

  test('Should display score board with challenges', async ({ page, pm }) => {
    await allure.severity('normal');
    await allure.feature('Score Board');
    await allure.story('View challenges');

    // Act — navigate directly to score board
    await page.goto(ENV.baseUrl + URLS.scoreBoard);
    await pm.navigationInteractions.dismissAllDialogs();

    // Assert — score board content is visible
    await expect(pm.scoreBoardPage.hackingProgress).toBeVisible({ timeout: 10000 });
    await expect(pm.scoreBoardPage.challengesSolved).toBeVisible();
  });
});
