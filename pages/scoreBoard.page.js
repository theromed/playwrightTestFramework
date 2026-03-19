export class ScoreBoardPage {
  constructor(page) {
    this.page = page;

    this.challengeRows     = page.locator('mat-row');
    this.challengeName     = page.locator('mat-cell.mat-column-name');
    this.challengeStatus   = page.locator('mat-cell.mat-column-status');
    this.difficultyFilter  = page.locator('mat-chip');
    this.progressBar       = page.locator('mat-progress-bar');
    this.solvedCount       = page.locator('.score-board-progress span');
  }
}
