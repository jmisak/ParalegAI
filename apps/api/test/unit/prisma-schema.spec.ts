/**
 * IRONCLAD - Prisma Schema Tests
 *
 * Validates the Prisma schema structure and relationships.
 * These tests verify the schema definition without requiring a database connection.
 */

import { Prisma } from '@prisma/client';

describe('Prisma Schema', () => {
  describe('Enums', () => {
    it('should define UserRole enum with expected values', () => {
      const roles = Object.values(Prisma.UserRole);
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('ATTORNEY');
      expect(roles).toContain('PARALEGAL');
      expect(roles).toContain('LEGAL_ASSISTANT');
      expect(roles).toContain('ACCOUNTANT');
      expect(roles).toContain('VIEWER');
      expect(roles).toHaveLength(6);
    });

    it('should define MatterStatus enum with expected values', () => {
      const statuses = Object.values(Prisma.MatterStatus);
      expect(statuses).toContain('INTAKE');
      expect(statuses).toContain('ACTIVE');
      expect(statuses).toContain('PENDING');
      expect(statuses).toContain('ON_HOLD');
      expect(statuses).toContain('CLOSING');
      expect(statuses).toContain('CLOSED');
      expect(statuses).toContain('ARCHIVED');
      expect(statuses).toHaveLength(7);
    });

    it('should define TransactionType enum with expected values', () => {
      const types = Object.values(Prisma.TransactionType);
      expect(types).toContain('PURCHASE');
      expect(types).toContain('SALE');
      expect(types).toContain('REFINANCE');
      expect(types).toContain('LEASE');
      expect(types).toContain('EXCHANGE_1031');
      expect(types).toContain('FORECLOSURE');
      expect(types.length).toBeGreaterThanOrEqual(10);
    });

    it('should define PropertyType enum with expected values', () => {
      const types = Object.values(Prisma.PropertyType);
      expect(types).toContain('SINGLE_FAMILY');
      expect(types).toContain('MULTI_FAMILY');
      expect(types).toContain('CONDOMINIUM');
      expect(types).toContain('COMMERCIAL');
      expect(types).toContain('VACANT_LAND');
    });

    it('should define PartyType enum with expected values', () => {
      const types = Object.values(Prisma.PartyType);
      expect(types).toContain('INDIVIDUAL');
      expect(types).toContain('MARRIED_COUPLE');
      expect(types).toContain('CORPORATION');
      expect(types).toContain('LLC');
      expect(types).toContain('TRUST');
    });

    it('should define PartyRole enum with expected values', () => {
      const roles = Object.values(Prisma.PartyRole);
      expect(roles).toContain('BUYER');
      expect(roles).toContain('SELLER');
      expect(roles).toContain('LENDER');
      expect(roles).toContain('TITLE_COMPANY');
      expect(roles).toContain('ATTORNEY');
    });

    it('should define DocumentStatus enum with expected values', () => {
      const statuses = Object.values(Prisma.DocumentStatus);
      expect(statuses).toContain('DRAFT');
      expect(statuses).toContain('PENDING_REVIEW');
      expect(statuses).toContain('APPROVED');
      expect(statuses).toContain('EXECUTED');
      expect(statuses).toContain('RECORDED');
    });

    it('should define TaskStatus enum with expected values', () => {
      const statuses = Object.values(Prisma.TaskStatus);
      expect(statuses).toContain('NOT_STARTED');
      expect(statuses).toContain('IN_PROGRESS');
      expect(statuses).toContain('COMPLETED');
      expect(statuses).toContain('CANCELLED');
    });

    it('should define TaskPriority enum with expected values', () => {
      const priorities = Object.values(Prisma.TaskPriority);
      expect(priorities).toContain('CRITICAL');
      expect(priorities).toContain('HIGH');
      expect(priorities).toContain('MEDIUM');
      expect(priorities).toContain('LOW');
      expect(priorities).toHaveLength(4);
    });

    it('should define DeadlineType enum with expected values', () => {
      const types = Object.values(Prisma.DeadlineType);
      expect(types).toContain('STATUTORY');
      expect(types).toContain('CONTRACTUAL');
      expect(types).toContain('COURT_ORDERED');
      expect(types).toContain('INTERNAL');
    });

    it('should define EncumbranceType enum with expected values', () => {
      const types = Object.values(Prisma.EncumbranceType);
      expect(types).toContain('MORTGAGE');
      expect(types).toContain('DEED_OF_TRUST');
      expect(types).toContain('MECHANICS_LIEN');
      expect(types).toContain('EASEMENT');
      expect(types).toContain('RESTRICTION');
    });

    it('should define ComplianceCheckType enum with expected values', () => {
      const types = Object.values(Prisma.ComplianceCheckType);
      expect(types).toContain('IDENTITY_VERIFICATION');
      expect(types).toContain('SANCTIONS_SCREENING');
      expect(types).toContain('BENEFICIAL_OWNERSHIP');
      expect(types).toContain('CONFLICT_CHECK');
    });

    it('should define AuditAction enum with expected values', () => {
      const actions = Object.values(Prisma.AuditAction);
      expect(actions).toContain('CREATE');
      expect(actions).toContain('READ');
      expect(actions).toContain('UPDATE');
      expect(actions).toContain('DELETE');
      expect(actions).toContain('LOGIN');
      expect(actions).toContain('LOGOUT');
    });
  });

  describe('Model Validators (Prisma.validator)', () => {
    it('should validate Organization model shape', () => {
      const orgValidator = Prisma.validator<Prisma.OrganizationCreateInput>()({
        name: 'Test Firm',
        slug: 'test-firm',
        email: 'test@example.com',
      });
      expect(orgValidator).toHaveProperty('name');
      expect(orgValidator).toHaveProperty('slug');
      expect(orgValidator).toHaveProperty('email');
    });

    it('should validate User model requires organizationId', () => {
      const userValidator = Prisma.validator<Prisma.UserCreateInput>()({
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        organization: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(userValidator).toHaveProperty('email');
      expect(userValidator).toHaveProperty('firstName');
      expect(userValidator).toHaveProperty('lastName');
      expect(userValidator).toHaveProperty('organization');
    });

    it('should validate Matter model requires organizationId and transactionType', () => {
      const matterValidator = Prisma.validator<Prisma.MatterCreateInput>()({
        fileNumber: '2024-001',
        name: 'Test Matter',
        transactionType: 'PURCHASE',
        jurisdiction: 'TX',
        organization: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(matterValidator).toHaveProperty('fileNumber');
      expect(matterValidator).toHaveProperty('name');
      expect(matterValidator).toHaveProperty('transactionType');
      expect(matterValidator).toHaveProperty('jurisdiction');
    });

    it('should validate Property model requires matterId', () => {
      const propertyValidator = Prisma.validator<Prisma.PropertyCreateInput>()({
        organizationId: '00000000-0000-0000-0000-000000000000',
        matter: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
        propertyType: 'SINGLE_FAMILY',
        streetAddress: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        county: 'Travis',
      });
      expect(propertyValidator).toHaveProperty('streetAddress');
      expect(propertyValidator).toHaveProperty('propertyType');
      expect(propertyValidator).toHaveProperty('city');
      expect(propertyValidator).toHaveProperty('state');
    });

    it('should validate Party model structure', () => {
      const partyValidator = Prisma.validator<Prisma.PartyCreateInput>()({
        partyType: 'INDIVIDUAL',
        lastName: 'Smith',
        displayName: 'John Smith',
        organization: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(partyValidator).toHaveProperty('partyType');
      expect(partyValidator).toHaveProperty('lastName');
      expect(partyValidator).toHaveProperty('displayName');
    });

    it('should validate Document model structure', () => {
      const docValidator = Prisma.validator<Prisma.DocumentCreateInput>()({
        title: 'Test Document',
        documentType: 'contract',
        mimeType: 'application/pdf',
        storagePath: '/documents/test.pdf',
        storageBucket: 'ironclad-docs',
        originalFilename: 'test.pdf',
        organization: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(docValidator).toHaveProperty('title');
      expect(docValidator).toHaveProperty('documentType');
      expect(docValidator).toHaveProperty('mimeType');
      expect(docValidator).toHaveProperty('storagePath');
    });

    it('should validate Task model structure', () => {
      const taskValidator = Prisma.validator<Prisma.TaskCreateInput>()({
        organizationId: '00000000-0000-0000-0000-000000000000',
        title: 'Review Contract',
        matter: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(taskValidator).toHaveProperty('title');
      expect(taskValidator).toHaveProperty('matter');
    });

    it('should validate Deadline model structure', () => {
      const deadlineValidator = Prisma.validator<Prisma.DeadlineCreateInput>()({
        organizationId: '00000000-0000-0000-0000-000000000000',
        title: 'Closing Date',
        deadlineType: 'CONTRACTUAL',
        dueDate: new Date('2024-03-15'),
        matter: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(deadlineValidator).toHaveProperty('title');
      expect(deadlineValidator).toHaveProperty('deadlineType');
      expect(deadlineValidator).toHaveProperty('dueDate');
    });

    it('should validate TrustTransaction model structure', () => {
      const trustValidator = Prisma.validator<Prisma.TrustTransactionCreateInput>()({
        transactionType: 'DEPOSIT',
        amount: 10000,
        runningBalance: 10000,
        transactionDate: new Date(),
        description: 'Earnest money deposit',
        bankAccountId: 'IOLTA-001',
        organization: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
        matter: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(trustValidator).toHaveProperty('transactionType');
      expect(trustValidator).toHaveProperty('amount');
      expect(trustValidator).toHaveProperty('description');
    });

    it('should validate AuditLog model structure', () => {
      const auditValidator = Prisma.validator<Prisma.AuditLogCreateInput>()({
        action: 'CREATE',
        entityType: 'Matter',
        entityId: '00000000-0000-0000-0000-000000000000',
        description: 'Created new matter',
        organization: { connect: { id: '00000000-0000-0000-0000-000000000000' } },
      });
      expect(auditValidator).toHaveProperty('action');
      expect(auditValidator).toHaveProperty('entityType');
      expect(auditValidator).toHaveProperty('entityId');
      expect(auditValidator).toHaveProperty('description');
    });
  });

  describe('Model Scalar Fields', () => {
    it('Organization should have correct scalar fields', () => {
      const fields = Prisma.OrganizationScalarFieldEnum;
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('createdAt');
      expect(fields).toHaveProperty('updatedAt');
      expect(fields).toHaveProperty('deletedAt');
      expect(fields).toHaveProperty('name');
      expect(fields).toHaveProperty('slug');
      expect(fields).toHaveProperty('email');
    });

    it('User should have correct scalar fields', () => {
      const fields = Prisma.UserScalarFieldEnum;
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('organizationId');
      expect(fields).toHaveProperty('email');
      expect(fields).toHaveProperty('firstName');
      expect(fields).toHaveProperty('lastName');
      expect(fields).toHaveProperty('role');
      expect(fields).toHaveProperty('barNumber');
      expect(fields).toHaveProperty('jurisdictions');
    });

    it('Matter should have correct scalar fields', () => {
      const fields = Prisma.MatterScalarFieldEnum;
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('organizationId');
      expect(fields).toHaveProperty('fileNumber');
      expect(fields).toHaveProperty('name');
      expect(fields).toHaveProperty('status');
      expect(fields).toHaveProperty('transactionType');
      expect(fields).toHaveProperty('jurisdiction');
    });

    it('Property should have correct scalar fields', () => {
      const fields = Prisma.PropertyScalarFieldEnum;
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('matterId');
      expect(fields).toHaveProperty('propertyType');
      expect(fields).toHaveProperty('streetAddress');
      expect(fields).toHaveProperty('legalDescription');
      expect(fields).toHaveProperty('parcelNumber');
    });

    it('Document should have correct scalar fields', () => {
      const fields = Prisma.DocumentScalarFieldEnum;
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('organizationId');
      expect(fields).toHaveProperty('matterId');
      expect(fields).toHaveProperty('title');
      expect(fields).toHaveProperty('documentType');
      expect(fields).toHaveProperty('status');
      expect(fields).toHaveProperty('storagePath');
    });

    it('Task should have correct scalar fields', () => {
      const fields = Prisma.TaskScalarFieldEnum;
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('matterId');
      expect(fields).toHaveProperty('title');
      expect(fields).toHaveProperty('status');
      expect(fields).toHaveProperty('priority');
      expect(fields).toHaveProperty('dueDate');
    });

    it('TrustTransaction should have correct scalar fields', () => {
      const fields = Prisma.TrustTransactionScalarFieldEnum;
      expect(fields).toHaveProperty('id');
      expect(fields).toHaveProperty('organizationId');
      expect(fields).toHaveProperty('matterId');
      expect(fields).toHaveProperty('transactionType');
      expect(fields).toHaveProperty('amount');
      expect(fields).toHaveProperty('runningBalance');
      expect(fields).toHaveProperty('isReconciled');
    });
  });

  describe('Model Relationships (via Select)', () => {
    it('Organization should have relations to Users, Matters, etc.', () => {
      // Test that select includes relations
      const select: Prisma.OrganizationSelect = {
        id: true,
        users: true,
        matters: true,
        parties: true,
        documents: true,
        workflows: true,
        auditLogs: true,
        trustTransactions: true,
      };
      expect(select).toHaveProperty('users');
      expect(select).toHaveProperty('matters');
      expect(select).toHaveProperty('parties');
    });

    it('Matter should have relations to Property, Parties, Documents, etc.', () => {
      const select: Prisma.MatterSelect = {
        id: true,
        property: true,
        transaction: true,
        matterParties: true,
        documents: true,
        deadlines: true,
        tasks: true,
        timeEntries: true,
        communications: true,
        complianceChecks: true,
      };
      expect(select).toHaveProperty('property');
      expect(select).toHaveProperty('matterParties');
      expect(select).toHaveProperty('documents');
    });

    it('Property should have relations to TitleRecords and Encumbrances', () => {
      const select: Prisma.PropertySelect = {
        id: true,
        matter: true,
        titleRecords: true,
        encumbrances: true,
      };
      expect(select).toHaveProperty('titleRecords');
      expect(select).toHaveProperty('encumbrances');
    });

    it('Document should have relations to Versions and Chunks', () => {
      const select: Prisma.DocumentSelect = {
        id: true,
        organization: true,
        matter: true,
        versions: true,
        chunks: true,
      };
      expect(select).toHaveProperty('versions');
      expect(select).toHaveProperty('chunks');
    });

    it('Workflow should have relations to Steps and Instances', () => {
      const select: Prisma.WorkflowSelect = {
        id: true,
        organization: true,
        steps: true,
        instances: true,
      };
      expect(select).toHaveProperty('steps');
      expect(select).toHaveProperty('instances');
    });
  });
});
