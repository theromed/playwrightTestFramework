import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }      from 'allure-playwright';

test.describe('Complaint API', () => {

  test('Should create a complaint', async ({ complaintAPI, tempUser }) => {
    await allure.severity('normal');
    await allure.feature('Complaint API');
    await allure.story('Create complaint');

    // Arrange
    const complaintData = { message: `API complaint ${Date.now()}` };

    // Act
    const { status, body } = await complaintAPI.create(complaintData, tempUser.token);

    // Assert
    expect(status).toBe(201);
    expect(body.data.message).toBe(complaintData.message);
    expect(body.data.UserId).toBeDefined();
  });

  test('Should get all complaints', async ({ complaintAPI, tempUser, authToken }) => {
    await allure.severity('normal');
    await allure.feature('Complaint API');
    await allure.story('Get complaints');

    // Arrange — create a complaint first
    await complaintAPI.create({ message: `List test ${Date.now()}` }, tempUser.token);

    // Act — use admin token to get all complaints
    const { status, body } = await complaintAPI.getAll(authToken);

    // Assert
    expect(status).toBe(200);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });
});
