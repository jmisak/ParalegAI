# Testing Strategy for IRONCLAD

## Overview

IRONCLAD follows a comprehensive testing strategy to ensure reliability, security, and maintainability of the AI-powered paralegal assistant platform.

## Testing Pyramid

```
         /\
        /E2E\         - Critical user flows
       /------\       - Browser automation
      /        \
     / Integration\   - API endpoints
    /------------\    - Database interactions
   /              \
  /  Unit Tests    \  - Business logic
 /------------------\ - Pure functions
```

## Coverage Targets

### Minimum Requirements
- **Unit Tests**: 80% coverage (lines, branches, functions, statements)
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user paths (login, create matter, upload document)

### Priority Areas (90%+ coverage required)
- Authentication and authorization
- Multi-tenant isolation logic
- AI prompt sanitization
- Financial calculations (billing, trust accounting)
- Document generation

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions and components in isolation.

**Tools**:
- Backend: Jest + ts-jest
- Frontend: Vitest + Testing Library

**What to Test**:
- Business logic in services
- Validation functions
- Utility functions
- React component rendering and interactions
- Custom hooks

**What NOT to Test**:
- Third-party libraries
- Simple getters/setters
- Type definitions
- Mock implementations

**Example**:
```typescript
// Good
it('should calculate closing costs correctly', () => {
  const result = calculateClosingCosts(300000, 'IL');
  expect(result.total).toBe(9450);
});

// Bad (testing implementation details)
it('should call Math.round', () => {
  const spy = jest.spyOn(Math, 'round');
  calculateClosingCosts(300000, 'IL');
  expect(spy).toHaveBeenCalled();
});
```

### 2. Integration Tests (E2E API)

**Purpose**: Test complete request/response cycles with database.

**Tools**: Jest + Supertest + Test Database

**What to Test**:
- API endpoint behavior
- Request validation
- Error handling
- Database transactions
- Multi-tenant isolation
- Authentication/authorization flows

**Setup**:
```typescript
beforeAll(async () => {
  // Initialize test database
  await prisma.$connect();
  await seedTestData();
});

afterEach(async () => {
  // Clean up after each test
  await prisma.matter.deleteMany();
});
```

### 3. Component Tests

**Purpose**: Test React components with user interactions.

**Tools**: Vitest + Testing Library + MSW

**What to Test**:
- Component renders correctly
- User interactions (clicks, typing)
- Conditional rendering
- Props handling
- State management
- API integration (with mocks)

**Best Practices**:
```typescript
// Test user behavior, not implementation
it('should show error when login fails', async () => {
  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
});
```

### 4. E2E Browser Tests

**Purpose**: Test complete user workflows in real browser.

**Tools**: Playwright

**What to Test**:
- Critical user paths
- Multi-step workflows
- Cross-browser compatibility
- Responsive design
- Accessibility

**Example Flows**:
1. User Registration → Email Verification → Login
2. Create Matter → Upload Documents → Generate Contract
3. Search → Filter → Export Results

### 5. Visual Regression Tests

**Purpose**: Detect unintended UI changes.

**Tools**: Playwright (screenshot comparison)

**When to Use**:
- Component library changes
- Layout modifications
- Responsive design updates

## Test Organization

### Backend (`apps/api/test/`)

```
test/
├── setup.ts                 # Global test setup
├── setup.e2e.ts            # E2E-specific setup
├── factories/              # Test data builders
│   ├── user.factory.ts
│   ├── matter.factory.ts
│   └── organization.factory.ts
├── fixtures/               # Static test data
│   ├── users.fixture.ts
│   └── matters.fixture.ts
├── mocks/                  # Mock implementations
│   ├── prisma.mock.ts
│   ├── redis.mock.ts
│   └── jwt.mock.ts
├── unit/                   # Unit tests
│   ├── auth.service.spec.ts
│   └── matter.service.spec.ts
└── e2e/                    # E2E API tests
    ├── auth.e2e-spec.ts
    └── matter.e2e-spec.ts
```

