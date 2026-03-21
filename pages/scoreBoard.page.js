export class ScoreBoardPage {
  constructor(page) {
    this.page = page;

    this.challengeCards     = page.locator('mat-card');
    this.challengeRows     = page.locator('mat-card');
    this.difficultyFilter  = page.locator('mat-chip');
    this.categoryTags      = page.locator('mat-chip');
    this.hackingProgress   = page.locator(':text("Hacking Challenges")');
    this.challengesSolved  = page.locator(':text("Challenges Solved")');
  }
}
