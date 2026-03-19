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
});
