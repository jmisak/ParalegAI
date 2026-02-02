/**
 * Mock Data Generators
 *
 * Centralized mock data generation for all entity types.
 * Ensures consistency across frontend and backend tests.
 */

import { generateTestId, generateTestEmail, generateTestPhone, generateTestAddress } from './test-utils';

export type UserRole = 'ADMIN' | 'ATTORNEY' | 'PARALEGAL' | 'LEGAL_ASSISTANT' | 'ACCOUNTANT' | 'VIEWER';
export type MatterStatus = 'INTAKE' | 'ACTIVE' | 'PENDING' | 'ON_HOLD' | 'CLOSING' | 'CLOSED' | 'ARCHIVED';
export type TransactionType = 'PURCHASE' | 'SALE' | 'REFINANCE' | 'LEASE' | 'EXCHANGE_1031';
export type PropertyType = 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'CONDOMINIUM' | 'COMMERCIAL' | 'VACANT_LAND';

/**
 * Generate mock User
 */
export const createMockUser = (overrides?: Partial<any>) => {
  const id = generateTestId('user');

  return {
    id,
    email: generateTestEmail(),
    firstName: 'Test',
    lastName: 'User',
    role: 'PARALEGAL' as UserRole,
    organizationId: generateTestId('org'),
    isActive: true,
    emailVerified: true,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

/**
 * Generate mock Organization
 */
export const createMockOrganization = (overrides?: Partial<any>) => {
  const id = generateTestId('org');
  const name = overrides?.name || `Test Law Firm ${id.substring(0, 8)}`;

  return {
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    address: generateTestAddress(),
    phone: generateTestPhone(),
    email: generateTestEmail('lawfirm.test'),
    website: `https://${name.toLowerCase().replace(/\s+/g, '-')}.test`,
    isActive: true,
    subscriptionTier: 'PROFESSIONAL',
    maxUsers: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

/**
 * Generate mock Matter
 */
export const createMockMatter = (overrides?: Partial<any>) => {
  const id = generateTestId('matter');
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 99999);

  return {
    id,
    matterNumber: `${year}-${String(seq).padStart(5, '0')}`,
    title: `${generateTestAddress().split(',')[0]} Purchase`,
    description: 'Test matter description',
    status: 'ACTIVE' as MatterStatus,
    transactionType: 'PURCHASE' as TransactionType,
    propertyType: 'SINGLE_FAMILY' as PropertyType,
    propertyAddress: generateTestAddress(),
    purchasePrice: Math.floor(Math.random() * 500000) + 200000,
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    organizationId: generateTestId('org'),
    assignedToId: generateTestId('user'),
    createdById: generateTestId('user'),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

/**
 * Generate mock Document
 */
export const createMockDocument = (overrides?: Partial<any>) => {
  const id = generateTestId('doc');

  return {
    id,
    name: `document-${id.substring(0, 8)}.pdf`,
    displayName: 'Test Document',
    mimeType: 'application/pdf',
    size: Math.floor(Math.random() * 1000000) + 10000,
    version: 1,
    matterId: generateTestId('matter'),
    organizationId: generateTestId('org'),
    uploadedById: generateTestId('user'),
    storagePath: `/documents/${id}.pdf`,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

/**
 * Generate mock Task
 */
export const createMockTask = (overrides?: Partial<any>) => {
  const id = generateTestId('task');

  return {
    id,
    title: 'Test Task',
    description: 'Task description',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    matterId: generateTestId('matter'),
    assignedToId: generateTestId('user'),
    createdById: generateTestId('user'),
    organizationId: generateTestId('org'),
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    deletedAt: null,
    ...overrides,
  };
};

/**
 * Generate bulk test data
 */
export const createBulkMockData = <T>(
  generator: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: Partial<T>
): T[] => {
  return Array.from({ length: count }, () => generator(overrides));
};

/**
 * Generate mock API response
 */
export const createMockApiResponse = <T>(
  data: T,
  overrides?: Partial<any>
) => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Generate mock paginated response
 */
export const createMockPaginatedResponse = <T>(
  data: T[],
  page = 1,
  limit = 10,
  total?: number
) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total: total ?? data.length,
      totalPages: Math.ceil((total ?? data.length) / limit),
    },
  };
};
