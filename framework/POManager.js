import { LoginPage }            from '../pages/login.page.js';
import { RegistrationPage }     from '../pages/registration.page.js';
import { ProductListPage }      from '../pages/productList.page.js';
import { ProductDetailPage }    from '../pages/productDetail.page.js';
import { BasketPage }           from '../pages/basket.page.js';
import { SearchPage }           from '../pages/search.page.js';
import { CheckoutPage }         from '../pages/checkout.page.js';
import { AddressPage }          from '../pages/address.page.js';
import { PaymentPage }          from '../pages/payment.page.js';
import { OrderSummaryPage }     from '../pages/orderSummary.page.js';
import { ContactPage }          from '../pages/contact.page.js';
// TODO: Add tests for ScoreBoard page
import { ScoreBoardPage }       from '../pages/scoreBoard.page.js';
import { AdministrationPage }   from '../pages/administration.page.js';
import { UserProfilePage }      from '../pages/userProfile.page.js';
import { ChangePasswordPage }   from '../pages/changePassword.page.js';
import { ForgotPasswordPage }   from '../pages/forgotPassword.page.js';

import { WelcomeBannerComponent }      from '../components/welcomeBanner.component.js';
import { CookieBannerComponent }      from '../components/cookieBanner.component.js';

import { LoginInteractions }          from '../helpers/page-interactions/login.interactions.js';
import { RegistrationInteractions }   from '../helpers/page-interactions/registration.interactions.js';
import { SearchInteractions }         from '../helpers/page-interactions/search.interactions.js';
import { ProductInteractions }        from '../helpers/page-interactions/product.interactions.js';
import { BasketInteractions }         from '../helpers/page-interactions/basket.interactions.js';
import { CheckoutInteractions }       from '../helpers/page-interactions/checkout.interactions.js';
import { ContactInteractions }        from '../helpers/page-interactions/contact.interactions.js';
import { NavigationInteractions }     from '../helpers/page-interactions/navigation.interactions.js';
import { AdministrationInteractions } from '../helpers/page-interactions/administration.interactions.js';
import { ChangePasswordInteractions } from '../helpers/page-interactions/changePassword.interactions.js';

export class POManager {
  constructor(page) {
    this.page = page;
    this._cache = {};
  }

  /**
   * Lazy getter — создаёт объект при первом вызове, затем возвращает из кэша.
   */
  _getOrCreate(key, factory) {
    if (!this._cache[key]) {
      this._cache[key] = factory();
    }
    return this._cache[key];
  }

  // --- Page Objects ---

  get loginPage() {
    return this._getOrCreate('loginPage', () => new LoginPage(this.page));
  }

  get registrationPage() {
    return this._getOrCreate('registrationPage', () => new RegistrationPage(this.page));
  }

  get productListPage() {
    return this._getOrCreate('productListPage', () => new ProductListPage(this.page));
  }

  get productDetailPage() {
    return this._getOrCreate('productDetailPage', () => new ProductDetailPage(this.page));
  }

  get basketPage() {
    return this._getOrCreate('basketPage', () => new BasketPage(this.page));
  }

  get searchPage() {
    return this._getOrCreate('searchPage', () => new SearchPage(this.page));
  }

  get checkoutPage() {
    return this._getOrCreate('checkoutPage', () => new CheckoutPage(this.page));
  }

  get addressPage() {
    return this._getOrCreate('addressPage', () => new AddressPage(this.page));
  }

  get paymentPage() {
    return this._getOrCreate('paymentPage', () => new PaymentPage(this.page));
  }

  get orderSummaryPage() {
    return this._getOrCreate('orderSummaryPage', () => new OrderSummaryPage(this.page));
  }

  get contactPage() {
    return this._getOrCreate('contactPage', () => new ContactPage(this.page));
  }

  get scoreBoardPage() {
    return this._getOrCreate('scoreBoardPage', () => new ScoreBoardPage(this.page));
  }

  get administrationPage() {
    return this._getOrCreate('administrationPage', () => new AdministrationPage(this.page));
  }

  get userProfilePage() {
    return this._getOrCreate('userProfilePage', () => new UserProfilePage(this.page));
  }

  get changePasswordPage() {
    return this._getOrCreate('changePasswordPage', () => new ChangePasswordPage(this.page));
  }

  get forgotPasswordPage() {
    return this._getOrCreate('forgotPasswordPage', () => new ForgotPasswordPage(this.page));
  }

  // --- Components ---

  get welcomeBanner() {
    return this._getOrCreate('welcomeBanner', () => new WelcomeBannerComponent(this.page));
  }

  get cookieBanner() {
    return this._getOrCreate('cookieBanner', () => new CookieBannerComponent(this.page));
  }

  // --- Interactions ---

  get loginInteractions() {
    return this._getOrCreate('loginInteractions',
      () => new LoginInteractions(this.loginPage));
  }

  get registrationInteractions() {
    return this._getOrCreate('registrationInteractions',
      () => new RegistrationInteractions(this.registrationPage));
  }

  get searchInteractions() {
    return this._getOrCreate('searchInteractions',
      () => new SearchInteractions(this.searchPage, this.productListPage));
  }

  get productInteractions() {
    return this._getOrCreate('productInteractions',
      () => new ProductInteractions(this.productListPage));
  }

  get basketInteractions() {
    return this._getOrCreate('basketInteractions',
      () => new BasketInteractions(this.basketPage));
  }

  get checkoutInteractions() {
    return this._getOrCreate('checkoutInteractions',
      () => new CheckoutInteractions(this.checkoutPage));
  }

  get contactInteractions() {
    return this._getOrCreate('contactInteractions',
      () => new ContactInteractions(this.contactPage));
  }

  get navigationInteractions() {
    return this._getOrCreate('navigationInteractions',
      () => new NavigationInteractions(
        this.page, this.productListPage,
        this.welcomeBanner, this.cookieBanner,
        this.loginInteractions,
      ));
  }

  get administrationInteractions() {
    return this._getOrCreate('administrationInteractions',
      () => new AdministrationInteractions(this.administrationPage));
  }

  get changePasswordInteractions() {
    return this._getOrCreate('changePasswordInteractions',
      () => new ChangePasswordInteractions(this.changePasswordPage));
  }
}
