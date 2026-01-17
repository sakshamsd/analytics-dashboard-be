// Test setup file
import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
process.env.PORT = '4001';
process.env.CORS_ORIGIN = '*';

// Global test timeout
jest.setTimeout(10000);

// Mock console.error to reduce noise in test output
global.console.error = jest.fn();
global.console.log = jest.fn();

// Clean up after each test
afterEach(() => {
	jest.clearAllMocks();
});
