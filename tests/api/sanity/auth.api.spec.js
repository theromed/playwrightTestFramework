import { test, expect }    from '../../../fixtures/base.fixture.js';
import { allure }          from 'allure-playwright';
import { validateSchema }  from '../../../utils/schemaValidator.js';
import { TEST_DATA }       from '../../../config/testData.js';
import loginSchema         from '../../../helpers/api/schemas/login.schema.json' with { type: 'json' };

test.describe('Auth API', () => {

  test('Should return JWT token on valid login', async ({ authAPI }) => {
    await allure.severity('blocker');
    await allure.feature('Authentication API');
    await allure.story('Valid login');

    // Arrange
    const { email, password } = TEST_DATA.adminUser;

    // Act
    const { status, body } = await authAPI.login(email, password);

    // Assert
    expect(status).toBe(200);
    expect(body.authentication.token).toBeTruthy();
    await validateSchema(body, loginSchema, 'LoginResponse');
  });

  test('Should return 401 on invalid credentials', async ({ authAPI }) => {
    await allure.severity('critical');
    await allure.feature('Authentication API');
    await allure.story('Invalid credentials');

    // Arrange & Act
    const { status } = await authAPI.login('invalid@email.com', 'wrong');

    // Assert
    expect(status).toBe(401);
  });

  test('Should return user info via whoami', async ({ authAPI, authToken }) => {
    await allure.severity('normal');
    await allure.feature('Authentication API');
    await allure.story('WhoAmI');

    // Act
    const { status, body } = await authAPI.whoAmI(authToken);

    // Assert
    expect(status).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBeTruthy();
  });

  test('Should reject login with empty credentials', async ({ authAPI }) => {
    await allure.severity('normal');
    await allure.feature('Authentication API');
    await allure.story('Empty credentials');

    // Act
    const { status } = await authAPI.login('', '');

    // Assert
    expect(status).toBe(401);
  });

  test('Should return token for SQL injection in email', async ({ authAPI }) => {
    await allure.severity('critical');
    await allure.feature('Authentication API');
    await allure.story('SQL injection attempt');

    // NOTE: Juice Shop is intentionally vulnerable — SQL injection IS a valid login
    // This test documents the known vulnerability

    // Act
    const { status, body } = await authAPI.login("' OR 1=1--", 'anything');

    // Assert
    expect(status).toBe(200);
    expect(body.authentication.token).toBeTruthy();
  });

  test('Should return user data via authentication details', async ({ authAPI, authToken }) => {
    await allure.severity('normal');
    await allure.feature('Authentication API');
    await allure.story('Authentication details');

    // Act
    const { status, body } = await authAPI.whoAmI(authToken);

    // Assert
    expect(status).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.user.email).toContain('@');
  });

  test('Should change password via API', async ({ authAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Authentication API');
    await allure.story('Change password API');

    // Arrange
    const newPassword = 'Changed123!';

    // Act
    const { status } = await authAPI.changePassword(
      tempUser.password, newPassword, newPassword, tempUser.token
    );

    // Assert
    expect(status).toBe(200);

    // Verify new password works
    const loginResult = await authAPI.login(tempUser.email, newPassword);
    expect(loginResult.status).toBe(200);
    expect(loginResult.body.authentication.token).toBeTruthy();
  });
});
