import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  baseUrl:  process.env.BASE_URL  || 'http://localhost:3000',
  apiUrl:   process.env.API_URL   || 'http://localhost:3000',
  headless: process.env.HEADLESS !== 'false',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Credentials
  adminEmail:    process.env.ADMIN_EMAIL    || 'admin@juice-sh.op',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  testUserEmail:    process.env.TEST_USER_EMAIL,
  testUserPassword: process.env.TEST_USER_PASSWORD,
};
