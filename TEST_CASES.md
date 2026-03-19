# OWASP Juice Shop — Test Cases

> **Total: 35 test cases** across 16 spec files
> **Framework**: Playwright + Allure
> **Pattern**: AAA (Arrange-Act-Assert)
> **Last updated**: 2026-03-18

---

## Table of Contents

- [UI Sanity Tests (10)](#ui-sanity-tests)
  - [Login Page (3)](#1-login-page)
  - [Registration Page (3)](#2-registration-page)
  - [Navigation (2)](#3-navigation)
  - [Search (2)](#4-search)
- [UI Regression Tests (12)](#ui-regression-tests)
  - [Change Password (3)](#5-change-password)
  - [Product Review (2)](#6-product-review)
  - [Customer Feedback (2)](#7-customer-feedback)
  - [Administration Panel (2)](#8-administration-panel)
  - [Basket Page (2)](#9-basket-page)
  - [Checkout Flow (1)](#10-checkout-flow)
- [API Sanity Tests (7)](#api-sanity-tests)
  - [Auth API (3)](#11-auth-api)
  - [Products API (2)](#12-products-api)
  - [Users API (2)](#13-users-api)
- [API Regression Tests (6)](#api-regression-tests)
  - [Feedback API (2)](#14-feedback-api)
  - [Basket API (2)](#15-basket-api)
  - [Orders API (2)](#16-orders-api)

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

### 5. Change Password

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

### 6. Product Review

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

### 7. Customer Feedback

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

### 8. Administration Panel

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

### 9. Basket Page

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

### 10. Checkout Flow

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

### 11. Auth API

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

### 12. Products API

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

### 13. Users API

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

### 14. Feedback API

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

### 15. Basket API

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

### 16. Orders API

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

## Summary by Suite

| Suite                  | Package              | Tests | Critical | Normal | Blocker |
|------------------------|----------------------|-------|----------|--------|---------|
| Login Page             | `ui/sanity`          | 3     | 2        | 1      | —       |
| Registration Page      | `ui/sanity`          | 3     | 1        | 2      | —       |
| Navigation             | `ui/sanity`          | 2     | 1        | 1      | —       |
| Search                 | `ui/sanity`          | 2     | 1        | 1      | —       |
| Change Password        | `ui/regression`      | 3     | 1        | 2      | —       |
| Product Review         | `ui/regression`      | 2     | —        | 2      | —       |
| Customer Feedback      | `ui/regression`      | 2     | 1        | 1      | —       |
| Administration Panel   | `ui/regression`      | 2     | 1        | 1      | —       |
| Basket Page            | `ui/regression`      | 2     | 1        | 1      | —       |
| Checkout Flow          | `ui/regression`      | 1     | 1        | —      | —       |
| Auth API               | `api/sanity`         | 3     | 1        | 1      | 1       |
| Products API           | `api/sanity`         | 2     | 2        | —      | —       |
| Users API              | `api/sanity`         | 2     | 1        | 1      | —       |
| Feedback API           | `api/regression`     | 2     | 1        | 1      | —       |
| Basket API             | `api/regression`     | 2     | 2        | —      | —       |
| Orders API             | `api/regression`     | 2     | 1        | 1      | —       |
| **Total**              |                      | **35**| **18**   | **16** | **1**   |
