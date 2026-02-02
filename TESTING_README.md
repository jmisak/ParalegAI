# IRONCLAD Testing Infrastructure

## Quick Start

### Running Tests

```bash
# Run all tests
pnpm test

# Run only unit tests
pnpm test:unit

# Run with coverage report
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Watch mode for development
pnpm test:watch

# Run API E2E tests only
pnpm test:e2e:api

# Run Web E2E tests only
pnpm test:e2e:web

# Run tests for changed files (CI)
pnpm test:changed

# Run full CI test suite
pnpm test:ci
```

### Project Structure

```
G:/apps/IronClad/
├── apps/
│   ├── api/                         # NestJS Backend
│   │   ├── jest.config.js           # Unit test configuration
│   │   ├── jest.e2e.config.js       # E2E API test configuration
│   │   └── test/
│   │       ├── setup.ts             # Unit test setup
│   │       ├── setup.e2e.ts         # E2E test setup
│   │       ├── factories/           # Test data builders
│   │       │   ├── user.factory.ts
│   │       │   ├── matter.factory.ts
│   │       │   └── organization.factory.ts
│   │       ├── fixtures/            # Static test data
│   │       │   ├── users.fixture.ts
│   │       │   └── matters.fixture.ts
│   │       ├── mocks/               # Service mocks
│   │       │   ├── prisma.mock.ts
│   │       │   ├── redis.mock.ts
│   │       │   └── jwt.mock.ts
│   │       ├── unit/                # Unit tests
│   │       │   ├── auth.service.spec.ts
│   │       │   └── matter.service.spec.ts
│   │       └── e2e/                 # E2E API tests
│   │           ├── auth.e2e-spec.ts
│   │           └── matter.e2e-spec.ts
│   │
│   └── web/                         # Next.js Frontend
│       ├── vitest.config.ts         # Component test config
│       ├── playwright.config.ts     # E2E browser test config
│       └── tests/
│           ├── setup.ts             # Vitest setup
│           ├── mocks/               # MSW API mocks
│           │   ├── handlers.ts
│           │   ├── server.ts
│           │   └── browser.ts
│           ├── components/          # Component tests
│           │   ├── Button.test.tsx
│           │   └── MatterCard.test.tsx
│           └── e2e/                 # Playwright tests
│               ├── login.spec.ts
│               └── matter-flow.spec.ts
│
├── packages/
│   └── shared/
│       └── test/                    # Shared test utilities
│           ├── test-utils.ts
│           ├── mock-data.ts
│           └── api-mock.ts
│
├── docs/
│   ├── testing-strategy.md          # Comprehensive strategy guide
│   └── test-data-guide.md           # Test data best practices
│
└── package.json                     # Root test scripts
```

## Test Coverage Targets

### Minimum Requirements (80%)
- Lines: 80%
- Branches: 80%
- Functions: 80%
- Statements: 80%

### Critical Areas (90%+)
- Authentication and authorization
- Multi-tenant isolation
- AI prompt sanitization
- Financial calculations
- Document generation

## Test Types

### 1. Unit Tests (Jest/Vitest)
**Location**: `apps/api/test/unit/`, `apps/web/tests/components/`

**What to Test**:
- Business logic in services
- React component rendering
- Utility functions
- Custom hooks

**Example**:
```typescript
// API Unit Test
import { AuthService } from './auth.service';
import { MockPrismaService, MockJwtService } from '@test/mocks';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(new MockPrismaService(), new MockJwtService());
  });

  it('should validate user credentials', async () => {
    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toBeDefined();
  });
});
```

```typescript
// Component Test
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

it('should render button with text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeInTheDocument();
});
```

### 2. E2E API Tests (Jest + Supertest)
**Location**: `apps/api/test/e2e/`

**What to Test**:
- API endpoint behavior
- Request/response validation
- Database interactions
- Multi-tenant isolation

**Example**:
```typescript
import * as request from 'supertest';

describe('POST /auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
  });
});
```

### 3. E2E Browser Tests (Playwright)
**Location**: `apps/web/tests/e2e/`

