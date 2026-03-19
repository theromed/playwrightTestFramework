export class AddressPage {
  constructor(page) {
    this.page = page;

    this.countryInput      = page.getByPlaceholder('Please provide a country.');
    this.nameInput         = page.getByPlaceholder('Please provide a name.');
    this.mobileInput       = page.getByPlaceholder('Please provide a mobile number.');
    this.zipCodeInput      = page.getByPlaceholder('Please provide a ZIP code.');
    this.addressInput      = page.locator('#address');
    this.cityInput         = page.getByPlaceholder('Please provide a city.');
    this.stateInput        = page.getByPlaceholder('Please provide a state.');
    this.submitButton      = page.locator('#submitButton');
  }
}
