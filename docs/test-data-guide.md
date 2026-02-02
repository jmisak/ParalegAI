# Test Data Management Guide

## Overview

This guide explains how to create and manage test data for IRONCLAD. Proper test data management ensures tests are reliable, maintainable, and fast.

## Test Data Strategies

### 1. Factories (Dynamic Data)

**When to Use**: Unit tests, integration tests where data uniqueness matters.

**Benefits**:
- Generates unique data per test
- Prevents test pollution
- Easy to customize
- Self-documenting

**Location**: `apps/api/test/factories/`

**Example**:
```typescript
import { UserFactory, MatterFactory } from '@test/factories';

// Create user with defaults
const user = UserFactory.build();

// Create user with overrides
const attorney = UserFactory.buildAttorney({
  email: 'custom@example.com',
  organizationId: 'specific-org-id',
});

// Create multiple users
const users = UserFactory.buildList(10, { role: 'PARALEGAL' });
```

### 2. Fixtures (Static Data)

**When to Use**: E2E tests where consistency across test runs is important.

**Benefits**:
- Predictable IDs and values
- Consistent test scenarios
- Easy to reference
- Good for documentation

**Location**: `apps/api/test/fixtures/`

**Example**:
```typescript
import { FIXTURE_USERS, FIXTURE_MATTERS } from '@test/fixtures';

// Use predefined users
const admin = FIXTURE_USERS.admin;
const paralegal = FIXTURE_USERS.paralegal;

// Use predefined matters
const activeMatter = FIXTURE_MATTERS.activePurchase;
```

### 3. Mocks (Service Responses)

**When to Use**: Isolating units from external dependencies.

**Location**: `apps/api/test/mocks/` or `apps/web/tests/mocks/`

**Example**:
```typescript
import { MockPrismaService } from '@test/mocks';

const prisma = new MockPrismaService();
prisma.user.findUnique.mockResolvedValue(mockUser);
```

## Creating Test Data

### Backend Factories

#### Creating a New Factory

1. Create file in `apps/api/test/factories/[entity].factory.ts`
2. Define TypeScript interface for the entity
3. Create factory class with static methods
4. Export from `index.ts`

**Template**:
```typescript
import { nanoid } from 'nanoid';

export interface MyEntity {
  id: string;
  name: string;
  // ... other fields
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMyEntityParams {
  id?: string;
  name?: string;
  // ... optional overrides
}

export class MyEntityFactory {
  private static counter = 0;

  static build(params: CreateMyEntityParams = {}): MyEntity {
    const now = new Date();
    const id = MyEntityFactory.counter++;

    return {
      id: params.id ?? nanoid(),
      name: params.name ?? `Test Entity ${id}`,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
    };
  }

  static buildList(count: number, params: CreateMyEntityParams = {}): MyEntity[] {
    return Array.from({ length: count }, () => this.build(params));
  }
}
```

### Frontend Mock Data

#### Using MSW (Mock Service Worker)

**Location**: `apps/web/tests/mocks/handlers.ts`

**Example**:
```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/matters', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const matters = [
      { id: '1', title: 'Matter 1', status: 'ACTIVE' },
      { id: '2', title: 'Matter 2', status: 'PENDING' },
    ];

    const filtered = status
      ? matters.filter(m => m.status === status)
      : matters;

    return HttpResponse.json(filtered);
  }),
];
```

## Test Data Best Practices

### 1. Isolation

Each test should be independent and not rely on data from other tests.

```typescript
// Good
it('should create user', () => {
  const user = UserFactory.build();
  const result = service.create(user);
  expect(result).toBeDefined();
});

// Bad (relies on global state)
let user;
beforeAll(() => {
  user = UserFactory.build();
});

it('should create user', () => {
  const result = service.create(user);
  // This user might be modified by other tests
});
```

### 2. Minimal Data

Only specify the data needed for the test.

```typescript
// Good
const user = UserFactory.build({ role: 'ADMIN' });

// Bad (unnecessary specificity)
const user = UserFactory.build({
  id: 'exact-id-123',
  email: 'specific.email@example.com',
  firstName: 'Exact',
  lastName: 'Name',
  role: 'ADMIN',
  // ... 10 more fields
});
```

### 3. Realistic Data

Use realistic data that matches production patterns.

```typescript
// Good
const matter = MatterFactory.build({
  propertyAddress: '123 Main St, Springfield, IL 62701',
  purchasePrice: 425000,
});

// Bad (unrealistic data causes confusion)
const matter = MatterFactory.build({
  propertyAddress: 'asdfasdf',
  purchasePrice: 1,
});
```

### 4. Clear Intent

Make it obvious what you're testing.

```typescript
// Good
it('should reject matter creation without required fields', () => {
  const incompleteMatter = { title: 'Test' }; // Missing required fields
  expect(() => service.create(incompleteMatter)).toThrow();
});

// Bad (unclear what's being tested)
it('should work correctly', () => {
  const data = { a: 1, b: 2 };
  const result = service.doSomething(data);
  expect(result).toBeTruthy();
});
```

## Common Patterns

### Multi-Tenant Testing