**What to Test**:
- Complete user workflows
- Cross-browser compatibility
- Accessibility
- Visual regression

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL('/dashboard');
});
```

## Test Data Management

### Factories (Dynamic Data)
Use for unit and integration tests where uniqueness matters:

```typescript
import { UserFactory, MatterFactory } from '@test/factories';

const user = UserFactory.build({ role: 'ATTORNEY' });
const matters = MatterFactory.buildList(10);
```

### Fixtures (Static Data)
Use for E2E tests requiring consistent data:

```typescript
import { FIXTURE_USERS, FIXTURE_MATTERS } from '@test/fixtures';

const admin = FIXTURE_USERS.admin;
const activeMatter = FIXTURE_MATTERS.activePurchase;
```

### Mocks (Service Responses)
Use for isolating units from dependencies:

```typescript
import { MockPrismaService } from '@test/mocks';

const prisma = new MockPrismaService();
prisma.user.findUnique.mockResolvedValue(mockUser);
```

## Mocking Strategies

### Backend (API)

#### Mocking Prisma
```typescript
import { MockPrismaService } from '@test/mocks';

const prisma = new MockPrismaService();
prisma.user.findUnique.mockResolvedValue(userFactory.build());
```

#### Mocking Redis
```typescript
import { MockRedisClient } from '@test/mocks';

const redis = new MockRedisClient();
await redis.set('key', 'value');
```

### Frontend (Web)

#### Mocking API Calls (MSW)
```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';

server.use(
  http.get('/api/matters', () => {
    return HttpResponse.json([mockMatter1, mockMatter2]);
  })
);
```

#### Mocking Next.js Router
```typescript
// Automatically mocked in tests/setup.ts
const mockRouter = useRouter();
expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
```

## CI/CD Integration

### Pre-commit Hook
```bash
# Run tests on changed files only
pnpm test:changed
```

### Pull Request Pipeline
```yaml
- name: Run Tests
  run: |
    pnpm install
    pnpm test:coverage
    pnpm test:e2e
```

### Coverage Reports
Coverage reports are generated in:
- API: `apps/api/coverage/`
- Web: `apps/web/coverage/`

View HTML report: `open apps/api/coverage/index.html`

## Best Practices

### 1. Test Isolation
Each test should be independent:
```typescript
// Good
it('should create user', () => {
  const user = UserFactory.build();
  expect(service.create(user)).toBeDefined();
});

// Bad (shared state)
let user;
beforeAll(() => { user = UserFactory.build(); });
```

### 2. Minimal Test Data
Only specify what's needed:
```typescript
// Good
const user = UserFactory.build({ role: 'ADMIN' });

// Bad (unnecessary detail)
const user = UserFactory.build({
  id: 'exact-id',
  email: 'specific@email.com',
  // ... 15 more fields
});
```

### 3. Clear Assertions
Test behavior, not implementation:
```typescript
// Good
expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();

// Bad
expect(component.state.error).toBe('Invalid credentials');
```

### 4. Realistic Data
Use data that mirrors production:
```typescript
// Good
const matter = MatterFactory.build({
  propertyAddress: '123 Main St, Springfield, IL 62701',
  purchasePrice: 425000,
});

// Bad
const matter = MatterFactory.build({
  propertyAddress: 'asdf',
  purchasePrice: 1,
});
```

## Troubleshooting

### Flaky Tests
1. Check for shared state between tests
2. Add explicit waits for async operations
3. Use fixed seeds for random data
4. Ensure proper cleanup

### Slow Tests
1. Use in-memory database for unit tests
2. Reduce test data volume
3. Use factories instead of database seeding
4. Run tests in parallel

### Coverage Gaps
1. Check `coverage/` directory for reports
2. Focus on critical business logic first
3. Don't test third-party code
4. Use `/* istanbul ignore next */` for unreachable code

## Resources

- [Testing Strategy Guide](./docs/testing-strategy.md)
- [Test Data Management Guide](./docs/test-data-guide.md)
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

## Support

For questions or issues with the test infrastructure:
1. Check existing documentation in `docs/`
2. Review example tests in `test/unit/` and `test/e2e/`
3. Contact the testing team

---

**Last Updated**: 2026-02-02
**Maintained By**: IRONCLAD Engineering Team
