export class UserProfilePage {
  constructor(page) {
    this.page = page;

    this.usernameInput    = page.locator('#username');
    this.profileImage     = page.locator('#profileImage');
    this.uploadInput      = page.locator('#picture');
    this.setImageButton   = page.locator('#submitUrl');
    this.imageUrlInput    = page.locator('#url');
    this.saveButton       = page.locator('#submit');
  }
}
