import { test, expect }    from '../../../fixtures/base.fixture.js';
import { allure }          from 'allure-playwright';
import { validateSchema }  from '../../../utils/schemaValidator.js';
import productSchema       from '../../../helpers/api/schemas/product.schema.json' with { type: 'json' };

test.describe('Products API', () => {

  test('Should return list of all products', async ({ productsAPI, authToken }) => {
    await allure.severity('critical');
    await allure.feature('Products API');
    await allure.story('Get all products');

    // Act
    const { status, body } = await productsAPI.getAll(authToken);

    // Assert
    expect(status).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);
    await validateSchema(body, productSchema, 'ProductsResponse');
  });

  test('Should return products matching search query', async ({ productsAPI }) => {
    await allure.severity('critical');
    await allure.feature('Products API');
    await allure.story('Search products');

    // Arrange
    const query = 'juice';

    // Act
    const { status, body } = await productsAPI.search(query);

    // Assert
    expect(status).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].name.toLowerCase()).toContain('juice');
  });
});