Always include organization context in test data:

```typescript
const ORG_A = 'org-a-id';
const ORG_B = 'org-b-id';

it('should isolate matters by organization', async () => {
  const matterA = MatterFactory.build({ organizationId: ORG_A });
  const matterB = MatterFactory.build({ organizationId: ORG_B });

  await service.create(matterA);
  await service.create(matterB);

  const results = await service.findAll(ORG_A);

  expect(results).toHaveLength(1);
  expect(results[0].id).toBe(matterA.id);
});
```

### Time-Sensitive Testing

Use fixed dates for predictable results:

```typescript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-01-15T10:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

it('should identify overdue tasks', () => {
  const overdue = TaskFactory.build({
    dueDate: new Date('2026-01-14'), // Yesterday
  });
  const upcoming = TaskFactory.build({
    dueDate: new Date('2026-01-20'), // Future
  });

  expect(service.isOverdue(overdue)).toBe(true);
  expect(service.isOverdue(upcoming)).toBe(false);
});
```

### Relationship Testing

Create related entities together:

```typescript
it('should create matter with assigned user', () => {
  const organization = OrganizationFactory.build();
  const user = UserFactory.build({ organizationId: organization.id });
  const matter = MatterFactory.build({
    organizationId: organization.id,
    assignedToId: user.id,
  });

  // All entities share same organization
  expect(matter.organizationId).toBe(user.organizationId);
});
```

## Data Cleanup

### Unit Tests (with Mocks)

No cleanup needed - mocks reset between tests.

### Integration Tests (with Database)

```typescript
afterEach(async () => {
  // Clean up in reverse order of foreign keys
  await prisma.document.deleteMany();
  await prisma.matter.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
});
```

### E2E Tests

```typescript
beforeEach(async () => {
  // Reset to known state before each test
  await prisma.$executeRaw`TRUNCATE TABLE matters RESTART IDENTITY CASCADE`;
  await seedFixtures();
});
```

## Seeding Test Database

For E2E tests, seed a consistent set of data:

```typescript
// apps/api/test/seed-e2e.ts
export async function seedE2EDatabase() {
  const org = await prisma.organization.create({
    data: {
      id: FIXTURE_ORGS.main.id,
      name: FIXTURE_ORGS.main.name,
      // ...
    },
  });

  const users = await Promise.all([
    prisma.user.create({ data: FIXTURE_USERS.admin }),
    prisma.user.create({ data: FIXTURE_USERS.attorney }),
    prisma.user.create({ data: FIXTURE_USERS.paralegal }),
  ]);

  const matters = await Promise.all([
    prisma.matter.create({ data: FIXTURE_MATTERS.activePurchase }),
    prisma.matter.create({ data: FIXTURE_MATTERS.pendingSale }),
  ]);

  return { org, users, matters };
}
```

## Performance Considerations

### Bulk Creation

For tests requiring many records:

```typescript
// Slow
for (let i = 0; i < 1000; i++) {
  await prisma.matter.create({ data: MatterFactory.build() });
}

// Fast
const matters = MatterFactory.buildList(1000);
await prisma.matter.createMany({ data: matters });
```

### Database Transactions

Use transactions for faster cleanup:

```typescript
it('should handle transaction', async () => {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: UserFactory.build() });
    const matter = await tx.matter.create({
      data: MatterFactory.build({ createdById: user.id }),
    });

    expect(matter.createdById).toBe(user.id);

    // Transaction rolls back automatically after test
  });
});
```

## Shared Test Utilities

Use utilities from `packages/shared/test/`:

```typescript
import {
  generateTestId,
  generateTestEmail,
  createMockUser,
  createBulkMockData,
} from '@ironclad/shared/test';

// Generate unique IDs
const id = generateTestId('matter');

// Generate realistic emails
const email = generateTestEmail('lawfirm.com');

// Create mock data
const user = createMockUser({ role: 'ATTORNEY' });

// Create bulk data
const matters = createBulkMockData(createMockMatter, 50);
```

## Troubleshooting

### Flaky Tests

**Symptom**: Test passes sometimes, fails other times.

**Common Causes**:
1. Shared state between tests
2. Race conditions (async)
3. Timing dependencies
4. Random data causing edge cases

**Solutions**:
```typescript
// Use fixed seeds for randomness
import seedrandom from 'seedrandom';
const rng = seedrandom('fixed-seed');

// Add explicit waits
await waitFor(() => expect(element).toBeInTheDocument());

// Ensure cleanup
afterEach(async () => {
  await cleanup();
});
```

### Slow Tests

**Symptom**: Tests take too long to run.

**Solutions**:
1. Use in-memory database for unit tests
2. Reduce number of records created
3. Use factories instead of database seeding
4. Run tests in parallel

### Data Conflicts

**Symptom**: Unique constraint violations, foreign key errors.

**Solutions**:
1. Use unique IDs from factories
2. Clean up in correct order (reverse of creation)
3. Use transactions for isolation

## References

- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method)
- [Test Fixtures](https://martinfowler.com/bliki/TestFixture.html)
- [Faker.js (for realistic data)](https://fakerjs.dev/)
