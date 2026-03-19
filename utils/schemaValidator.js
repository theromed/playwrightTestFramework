import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { allure } from 'allure-playwright';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export async function validateSchema(data, schema, schemaName = 'Response') {
  return await allure.step(`Validate schema: ${schemaName}`, async () => {
    const validate = ajv.compile(schema);
    const isValid = validate(data);

    if (!isValid) {
      const errors = JSON.stringify(validate.errors, null, 2);
      await allure.attachment(`Schema Errors: ${schemaName}`, errors, 'application/json');
      throw new Error(`Schema validation failed for ${schemaName}: ${errors}`);
    }

    return true;
  });
}
