import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }      from 'allure-playwright';
import { TEST_DATA }   from '../../../config/testData.js';

test.describe('Address API', () => {
  const createdIds = [];

  test.afterEach(async ({ addressAPI, tempUser }) => {
    for (const id of createdIds) {
      try {
        await addressAPI.deleteById(id, tempUser.token);
      } catch {
        // Already deleted — fine
      }
    }
    createdIds.length = 0;
  });

  test('Should create a new address', async ({ addressAPI, tempUser }) => {
    await allure.severity('critical');
    await allure.feature('Address API');
    await allure.story('Create address');

    // Arrange
    const addressData = {
      fullName: TEST_DATA.address.name,
      streetAddress: TEST_DATA.address.address,
      city: TEST_DATA.address.city,
      state: TEST_DATA.address.state,
      country: TEST_DATA.address.country,
      zipCode: TEST_DATA.address.zipCode,
      mobileNum: Number(TEST_DATA.address.mobileNumber),
    };

    // Act
    const { status, body } = await addressAPI.create(addressData, tempUser.token);
    createdIds.push(body.data.id);

    // Assert
    expect(status).toBe(201);
    expect(body.data.fullName).toBe(addressData.fullName);
    expect(body.data.id).toBeDefined();
  });

  test('Should get all addresses for user', async ({ addressAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Address API');
    await allure.story('Get addresses');

    // Arrange — create an address first
    const addressData = {
      fullName: 'GetAll Test',
      streetAddress: 'Street 1',
      city: 'City',
      state: 'State',
      country: 'Country',
      zipCode: '12345',
      mobileNum: 9876543210,
    };
    const { body: created } = await addressAPI.create(addressData, tempUser.token);
    createdIds.push(created.data.id);

    // Act
    const { status, body } = await addressAPI.getAll(tempUser.token);

    // Assert
    expect(status).toBe(200);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('Should delete address by ID', async ({ addressAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Address API');
    await allure.story('Delete address');

    // Arrange — create address to delete
    const { body: created } = await addressAPI.create(
      { fullName: 'Delete Me', streetAddress: 'S', city: 'C', state: 'S', country: 'C', zipCode: '00000', mobileNum: 1111111111 },
      tempUser.token
    );

    // Act
    const { status } = await addressAPI.deleteById(created.data.id, tempUser.token);

    // Assert
    expect(status).toBe(200);
  });
});
