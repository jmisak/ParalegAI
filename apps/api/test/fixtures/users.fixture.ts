/**
 * User Test Fixtures
 *
 * Pre-defined user data for consistent E2E testing.
 */

export const FIXTURE_USERS = {
  admin: {
    id: 'fixture-admin-001',
    email: 'admin@testfirm.test',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN' as const,
    organizationId: 'fixture-org-001',
    isActive: true,
    emailVerified: true,
    mfaEnabled: true,
  },

  attorney: {
    id: 'fixture-attorney-001',
    email: 'attorney@testfirm.test',
    firstName: 'Jane',
    lastName: 'Attorney',
    role: 'ATTORNEY' as const,
    organizationId: 'fixture-org-001',
    isActive: true,
    emailVerified: true,
    mfaEnabled: false,
  },

  paralegal: {
    id: 'fixture-paralegal-001',
    email: 'paralegal@testfirm.test',
    firstName: 'John',
    lastName: 'Paralegal',
    role: 'PARALEGAL' as const,
    organizationId: 'fixture-org-001',
    isActive: true,
    emailVerified: true,
    mfaEnabled: false,
  },

  inactive: {
    id: 'fixture-inactive-001',
    email: 'inactive@testfirm.test',
    firstName: 'Inactive',
    lastName: 'User',
    role: 'VIEWER' as const,
    organizationId: 'fixture-org-001',
    isActive: false,
    emailVerified: true,
    mfaEnabled: false,
  },
};

export const FIXTURE_PASSWORDS = {
  default: 'TestPassword123!',
  admin: 'AdminPassword123!',
  attorney: 'AttorneyPassword123!',
};
