# Testing Documentation

## Overview

This backend project includes a comprehensive test suite using Jest and Supertest.

## Test Coverage

### Current Test Suite (26 tests)

#### Unit Tests
- **Error Handling** (7 tests)
  - AppError class functionality
  - Error message handling
  - Status code handling
  - Stack traces

- **Middlewares** (12 tests)
  - Context middleware (x-workspace-id, x-user-id header validation)
  - Error handler (Zod validation errors, AppError, generic errors)

#### Integration Tests
- **App-level** (7 tests)
  - Health check endpoint
  - CORS configuration
  - Security headers (Helmet)
  - Rate limiting
  - Context middleware integration
  - 404 handling
  - Request body parsing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Results

```
Test Suites: 4 passed, 4 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        ~5s
```

## Coverage Report Summary

- **Errors**: 100% coverage
- **Middlewares**: 100% coverage
- **Routes**: 100% coverage
- **Validation**: 100% coverage
- **Entities**: 91% coverage

## Test Structure

```
src/__tests__/
├── setup.ts                           # Global test configuration
├── README.md                          # Test documentation
├── mocks/
│   └── database.mock.ts              # Mock data and repository factories
├── utils/
│   └── test-helpers.ts               # Test utility functions
├── unit/
│   ├── errors/
│   │   └── AppError.test.ts         # Error class tests
│   └── middlewares/
│       ├── context.test.ts          # Context middleware tests
│       └── error-handler.test.ts    # Error handler tests
└── integration/
    └── app.test.ts                   # App-level integration tests
```

## Adding New Tests

### For Controllers/Routes

Create a new test file in `src/__tests__/integration/routes/`:

```typescript
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';

describe('Your Route', () => {
  const baseUrl = '/api/v1/your-route';
  const headers = {
    'x-workspace-id': 'workspace-123',
    'x-user-id': 'user-123',
  };

  it('should test endpoint', async () => {
    const response = await request(app)
      .get(baseUrl)
      .set(headers);

    expect(response.status).toBe(200);
  });
});
```

### For Services

Create a new test file in `src/__tests__/unit/services/`:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { yourService } from '../../../services/your.service.js';

describe('Your Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test service function', async () => {
    // Test implementation
  });
});
```

### For Middlewares

Create a new test file in `src/__tests__/unit/middlewares/`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { yourMiddleware } from '../../../middlewares/your.middleware.js';
import { createMockRequest, createMockResponse, createMockNext } from '../../utils/test-helpers.js';

describe('Your Middleware', () => {
  it('should test middleware behavior', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    yourMiddleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });
});
```

## CI/CD Integration

Add this to your CI pipeline:

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clear naming**: Test names should describe what they test
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock external dependencies**: Don't hit real databases/APIs
5. **Clean up**: Use beforeEach/afterEach for cleanup

## Future Enhancements

- Add E2E tests with real database
- Add performance tests
- Add load testing with Artillery or k6
- Increase service layer coverage with better ESM mocking
- Add contract tests for API endpoints
