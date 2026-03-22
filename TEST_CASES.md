# OWASP Juice Shop — Test Cases

> **Total: 73 test cases** (71 active + 2 skipped) across 37 spec files
> **Framework**: Playwright + Allure
> **Pattern**: AAA (Arrange-Act-Assert)
> **Last updated**: 2026-03-21

---

## Table of Contents

- [UI Sanity Tests (18)](#ui-sanity-tests)
  - [Login Page (3)](#1-login-page)
  - [Registration Page (3)](#2-registration-page)
  - [Navigation (2)](#3-navigation)
  - [Search (2)](#4-search)
  - [About Us (1)](#5-about-us)
  - [Pagination (2)](#6-pagination)
  - [User Profile (2)](#7-user-profile)
  - [Complaint (1)](#8-complaint)
  - [Forgot Password (2 — skipped)](#9-forgot-password)
- [UI Regression Tests (24)](#ui-regression-tests)
  - [Change Password (3)](#10-change-password)
  - [Product Review (2)](#11-product-review)
  - [Customer Feedback (2)](#12-customer-feedback)
  - [Administration Panel (2)](#13-administration-panel)
  - [Basket Page (4)](#14-basket-page)
  - [Checkout Flow (1)](#15-checkout-flow)
  - [Product Detail (2)](#16-product-detail)
  - [Search Extended (2)](#17-search-extended)
  - [Sidebar Navigation (2)](#18-sidebar-navigation)
  - [Score Board (1)](#19-score-board)
  - [Deluxe Membership (1)](#20-deluxe-membership)
  - [Forgot Password Extended (1)](#21-forgot-password-extended)
  - [Order History (1)](#22-order-history)
- [API Sanity Tests (15)](#api-sanity-tests)
  - [Auth API (7)](#23-auth-api)
  - [Products API (5)](#24-products-api)
  - [Users API (2)](#25-users-api)
  - [Security Questions API (1)](#26-security-questions-api)
- [API Regression Tests (18)](#api-regression-tests)
  - [Feedback API (2)](#27-feedback-api)
  - [Basket API (5)](#28-basket-api)
  - [Orders API (2)](#29-orders-api)
  - [Address API (3)](#30-address-api)
  - [Card API (2)](#31-card-api)
  - [Complaint API (2)](#32-complaint-api)
  - [Product Reviews API (2)](#33-product-reviews-api)

---

## UI Sanity Tests

### 1. Login Page

**File**: `tests/ui/sanity/login.spec.js`
**Suite**: `Login Page`
**Preconditions**: Navigate to login page, dismiss Welcome + Cookie banners

---

#### TC-UI-S-001: Should login with valid credentials

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Login                              |
| **Story**        | Valid credentials                   |
| **Preconditions**| User is on Login page              |

**Steps**:
1. Enter valid admin email into the Email field
2. Enter valid admin password into the Password field
3. Click the Login button

**Expected Result**:
User is redirected to the product list page. At least one product card is visible.

---

#### TC-UI-S-002: Should show error with invalid credentials

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Login                              |
| **Story**        | Invalid credentials                 |
| **Preconditions**| User is on Login page              |

**Steps**:
1. Enter invalid email (`wrong@email.com`) into the Email field
2. Enter invalid password (`wrongPassword`) into the Password field
3. Click the Login button

**Expected Result**:
An error message is displayed containing the text "Invalid".

---

#### TC-UI-S-003: Should navigate to registration page

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Login                              |
| **Story**        | Navigation to Registration          |
| **Preconditions**| User is on Login page              |

**Steps**:
1. Click the "Not yet a customer?" link

**Expected Result**:
Registration page is opened. Email input field is visible.

---

### 2. Registration Page

**File**: `tests/ui/sanity/registration.spec.js`
**Suite**: `Registration Page`
**Preconditions**: Navigate to registration page, dismiss banners. Admin token obtained for cleanup.

---

#### TC-UI-S-004: Should register new user via UI

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Registration                       |
| **Story**        | Successful registration             |
| **Preconditions**| User is on Registration page       |
| **Cleanup**      | Created user is deleted via Admin API |

**Steps**:
1. Fill in a unique email address (format: `reg-ui-<timestamp>@juice-sh.op`)
2. Fill in password `UiTest123!`
3. Fill in repeat password `UiTest123!`
4. Select the first security question from the dropdown
5. Fill in security answer `Green`
6. Click the Register button

**Expected Result**:
User is redirected to the Login page. Login email input is visible. User can successfully authenticate via API with the created credentials.

---

#### TC-UI-S-005: Should show validation error for invalid email

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Registration                       |
| **Story**        | Email validation                    |
| **Preconditions**| User is on Registration page       |

**Steps**:
1. Enter an invalid email (`invalid-email`) into the Email field
2. Remove focus from the Email field (blur)

**Expected Result**:
Validation error "Email address is not valid" is displayed below the Email field.

---

#### TC-UI-S-006: Should show error when passwords do not match

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Registration                       |
| **Story**        | Password mismatch                   |
| **Preconditions**| User is on Registration page       |

**Steps**:
1. Enter `Password1!` into the Password field
2. Enter `DifferentPassword1!` into the Repeat Password field
3. Remove focus from the Repeat Password field (blur)

**Expected Result**:
Validation error "Passwords do not match" is displayed below the Repeat Password field.

---

### 3. Navigation

**File**: `tests/ui/sanity/navigation.spec.js`
**Suite**: `Navigation`
**Preconditions**: Home page is loaded via `homePage` fixture (banners dismissed)

---

#### TC-UI-S-007: Should navigate to main pages from header

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Navigation                         |
| **Story**        | Header navigation                   |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click the Account button in the header
2. Click the Login option in the dropdown

**Expected Result**:
Login page is opened. Email input field is visible.

---

#### TC-UI-S-008: Should display header elements on home page

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Navigation                         |
| **Story**        | Header elements                     |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Observe the header elements

**Expected Result**:
The following header elements are visible:
- Account button
- Search icon
- Language selector

---

### 4. Search

**File**: `tests/ui/sanity/search.spec.js`
**Suite**: `Search`
**Preconditions**: Home page is loaded via `homePage` fixture (banners dismissed)

---

#### TC-UI-S-009: Should find products matching search query

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Search                             |
| **Story**        | Successful search                   |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click the search icon in the header
2. Enter `juice` into the search field
3. Press Enter

**Expected Result**:
Search results are displayed. The number of results is greater than 0.

---

#### TC-UI-S-010: Should show no results for non-existent product

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Search                             |
| **Story**        | No results                          |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click the search icon in the header
2. Enter `xyznonexistentproduct123` into the search field
3. Press Enter

**Expected Result**:
No product results are displayed. The "no results" indicator is visible (empty search results list).

---

## UI Regression Tests

### 10. Change Password

**File**: `tests/ui/regression/changePassword.spec.js`
**Suite**: `Change Password`
**Preconditions**: Temporary user created via API (`tempUser` fixture). Token injected into browser localStorage. Navigated to Change Password page.
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-R-001: Should change password successfully

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Change Password                    |
| **Story**        | Successful password change          |
| **Preconditions**| Authenticated tempUser on Change Password page |

**Steps**:
1. Enter current password (`TempUser123!`) into the Current Password field
2. Enter new password (`NewPassword123!`) into the New Password field
3. Enter new password (`NewPassword123!`) into the Repeat New Password field
4. Click the Submit button

**Expected Result**:
Success message is displayed confirming the password was changed.

---

#### TC-UI-R-002: Should show error when passwords do not match

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Change Password                    |
| **Story**        | Password mismatch                   |
| **Preconditions**| Authenticated tempUser on Change Password page |

**Steps**:
1. Enter current password into the Current Password field
2. Enter `NewPassword1!` into the New Password field
3. Enter `DifferentPassword1!` into the Repeat New Password field
4. Remove focus from the Repeat Password field

**Expected Result**:
Submit button is disabled (cannot be clicked).

---

#### TC-UI-R-003: Should show error with wrong current password

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Change Password                    |
| **Story**        | Wrong current password              |
| **Preconditions**| Authenticated tempUser on Change Password page |

**Steps**:
1. Enter incorrect current password (`WrongPassword!`) into the Current Password field
2. Enter `NewPassword1!` into the New Password field
3. Enter `NewPassword1!` into the Repeat New Password field
4. Click the Submit button

**Expected Result**:
Error message is displayed indicating the current password is incorrect.

---

### 11. Product Review

**File**: `tests/ui/regression/productReview.spec.js`
**Suite**: `Product Review`
**Preconditions**: Admin user logged in via API. Token injected into localStorage. Navigated to Home page.

---

#### TC-UI-R-004: Should write a product review

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Product Review                     |
| **Story**        | Write review                        |
| **Preconditions**| Authenticated admin on Home page   |

**Steps**:
1. Open the product detail dialog for "Apple Juice"
2. Enter a unique review text (format: `Test review <timestamp>`) into the review textarea
3. Click the Submit Review button

**Expected Result**:
The submitted review text appears in the reviews list on the product detail dialog.

---

#### TC-UI-R-005: Should display existing reviews on product detail

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Product Review                     |
| **Story**        | View reviews                        |
| **Preconditions**| Authenticated admin on Home page   |

**Steps**:
1. Open the product detail dialog for "Apple Juice"

**Expected Result**:
Product name is visible. The product detail dialog container is displayed (with existing reviews if any).

---

### 12. Customer Feedback

**File**: `tests/ui/regression/feedback.spec.js`
**Suite**: `Customer Feedback`
**Preconditions**: Admin user logged in via API. Token injected + page reloaded so Angular recognizes the user. Navigated to Contact page.
**Cleanup**: Created feedback entries are deleted via API.

---

#### TC-UI-R-006: Should submit feedback with valid captcha

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Feedback                           |
| **Story**        | Submit feedback                     |
| **Preconditions**| Authenticated admin on Contact page |

**Steps**:
1. Read the CAPTCHA expression from the page (e.g., `7+9*3`)
2. Calculate the CAPTCHA answer using the mathematical expression
3. Enter `Great shop!` into the Comment field
4. Set the rating slider to 5 (maximum)
5. Enter the calculated CAPTCHA answer into the Result field
6. Click the Submit button

**Expected Result**:
A snackbar notification appears confirming the feedback was submitted successfully.

---

#### TC-UI-R-007: Should not submit feedback without comment

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Feedback                           |
| **Story**        | Required fields validation          |
| **Preconditions**| Authenticated admin on Contact page |

**Steps**:
1. Observe the Submit button without filling any fields

**Expected Result**:
Submit button is disabled (cannot be clicked) because required fields (comment, captcha) are empty.

---

### 13. Administration Panel

**File**: `tests/ui/regression/administration.spec.js`
**Suite**: `Administration Panel`
**Preconditions**: Admin user logged in via API. Token injected + page reloaded. Navigated to Administration page.

---

#### TC-UI-R-008: Should display registered users in admin panel

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Administration                     |
| **Story**        | View users                          |
| **Preconditions**| Admin on Administration page       |

**Steps**:
1. Wait for the user table to load
2. Count the number of user rows

**Expected Result**:
The number of registered users in the table is greater than 0.

---

#### TC-UI-R-009: Should display user emails in admin panel

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Administration                     |
| **Story**        | View user details                   |
| **Preconditions**| Admin on Administration page       |

**Steps**:
1. Wait for the user email cells to load
2. Read all user email text values from the table

**Expected Result**:
- The list of emails has at least one entry
- At least one email contains the `@` symbol (valid email format)

---

### 14. Basket Page

**File**: `tests/ui/regression/basket.spec.js`
**Suite**: `Basket Page`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-R-010: Should display added product in basket

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Basket                             |
| **Story**        | Display added product               |
| **Preconditions**| tempUser created, product added to basket via API |

**Steps**:
1. Add a product (ProductId=1, quantity=1) to the tempUser's basket via API
2. Log in as tempUser via UI (login page)
3. Navigate to the Basket page

**Expected Result**:
At least one basket item row (`mat-row`) is visible, confirming the product was added.

---

#### TC-UI-R-011: Should show empty basket message when no items

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Basket                             |
| **Story**        | Empty basket                        |
| **Preconditions**| tempUser created (no items in basket) |

**Steps**:
1. Log in as tempUser via UI (login page)
2. Navigate to the Basket page

**Expected Result**:
Total price displays `0`, confirming the basket is empty.

---

### 15. Checkout Flow

**File**: `tests/ui/regression/checkout.spec.js`
**Suite**: `Checkout Flow`
**Preconditions**: Temporary user created via API. Product, address, and payment card created via API.
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-R-012: Should complete checkout and see order confirmation

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Checkout                           |
| **Story**        | Full checkout flow                   |
| **Preconditions**| tempUser with product in basket, delivery address, and payment card created via API |

**Steps**:
1. Add a product (ProductId=1, quantity=1) to the basket via API
2. Create a delivery address via API (fullName: Test User, city: Warsaw, country: Poland)
3. Create a payment card via API (Visa 4111...1111, exp 12/2099)
4. Log in as tempUser via UI (login page)
5. Navigate to the Basket page
6. Click the Checkout button
7. Select the first available address and proceed
8. Select the first delivery method and proceed
9. Select the first payment method and proceed
10. Click the Place Order button

**Expected Result**:
Order confirmation page is displayed, confirming the order was successfully placed.

---

## API Sanity Tests

### 23. Auth API

**File**: `tests/api/sanity/auth.api.spec.js`
**Suite**: `Auth API`

---

#### TC-API-S-001: Should return JWT token on valid login

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Blocker                            |
| **Feature**      | Authentication API                 |
| **Story**        | Valid login                         |
| **Schema**       | `login.schema.json`                |

**Steps**:
1. Send POST `/rest/user/login` with valid admin email and password

**Expected Result**:
- HTTP status code: `200`
- Response body contains `authentication.token` (non-empty JWT)
- Response matches `LoginResponse` JSON schema

---

#### TC-API-S-002: Should return 401 on invalid credentials

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Authentication API                 |
| **Story**        | Invalid credentials                 |

**Steps**:
1. Send POST `/rest/user/login` with invalid email (`invalid@email.com`) and password (`wrong`)

**Expected Result**:
- HTTP status code: `401`

---

#### TC-API-S-003: Should return user info via whoami

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Authentication API                 |
| **Story**        | WhoAmI                              |

**Steps**:
1. Obtain admin JWT token via login
2. Send GET `/rest/user/whoami` with Cookie header `token=<jwt>`

**Expected Result**:
- HTTP status code: `200`
- Response body contains `user` object
- `user.email` is non-empty

---

### 24. Products API

**File**: `tests/api/sanity/products.api.spec.js`
**Suite**: `Products API`

---

#### TC-API-S-004: Should return list of all products

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Products API                       |
| **Story**        | Get all products                    |
| **Schema**       | `product.schema.json`              |

**Steps**:
1. Send GET `/api/Products` with admin auth token

**Expected Result**:
- HTTP status code: `200`
- `data` array has at least one product
- Response matches `ProductsResponse` JSON schema

---

#### TC-API-S-005: Should return products matching search query

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Products API                       |
| **Story**        | Search products                     |

**Steps**:
1. Send GET `/rest/products/search?q=juice`

**Expected Result**:
- HTTP status code: `200`
- `data` array has at least one product
- First product's name contains "juice" (case-insensitive)

---

### 25. Users API

**File**: `tests/api/sanity/users.api.spec.js`
**Suite**: `Users API`
**Cleanup**: Created users are deleted via admin API after each test.

---

#### TC-API-S-006: Should register a new user

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Users API                          |
| **Story**        | Register user                       |
| **Schema**       | `user.schema.json`                 |

**Steps**:
1. Send POST `/api/Users` with unique email (`api-user-<timestamp>@juice-sh.op`) and password (`ApiTest123!`)

**Expected Result**:
- HTTP status code: `201`
- `data.email` matches the submitted email
- Response matches `UserResponse` JSON schema

---

#### TC-API-S-007: Should return 400 for duplicate email

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Users API                          |
| **Story**        | Duplicate email                     |

**Steps**:
1. Register a new user with unique email via API
2. Send a second POST `/api/Users` with the same email

**Expected Result**:
- HTTP status code: `400` (Bad Request — duplicate email)

---

## API Regression Tests

### 27. Feedback API

**File**: `tests/api/regression/feedback.api.spec.js`
**Suite**: `Feedback API`
**Cleanup**: Created feedback entries are deleted via API after each test.

---

#### TC-API-R-001: Should create feedback via API

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Feedback API                       |
| **Story**        | Create feedback                     |
| **Schema**       | `feedback.schema.json`             |

**Steps**:
1. Fetch CAPTCHA from GET `/rest/captcha`
2. Calculate the CAPTCHA answer
3. Send POST `/api/Feedbacks` with comment (`API test feedback <timestamp>`), rating (4), captchaId, and captcha answer

**Expected Result**:
- HTTP status code: `201`
- `data.comment` matches the submitted comment
- `data.rating` equals `4`
- Response matches `FeedbackResponse` JSON schema

---

#### TC-API-R-002: Should delete feedback via API

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Feedback API                       |
| **Story**        | Delete feedback                     |

**Steps**:
1. Create a feedback entry via API (comment: "To be deleted", rating: 3)
2. Send DELETE `/api/Feedbacks/<id>` with admin auth token

**Expected Result**:
- HTTP status code: `200`

---

### 28. Basket API

**File**: `tests/api/regression/basket.api.spec.js`
**Suite**: `Basket API`
**Preconditions**: Temporary user created via `tempUser` fixture (isolated basket).
**Cleanup**: Added items are removed. Temporary user is deleted.

---

#### TC-API-R-003: Should get basket by ID

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Basket API                         |
| **Story**        | Get basket                          |
| **Schema**       | `basket.schema.json`               |

**Steps**:
1. Send GET `/rest/basket/<basketId>` with tempUser auth token

**Expected Result**:
- HTTP status code: `200`
- `data.id` matches the tempUser's basket ID
- Response matches `BasketResponse` JSON schema

---

#### TC-API-R-004: Should add item to basket

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Basket API                         |
| **Story**        | Add item                            |

**Steps**:
1. Send POST `/api/BasketItems` with BasketId, ProductId=1, quantity=2, and tempUser auth token

**Expected Result**:
- HTTP status code: `200`
- `data.ProductId` equals `1`
- `data.quantity` equals `2`

---

### 29. Orders API

**File**: `tests/api/regression/orders.api.spec.js`
**Suite**: `Orders API`
**Preconditions**: Temporary user created via `tempUser` fixture.
**Cleanup**: Temporary user is deleted.

---

#### TC-API-R-005: Should checkout basket with items

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Orders API                         |
| **Story**        | Checkout                            |

**Steps**:
1. Add a product (ProductId=1, quantity=1) to tempUser's basket via API
2. Send POST `/rest/basket/<basketId>/checkout` with tempUser auth token

**Expected Result**:
- HTTP status code: `200`
- `orderConfirmation` is present and non-empty in the response

---

#### TC-API-R-006: Should checkout empty basket and return confirmation

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Orders API                         |
| **Story**        | Empty basket checkout                |

**Steps**:
1. Send POST `/rest/basket/<basketId>/checkout` with tempUser auth token (basket is empty)

**Expected Result**:
- HTTP status code: `200`
- `orderConfirmation` is present and non-empty (Juice Shop allows empty basket checkout)

---

### 5. About Us

**File**: `tests/ui/sanity/about.spec.js`
**Suite**: `About Us`
**Preconditions**: Home page is loaded via `homePage` fixture (banners dismissed)

---

#### TC-UI-S-011: Should display About Us page with company information

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | About Us                           |
| **Story**        | Page content                       |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Navigate to the About Us page (`/#/about`)
2. Observe the page content

**Expected Result**:
- "About Us" heading (`h1`) is visible
- "Corporate History" section (`h2`) is visible

---

### 6. Pagination

**File**: `tests/ui/sanity/pagination.spec.js`
**Suite**: `Product List`
**Preconditions**: Home page is loaded via `homePage` fixture (banners dismissed)

---

#### TC-UI-S-012: Should display products with pagination

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Product List                       |
| **Story**        | Pagination                         |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Observe the paginator component
2. Count the number of product cards on the first page

**Expected Result**:
- Paginator is visible
- Product count is greater than 0 and less than or equal to 12

---

#### TC-UI-S-013: Should navigate to next page of products

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Product List                       |
| **Story**        | Page navigation                    |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Note the product names on the current page
2. Click the "Next page" button in the paginator

**Expected Result**:
The first product on the new page is different from the first product on the initial page, confirming page navigation occurred.

---

### 7. User Profile

**File**: `tests/ui/sanity/profile.spec.js`
**Suite**: `User Profile`
**Preconditions**: Temporary user created via API (`tempUser` fixture). User logged in via UI. Navigated to Profile page (`/profile`).
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-S-014: Should display user profile page

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | User Profile                       |
| **Story**        | View profile                       |
| **Preconditions**| Authenticated tempUser on Profile page |

**Steps**:
1. Observe the profile page

**Expected Result**:
Profile page is visible with the username input field displayed.

---

#### TC-UI-S-015: Should update username on profile page

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | User Profile                       |
| **Story**        | Edit username                      |
| **Preconditions**| Authenticated tempUser on Profile page |

**Steps**:
1. Enter a new username (format: `TestUser<timestamp>`) into the username field
2. Click the Set Username button
3. Reload the page

**Expected Result**:
After reload, the username field displays the newly set username, confirming persistence.

---

### 8. Complaint

**File**: `tests/ui/sanity/complaint.spec.js`
**Suite**: `Complaint`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-S-016: Should display complaint form

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Complaint                          |
| **Story**        | View complaint form                |
| **Preconditions**| tempUser token set in localStorage |

**Steps**:
1. Navigate to the home page
2. Dismiss all dialogs (Welcome + Cookie banners)
3. Set tempUser token in browser localStorage
4. Navigate to the Complaint page (`/#/complain`)

**Expected Result**:
The following complaint form elements are visible/attached:
- Message textarea (`#complaintMessage`)
- File upload input (`#file`)
- Submit button (`#submitButton`)

---

### 9. Forgot Password

**File**: `tests/ui/sanity/forgotPassword.spec.js`
**Suite**: `Forgot Password`
**Status**: **SKIPPED** — Material Design `mat-label` overlay intercepts pointer events; `{force: true}` fill bypasses overlay but does not trigger Angular change detection, leaving the reset button disabled. Needs investigation.
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-S-017: Should reset password with correct security answer *(SKIPPED)*

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Forgot Password                    |
| **Story**        | Successful password reset          |
| **Preconditions**| tempUser created with securityAnswer "default" |
| **Status**       | Skipped — mat-label overlay issue  |

**Steps**:
1. Navigate to the Forgot Password page (`/#/forgot-password`)
2. Enter tempUser email into the Email field
3. Press Tab to trigger security question loading
4. Enter `default` into the Security Answer field
5. Enter new password (`ResetPass123!`) into the New Password and Repeat Password fields
6. Click the Reset button

**Expected Result**:
User is redirected to the Login page. Login via API with the new password succeeds (status 200).

---

#### TC-UI-S-018: Should show error with wrong security answer *(SKIPPED)*

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Forgot Password                    |
| **Story**        | Wrong security answer              |
| **Preconditions**| tempUser created with securityAnswer "default" |
| **Status**       | Skipped — mat-label overlay issue  |

**Steps**:
1. Navigate to the Forgot Password page
2. Enter tempUser email into the Email field
3. Press Tab to trigger security question loading
4. Enter `WrongAnswer` into the Security Answer field
5. Enter new password into the New Password and Repeat Password fields
6. Click the Reset button

**Expected Result**:
An error message is displayed indicating the answer is incorrect.

---

### 16. Product Detail

**File**: `tests/ui/regression/productDetail.spec.js`
**Suite**: `Product Detail`
**Preconditions**: Home page is loaded via `homePage` fixture (banners dismissed)

---

#### TC-UI-R-013: Should display product detail dialog with all fields

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Product Detail                     |
| **Story**        | View product details               |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click on the "Apple Juice" product name to open the detail dialog

**Expected Result**:
The product detail dialog is displayed with:
- Product name (`h1`) visible
- Product image visible
- Product price visible

---

#### TC-UI-R-014: Should close product detail dialog

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Product Detail                     |
| **Story**        | Close detail dialog                |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click on the "Apple Juice" product name to open the detail dialog
2. Wait for the product name to be visible
3. Click the Close button (`button[aria-label="Close Dialog"]`)

**Expected Result**:
The product detail dialog is closed. Product name is no longer visible.

---

### 17. Search Extended

**File**: `tests/ui/regression/searchExtended.spec.js`
**Suite**: `Search Extended`
**Preconditions**: Home page is loaded via `homePage` fixture (banners dismissed)

---

#### TC-UI-R-015: Should display product names matching search query

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Search                             |
| **Story**        | Search results match query         |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click the search icon in the header
2. Enter `Juice` into the search field
3. Press Enter
4. Wait for product cards to load

**Expected Result**:
- At least one product is displayed in the results
- At least one product name contains the word "juice" (note: Juice Shop searches both name and description, so some results may match on description only)

---

#### TC-UI-R-016: Should persist search query in URL

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Search                             |
| **Story**        | Search query in URL                |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click the search icon in the header
2. Enter `Apple` into the search field
3. Press Enter
4. Wait for product cards to load

**Expected Result**:
The browser URL contains the search query `Apple`.

---

### 18. Sidebar Navigation

**File**: `tests/ui/regression/sidebar.spec.js`
**Suite**: `Sidebar Navigation`
**Preconditions**: Home page is loaded via `homePage` fixture (banners dismissed)

---

#### TC-UI-R-017: Should open sidebar and navigate to About page

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Navigation                         |
| **Story**        | Sidebar to About                   |
| **Preconditions**| User is on Home page               |

**Steps**:
1. Click the hamburger menu button (`button[aria-label="Open Sidenav"]`)
2. Wait for the sidebar to appear
3. Click the "About" link in the sidebar

**Expected Result**:
User is navigated to the About page (`/#/about`). The "About Us" heading is visible.

---

#### TC-UI-R-018: Should navigate to Complaint page from sidebar

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Navigation                         |
| **Story**        | Sidebar to Complaint               |
| **Preconditions**| tempUser logged in via UI          |

**Steps**:
1. Log in as tempUser via UI
2. Click the hamburger menu button
3. Wait for the sidebar to appear
4. Click the "Complaint" link in the sidebar

**Expected Result**:
User is navigated to the Complaint page (`/#/complain`). The message textarea (`#complaintMessage`) is visible.

---

### 19. Score Board

**File**: `tests/ui/regression/scoreBoard.spec.js`
**Suite**: `Score Board`

---

#### TC-UI-R-019: Should display score board with challenges

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Score Board                        |
| **Story**        | View challenges                    |

**Steps**:
1. Navigate directly to the Score Board page (`/#/score-board`)
2. Dismiss all dialogs (Welcome + Cookie banners)

**Expected Result**:
- "Hacking Challenges" progress section is visible
- "Challenges Solved" counter is visible

---

### 20. Deluxe Membership

**File**: `tests/ui/regression/deluxe.spec.js`
**Suite**: `Deluxe Membership`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-R-020: Should display deluxe membership page with pricing

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Deluxe Membership                  |
| **Story**        | View membership page               |
| **Preconditions**| tempUser logged in via UI          |

**Steps**:
1. Log in as tempUser via UI
2. Navigate to the Deluxe Membership page (`/#/deluxe-membership`)

**Expected Result**:
The page body contains the text "deluxe" (case-insensitive), confirming the membership page loaded.

---

### 21. Forgot Password Extended

**File**: `tests/ui/regression/forgotPassword.spec.js`
**Suite**: `Forgot Password Extended`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-R-021: Should show security question after entering email

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Forgot Password                    |
| **Story**        | Security question display          |
| **Preconditions**| tempUser registered with security question |

**Steps**:
1. Navigate to the Forgot Password page (`/#/forgot-password`)
2. Dismiss all dialogs
3. Enter the tempUser's email into the Email field
4. Press Tab to trigger the security question lookup

**Expected Result**:
The Security Answer input field (`#securityAnswer`) becomes visible, indicating the security question was loaded for the entered email.

---

### 22. Order History

**File**: `tests/ui/regression/orderHistory.spec.js`
**Suite**: `Order History`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted after test.

---

#### TC-UI-R-022: Should display order history page for logged-in user

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Order History                      |
| **Story**        | View order history                 |
| **Preconditions**| tempUser logged in via UI          |

**Steps**:
1. Log in as tempUser via UI
2. Navigate to the Order History page (`/#/order-history`)

**Expected Result**:
- The page loads without errors
- The URL contains `order-history`
- The page body content is present (may be empty for new user with no orders)

---

#### TC-UI-R-023: Should increase product quantity in basket

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Basket                             |
| **Story**        | Increase quantity                  |
| **Preconditions**| tempUser with product (ProductId=1, qty=1) in basket |

**Steps**:
1. Add a product (ProductId=1, quantity=1) to tempUser's basket via API
2. Log in as tempUser via UI
3. Navigate to the Basket page (`/#/basket`)
4. Note the initial quantity of the first item
5. Click the increase quantity button for the first item

**Expected Result**:
The quantity of the first item increases by 1 (newQty = initialQty + 1).

---

#### TC-UI-R-024: Should remove product from basket via UI

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Basket                             |
| **Story**        | Remove item                        |
| **Preconditions**| tempUser with product (ProductId=1, qty=1) in basket |

**Steps**:
1. Add a product (ProductId=1, quantity=1) to tempUser's basket via API
2. Log in as tempUser via UI
3. Navigate to the Basket page (`/#/basket`)
4. Click the remove button for the first item

**Expected Result**:
The basket total price shows `0`, confirming the item was removed and the basket is now empty.

---

### 26. Security Questions API

**File**: `tests/api/sanity/securityQuestions.api.spec.js`
**Suite**: `Security Questions API`

---

#### TC-API-S-008: Should return list of security questions

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Security Questions API             |
| **Story**        | Get all questions                  |

**Steps**:
1. Send GET `/api/SecurityQuestions` (no authentication required)

**Expected Result**:
- HTTP status code: `200`
- `data` array has at least one item
- Each item has `id` (number) and `question` (string) properties

---

#### TC-API-S-009: Should return single product by ID

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Products API                       |
| **Story**        | Get product by ID                  |

**Steps**:
1. Send GET `/api/Products/1` with admin auth token

**Expected Result**:
- HTTP status code: `200`
- `data.id` equals `1`
- `data.name` is a non-empty string
- `data.price` is defined
- `data.description` is defined

---

#### TC-API-S-010: Should return 404 for non-existent product

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Products API                       |
| **Story**        | Non-existent product               |

**Steps**:
1. Send GET `/api/Products/99999` with admin auth token

**Expected Result**:
- HTTP status code: `404`

---

#### TC-API-S-011: Should return empty results for non-matching search

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Products API                       |
| **Story**        | Empty search results               |

**Steps**:
1. Send GET `/rest/products/search?q=xyznonexistent12345`

**Expected Result**:
- HTTP status code: `200`
- `data` array is empty (length equals 0)

---

#### TC-API-S-012: Should reject login with empty credentials

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Authentication API                 |
| **Story**        | Empty credentials                  |

**Steps**:
1. Send POST `/rest/user/login` with empty email (`""`) and empty password (`""`)

**Expected Result**:
- HTTP status code: `401`

---

#### TC-API-S-013: Should return token for SQL injection in email

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Authentication API                 |
| **Story**        | SQL injection attempt              |

**Steps**:
1. Send POST `/rest/user/login` with email `' OR 1=1--` and any password

**Expected Result**:
- HTTP status code: `200`
- Response contains `authentication.token`
- **Note**: This documents a known intentional SQL injection vulnerability in OWASP Juice Shop (educational security application)

---

#### TC-API-S-014: Should return user data via authentication details

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Authentication API                 |
| **Story**        | Authentication details             |

**Steps**:
1. Obtain admin JWT token via login
2. Send GET `/rest/user/whoami` with Bearer auth header

**Expected Result**:
- HTTP status code: `200`
- `user.email` is a non-empty string containing `@`

---

#### TC-API-S-015: Should change password via API

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Authentication API                 |
| **Story**        | Change password API                |
| **Preconditions**| tempUser created via fixture       |
| **Cleanup**      | tempUser deleted automatically     |

**Steps**:
1. Send GET `/rest/user/change-password?current=TempUser123!&new=Changed123!&repeat=Changed123!` with tempUser Bearer auth token

**Expected Result**:
- HTTP status code: `200`
- Login with new password (`Changed123!`) succeeds (status 200)
- Login with old password (`TempUser123!`) fails (status 401)

---

### 30. Address API

**File**: `tests/api/regression/address.api.spec.js`
**Suite**: `Address API`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Created addresses are cleaned up in afterEach. Temporary user is automatically deleted.

---

#### TC-API-R-007: Should create a new address

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Address API                        |
| **Story**        | Create address                     |

**Steps**:
1. Send POST `/api/Addresss` with address data (fullName, streetAddress, city, state, zipCode, country from TEST_DATA.address) and tempUser auth token

**Expected Result**:
- HTTP status code: `201`
- `data.fullName` matches the submitted fullName

---

#### TC-API-R-008: Should get all addresses for user

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Address API                        |
| **Story**        | Get addresses                      |

**Steps**:
1. Create an address via API for tempUser
2. Send GET `/api/Addresss` with tempUser auth token

**Expected Result**:
- HTTP status code: `200`
- `data` array has at least one address

---

#### TC-API-R-009: Should delete address by ID

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Address API                        |
| **Story**        | Delete address                     |

**Steps**:
1. Create an address via API for tempUser
2. Send DELETE `/api/Addresss/<id>` with tempUser auth token

**Expected Result**:
- HTTP status code: `200`

---

### 31. Card API

**File**: `tests/api/regression/card.api.spec.js`
**Suite**: `Card API`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Created cards are cleaned up in afterEach. Temporary user is automatically deleted.

---

#### TC-API-R-010: Should create a payment card

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Card API                           |
| **Story**        | Create card                        |

**Steps**:
1. Send POST `/api/Cards` with card data (fullName: "Test User", cardNum: `4111111111111111`, expMonth: 12, expYear: 2099) and tempUser auth token

**Expected Result**:
- HTTP status code: `201`
- `data.fullName` equals `Test User`

---

#### TC-API-R-011: Should delete payment card

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Card API                           |
| **Story**        | Delete card                        |

**Steps**:
1. Create a payment card via API (cardNum: `4222222222222222`)
2. Send DELETE `/api/Cards/<id>` with tempUser auth token

**Expected Result**:
- HTTP status code: `200`

---

### 32. Complaint API

**File**: `tests/api/regression/complaint.api.spec.js`
**Suite**: `Complaint API`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted.

---

#### TC-API-R-012: Should create a complaint

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Complaint API                      |
| **Story**        | Create complaint                   |

**Steps**:
1. Send POST `/api/Complaints` with complaint data (message: `Test complaint <timestamp>`) and tempUser auth token

**Expected Result**:
- HTTP status code: `201`
- `data.message` contains the submitted message text

---

#### TC-API-R-013: Should get all complaints

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Complaint API                      |
| **Story**        | Get complaints                     |

**Steps**:
1. Create a complaint via API for tempUser
2. Send GET `/api/Complaints` with admin auth token

**Expected Result**:
- HTTP status code: `200`
- `data` array has at least one complaint

---

### 33. Product Reviews API

**File**: `tests/api/regression/reviews.api.spec.js`
**Suite**: `Product Reviews API`
**Preconditions**: Temporary user created via API (`tempUser` fixture).
**Cleanup**: Temporary user is automatically deleted.

---

#### TC-API-R-014: Should get reviews for a product

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Product Reviews API                |
| **Story**        | Get reviews                        |

**Steps**:
1. Send GET `/rest/products/1/reviews`

**Expected Result**:
- HTTP status code: `200`
- Response body is an array (may be empty or have existing reviews)

---

#### TC-API-R-015: Should add a review to a product

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Product Reviews API                |
| **Story**        | Create review                      |

**Steps**:
1. Send PUT `/rest/products/1/reviews` with review data (message: `API review <timestamp>`, author: tempUser email) and tempUser auth token

**Expected Result**:
- HTTP status code: `201`

---

#### TC-API-R-016: Should update basket item quantity

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Basket API                         |
| **Story**        | Update quantity                    |

**Steps**:
1. Add a product (ProductId=1, quantity=1) to tempUser's basket via API
2. Send PUT `/api/BasketItems/<id>` with `{ quantity: 5 }` and tempUser auth token

**Expected Result**:
- HTTP status code: `200`
- `data.quantity` equals `5`

---

#### TC-API-R-017: Should not access another user basket (IDOR vulnerability)

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Critical                           |
| **Feature**      | Basket API                         |
| **Story**        | Authorization check                |

**Steps**:
1. Create a second temporary user via API
2. Send GET `/rest/basket/<secondUser.basketId>` with first tempUser's auth token

**Expected Result**:
- HTTP status code: `200`
- **Note**: This documents a known IDOR (Insecure Direct Object Reference) vulnerability in Juice Shop — users CAN access other users' baskets. In a real application, this should return `403`.

---

#### TC-API-R-018: Should reject adding item with non-existent product

| Field            | Value                              |
|------------------|------------------------------------|
| **Severity**     | Normal                             |
| **Feature**      | Basket API                         |
| **Story**        | Invalid product                    |

**Steps**:
1. Send POST `/api/BasketItems` with `{ BasketId: <basketId>, ProductId: 99999, quantity: 1 }` and tempUser auth token

**Expected Result**:
- HTTP status code is NOT `200` or `201` (expected `400` or `500` — server rejects the invalid product)

---

## Summary by Suite

| Suite                  | Package              | Tests | Active | Skipped | Critical | Normal | Blocker |
|------------------------|----------------------|-------|--------|---------|----------|--------|---------|
| Login Page             | `ui/sanity`          | 3     | 3      | —       | 2        | 1      | —       |
| Registration Page      | `ui/sanity`          | 3     | 3      | —       | 1        | 2      | —       |
| Navigation             | `ui/sanity`          | 2     | 2      | —       | 1        | 1      | —       |
| Search                 | `ui/sanity`          | 2     | 2      | —       | 1        | 1      | —       |
| About Us               | `ui/sanity`          | 1     | 1      | —       | —        | 1      | —       |
| Pagination             | `ui/sanity`          | 2     | 2      | —       | 1        | 1      | —       |
| User Profile           | `ui/sanity`          | 2     | 2      | —       | —        | 2      | —       |
| Complaint              | `ui/sanity`          | 1     | 1      | —       | —        | 1      | —       |
| Forgot Password        | `ui/sanity`          | 2     | —      | 2       | 1        | 1      | —       |
| Change Password        | `ui/regression`      | 3     | 3      | —       | 1        | 2      | —       |
| Product Review         | `ui/regression`      | 2     | 2      | —       | —        | 2      | —       |
| Customer Feedback      | `ui/regression`      | 2     | 2      | —       | 1        | 1      | —       |
| Administration Panel   | `ui/regression`      | 2     | 2      | —       | 1        | 1      | —       |
| Basket Page            | `ui/regression`      | 4     | 4      | —       | 1        | 3      | —       |
| Checkout Flow          | `ui/regression`      | 1     | 1      | —       | 1        | —      | —       |
| Product Detail         | `ui/regression`      | 2     | 2      | —       | —        | 2      | —       |
| Search Extended        | `ui/regression`      | 2     | 2      | —       | —        | 2      | —       |
| Sidebar Navigation     | `ui/regression`      | 2     | 2      | —       | —        | 2      | —       |
| Score Board            | `ui/regression`      | 1     | 1      | —       | —        | 1      | —       |
| Deluxe Membership      | `ui/regression`      | 1     | 1      | —       | —        | 1      | —       |
| Forgot Password Ext.   | `ui/regression`      | 1     | 1      | —       | —        | 1      | —       |
| Order History          | `ui/regression`      | 1     | 1      | —       | —        | 1      | —       |
| Auth API               | `api/sanity`         | 7     | 7      | —       | 3        | 3      | 1       |
| Products API           | `api/sanity`         | 5     | 5      | —       | 2        | 3      | —       |
| Users API              | `api/sanity`         | 2     | 2      | —       | 1        | 1      | —       |
| Security Questions API | `api/sanity`         | 1     | 1      | —       | 1        | —      | —       |
| Feedback API           | `api/regression`     | 2     | 2      | —       | 1        | 1      | —       |
| Basket API             | `api/regression`     | 5     | 5      | —       | 3        | 2      | —       |
| Orders API             | `api/regression`     | 2     | 2      | —       | 1        | 1      | —       |
| Address API            | `api/regression`     | 3     | 3      | —       | 1        | 2      | —       |
| Card API               | `api/regression`     | 2     | 2      | —       | 1        | 1      | —       |
| Complaint API          | `api/regression`     | 2     | 2      | —       | —        | 2      | —       |
| Product Reviews API    | `api/regression`     | 2     | 2      | —       | 1        | 1      | —       |
| **Total**              |                      | **73**| **71** | **2**   | **27**   | **45** | **1**   |
