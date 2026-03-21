export class ComplaintPage {
  constructor(page) {
    this.page = page;

    this.messageInput = page.locator('#complaintMessage');
    this.fileUpload   = page.locator('#file');
    this.submitButton = page.locator('#submitButton');
  }
}