### Frontend (`apps/web/tests/`)

```
tests/
├── setup.ts                # Vitest setup
├── mocks/                  # MSW handlers
│   ├── handlers.ts
│   ├── server.ts
│   └── browser.ts
├── components/             # Component tests
│   ├── Button.test.tsx
│   └── MatterCard.test.tsx
└── e2e/                    # Playwright tests
    ├── login.spec.ts
    └── matter-flow.spec.ts
```

## Naming Conventions

- **Unit tests**: `*.spec.ts` or `*.test.ts`
- **E2E API tests**: `*.e2e-spec.ts`
- **E2E Browser tests**: `*.spec.ts` (in `/e2e` folder)
- **Test suites**: Use `describe()` blocks for grouping
- **Test cases**: Use `it()` or `test()` with clear descriptions

## Running Tests

### Development
```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# Specific file
pnpm test auth.service.spec.ts
```

### CI/CD Pipeline
```bash
# Pre-commit hook
pnpm test:changed

# Pull request
pnpm test:coverage
pnpm test:e2e

# Main branch
pnpm test:coverage
pnpm test:e2e
pnpm test:visual
```

## Mock Data Strategy

### Use Factories for Dynamic Data
```typescript
// Good
const user = UserFactory.build({ role: 'ATTORNEY' });

// Bad (brittle, hard to maintain)
const user = {
  id: '123',
  email: 'test@example.com',
  // ... 20 more fields
};
```

### Use Fixtures for Consistent Scenarios
```typescript
// E2E tests use fixtures for predictable data
import { FIXTURE_USERS } from '@test/fixtures';

it('should login as paralegal', () => {
  login(FIXTURE_USERS.paralegal.email, FIXTURE_PASSWORDS.default);
});
```

## Mocking External Services

### Database (Unit Tests)
```typescript
const mockPrisma = new MockPrismaService();
mockPrisma.user.findUnique.mockResolvedValue(mockUser);
```

### API Calls (Component Tests)
```typescript
// MSW automatically intercepts fetch calls
server.use(
  http.get('/api/matters', () => {
    return HttpResponse.json([mockMatter1, mockMatter2]);
  })
);
```

### Time/Dates
```typescript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-01-01'));
});
```

## Security Testing

### Critical Areas
1. **SQL Injection**: Test with malicious input
2. **XSS**: Test with script tags in user input
3. **CSRF**: Verify token validation
4. **Prompt Injection**: Test AI input sanitization
5. **Multi-tenant Isolation**: Verify data separation

### Example
```typescript
it('should prevent SQL injection in search', async () => {
  const malicious = "'; DROP TABLE users; --";

  await request(app)
    .get(`/matters?search=${encodeURIComponent(malicious)}`)
    .set('Authorization', token)
    .expect(200);

  // Verify users table still exists
  const users = await prisma.user.findMany();
  expect(users.length).toBeGreaterThan(0);
});
```

## Performance Testing

### Load Testing (Future)
- Use Artillery or k6
- Test API endpoints under load
- Target: 1000 concurrent users
- Response time: < 200ms (p95)

### Database Query Performance
```typescript
it('should fetch matters efficiently', async () => {
  // Seed 10,000 matters
  await seedManyMatters(10000);

  const start = Date.now();
  const result = await service.findAll(orgId, { page: 1, limit: 50 });
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(100); // 100ms
  expect(result.length).toBe(50);
});
```

## Continuous Improvement

### Code Review Checklist
- [ ] New features have tests
- [ ] Tests cover happy path and edge cases
- [ ] Tests are readable and maintainable
- [ ] No test skipping without JIRA ticket
- [ ] Coverage meets minimum thresholds

### Metrics to Track
- Code coverage trends
- Test execution time
- Flaky test rate
- Bug escape rate (bugs found in production)

## References

- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
