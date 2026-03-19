export class RegistrationPage {
  constructor(page) {
    this.page = page;

    this.emailInput              = page.locator('#emailControl');
    this.passwordInput           = page.locator('#passwordControl');
    this.repeatPasswordInput     = page.locator('#repeatPasswordControl');
    this.securityQuestionSelect  = page.locator('mat-select[aria-label="Selection list for the security question"]');
    this.securityAnswerInput     = page.locator('#securityAnswerControl');
    this.registerButton          = page.locator('#registerButton');

    // Validation messages — use text content since IDs are dynamic
    this.emailError              = page.locator('mat-error', { hasText: 'Email address is not valid' });
    this.passwordError           = page.locator('mat-error', { hasText: 'password' });
    this.passwordAdvice          = page.locator('.mat-password-strength-info');
    this.repeatPasswordError     = page.locator('mat-error', { hasText: 'Passwords do not match' });
  }
}
