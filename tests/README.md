# Tests

## Directory Structure

```
tests/
├── unit/           # Unit tests for individual functions, utilities, validations
├── integration/    # Integration tests for API routes, database operations
└── e2e/            # End-to-end tests for full user flows (Playwright)
```

## Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Conventions

- Test files follow the pattern `<module>.test.ts` or `<module>.spec.ts`
- Unit tests should not require database or network access
- Integration tests may use a test database
- E2E tests run against the full application with Playwright
