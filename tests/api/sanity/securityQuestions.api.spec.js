import { test, expect } from '../../../fixtures/base.fixture.js';
import { allure }      from 'allure-playwright';

test.describe('Security Questions API', () => {

  test('Should return list of security questions', async ({ securityQuestionsAPI }) => {
    await allure.severity('critical');
    await allure.feature('Security Questions API');
    await allure.story('Get all questions');

    // Act
    const { status, body } = await securityQuestionsAPI.getAll();

    // Assert
    expect(status).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('question');
    expect(typeof body.data[0].id).toBe('number');
    expect(typeof body.data[0].question).toBe('string');
  });
});
