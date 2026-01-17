# Test Suite Documentation

This directory contains the test suite for the Analytics Dashboard Backend.

## Test Structure

```
src/__tests__/
├── setup.ts                    # Test configuration and global setup
├── mocks/                      # Mock data and database mocks
│   └── database.mock.ts
├── utils/                      # Test utilities and helpers
│   └── test-helpers.ts
├── unit/                       # Unit tests
│   ├── errors/                 # Error class tests
│   ├── middlewares/            # Middleware tests
│   └── services/               # Service layer tests
└── integration/                # Integration tests
    ├── app.test.ts             # App-level tests (health, middleware, security)
    └── routes/                 # API route tests
        ├── user.routes.test.ts
        ├── company.routes.test.ts
        └── bootstrap.routes.test.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

## Test Categories

### Unit Tests
Unit tests test individual components in isolation:
- **Middlewares**: Context middleware, error handler
- **Services**: Business logic functions (with mocked repositories)
- **Errors**: Custom error classes

### Integration Tests
Integration tests test the full request/response cycle:
- **App-level**: Health checks, CORS, security headers, rate limiting
- **Routes**: API endpoint behavior (with mocked services)

## Mocking Strategy

Due to ESM module constraints, the current test suite uses:
1. **Direct mocking** for simple cases (middlewares, errors)
2. **Service-level mocking** for integration tests (requires manual mock setup)
3. **Database mocks** provided in `mocks/database.mock.ts`

## Note on Service Tests

Service tests that require TypeORM repository mocking are included but may need
database connection mocking adjustments for full ESM compatibility. These tests
demonstrate the expected behavior and can be run with a test database.

## Adding New Tests

### For a new route:
1. Create a new file in `integration/routes/`
2. Mock the service layer
3. Test all route endpoints

### For a new service:
1. Create a new file in `unit/services/`
2. Mock the repository layer
3. Test all service functions

### For a new middleware:
1. Create a new file in `unit/middlewares/`
2. Use test helpers from `utils/test-helpers.ts`
3. Test success and error cases

## Coverage Goals

Aim for:
- **80%+ coverage** for business logic (services, controllers)
- **90%+ coverage** for middleware and utilities
- **100% coverage** for error handlers

## Test Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **One assertion per test**: Keep tests focused
3. **Descriptive names**: Test names should explain what they test
4. **Clean up**: Use beforeEach/afterEach for cleanup
5. **Mock external dependencies**: Don't hit real databases/APIs in unit tests
