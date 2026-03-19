export const TEST_DATA = {
  validUser: {
    email: 'test-user@juice-sh.op',
    password: 'testPassword123!',
    securityAnswer: 'SecurityAnswer',
  },

  adminUser: {
    email: 'admin@juice-sh.op',
    password: 'admin123',
  },

  newUser: {
    email: `user-${Date.now()}@juice-sh.op`,
    password: 'NewUser123!',
    passwordRepeat: 'NewUser123!',
    securityQuestionId: 1,
    securityAnswer: 'Green',
  },

  feedback: {
    comment: 'Great juice shop! Highly recommended.',
    rating: 5,
  },

  products: {
    appleJuice: 'Apple Juice (1000ml)',
    orangeJuice: 'Orange Juice (1000ml)',
    searchTerm: 'juice',
  },

  address: {
    country: 'Poland',
    name: 'Test User',
    mobileNumber: '1234567890',
    zipCode: '00-001',
    address: 'Test Street 1',
    city: 'Warsaw',
    state: 'Mazovia',
  },
};
