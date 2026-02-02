/**
 * Matter Test Fixtures
 *
 * Pre-defined matter/case data for E2E testing.
 */

export const FIXTURE_MATTERS = {
  activePurchase: {
    id: 'fixture-matter-001',
    matterNumber: '2026-00001',
    title: '123 Oak Street Purchase',
    description: 'Single family home purchase transaction',
    status: 'ACTIVE' as const,
    transactionType: 'PURCHASE' as const,
    propertyType: 'SINGLE_FAMILY' as const,
    propertyAddress: '123 Oak Street, Springfield, IL 62701',
    purchasePrice: 425000,
    closingDate: new Date('2026-03-15'),
    organizationId: 'fixture-org-001',
    assignedToId: 'fixture-paralegal-001',
    createdById: 'fixture-attorney-001',
  },

  pendingSale: {
    id: 'fixture-matter-002',
    matterNumber: '2026-00002',
    title: '456 Maple Avenue Sale',
    description: 'Residential property sale',
    status: 'PENDING' as const,
    transactionType: 'SALE' as const,
    propertyType: 'SINGLE_FAMILY' as const,
    propertyAddress: '456 Maple Avenue, Springfield, IL 62702',
    purchasePrice: 375000,
    closingDate: new Date('2026-04-01'),
    organizationId: 'fixture-org-001',
    assignedToId: 'fixture-paralegal-001',
    createdById: 'fixture-attorney-001',
  },

  commercialLease: {
    id: 'fixture-matter-003',
    matterNumber: '2026-00003',
    title: 'Downtown Office Lease',
    description: 'Commercial lease agreement',
    status: 'ACTIVE' as const,
    transactionType: 'LEASE' as const,
    propertyType: 'COMMERCIAL' as const,
    propertyAddress: '789 Business Plaza, Suite 200, Springfield, IL 62703',
    purchasePrice: null,
    closingDate: new Date('2026-02-28'),
    organizationId: 'fixture-org-001',
    assignedToId: 'fixture-attorney-001',
    createdById: 'fixture-attorney-001',
  },

  closedRefinance: {
    id: 'fixture-matter-004',
    matterNumber: '2026-00004',
    title: '321 Pine Road Refinance',
    description: 'Mortgage refinance - completed',
    status: 'CLOSED' as const,
    transactionType: 'REFINANCE' as const,
    propertyType: 'SINGLE_FAMILY' as const,
    propertyAddress: '321 Pine Road, Springfield, IL 62704',
    purchasePrice: null,
    closingDate: new Date('2026-01-15'),
    organizationId: 'fixture-org-001',
    assignedToId: 'fixture-paralegal-001',
    createdById: 'fixture-attorney-001',
  },
};
