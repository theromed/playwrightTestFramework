import { test, expect }    from '../../../fixtures/base.fixture.js';
import { allure }          from 'allure-playwright';
import { validateSchema }  from '../../../utils/schemaValidator.js';
import { ENV }             from '../../../config/env.js';
import userSchema          from '../../../helpers/api/schemas/user.schema.json' with { type: 'json' };

test.describe('Users API', () => {
  const createdUserIds = [];
  let adminToken;

  test.beforeAll(async ({ request }) => {
    const { AuthAPI } = await import('../../../helpers/api/requests/auth.api.js');
    const authAPI = new AuthAPI(request);
    const { body } = await authAPI.login(ENV.adminEmail, ENV.adminPassword);
    adminToken = body.authentication.token;
  });

  // Cleanup
  test.afterEach(async ({ request }) => {
    const { UsersAPI } = await import('../../../helpers/api/requests/users.api.js');
    const usersAPI = new UsersAPI(request);
    for (const userId of createdUserIds) {
      try {
        await usersAPI.deleteById(userId, adminToken);
      } catch (error) {
        console.warn('Cleanup failed for user:', userId, error.message);
      }
    }
    createdUserIds.length = 0;
  });

  test('Should register a new user', async ({ usersAPI }) => {
    await allure.severity('critical');
    await allure.feature('Users API');
    await allure.story('Register user');

    // Arrange
    const email = `api-user-${Date.now()}@juice-sh.op`;
    const password = 'ApiTest123!';

    // Act
    const { status, body } = await usersAPI.register(email, password);
    createdUserIds.push(body.data.id);

    // Assert
    expect(status).toBe(201);
    expect(body.data.email).toBe(email);
    await validateSchema(body, userSchema, 'UserResponse');
  });

  test('Should return 400 for duplicate email', async ({ usersAPI }) => {
    await allure.severity('normal');
    await allure.feature('Users API');
    await allure.story('Duplicate email');

    // Arrange — создаём пользователя
    const email = `api-dup-${Date.now()}@juice-sh.op`;
    const password = 'ApiTest123!';
    const { body } = await usersAPI.register(email, password);
    createdUserIds.push(body.data.id);

    // Act — повторная регистрация с тем же email
    const duplicate = await usersAPI.register(email, password);

    // Assert
    expect(duplicate.status).toBe(400);
  });
});
