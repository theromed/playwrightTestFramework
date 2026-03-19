import { HeaderComponent } from '../components/header.component.js';

export class ContactPage {
  constructor(page) {
    this.page = page;

    // Components
    this.header = new HeaderComponent(page);

    // Contact form
    this.authorField     = page.locator('input[aria-label="Field with the name of the author"]');
    this.commentTextarea  = page.locator('#comment');
    this.ratingSlider     = page.locator('mat-slider');
    this.ratingInput      = page.locator('mat-slider input[type="range"]');
    this.captchaField     = page.locator('#captchaControl');
    this.captchaResult    = page.locator('#captcha');
    this.submitButton     = page.locator('#submitButton');
  }
}
