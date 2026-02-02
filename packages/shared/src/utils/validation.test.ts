/**
 * Validation schema tests
 * @module utils/validation.test
 */

import { describe, it, expect } from 'vitest';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  zipCodeSchema,
  stateCodeSchema,
  addressSchema,
  createMatterSchema,
  createPartySchema,
  createTaskSchema,
  paginationSchema,
} from './validation';
import { MatterType, Priority, PartyType } from '../enums';

describe('Common Schemas', () => {
  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      const result = uuidSchema.safeParse('not-a-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('should accept valid emails and lowercase them', () => {
      const result = emailSchema.safeParse('Test@Example.COM');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should reject invalid emails', () => {
      const result = emailSchema.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid phone numbers (digits only)', () => {
      const result = phoneSchema.safeParse('5551234567');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('5551234567');
      }
    });

    it('should accept phone with country code prefix', () => {
      const result = phoneSchema.safeParse('+15551234567');
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const result = phoneSchema.safeParse('123');
      expect(result.success).toBe(false);
    });
  });

  describe('zipCodeSchema', () => {
    it('should accept 5-digit ZIP codes', () => {
      const result = zipCodeSchema.safeParse('12345');
      expect(result.success).toBe(true);
    });

    it('should accept ZIP+4 codes', () => {
      const result = zipCodeSchema.safeParse('12345-6789');
      expect(result.success).toBe(true);
    });

    it('should reject invalid ZIP codes', () => {
      const result = zipCodeSchema.safeParse('1234');
      expect(result.success).toBe(false);
    });
  });

  describe('stateCodeSchema', () => {
    it('should accept valid state codes and uppercase them', () => {
      const result = stateCodeSchema.safeParse('ca');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('CA');
      }
    });

    it('should reject invalid state codes', () => {
      const result = stateCodeSchema.safeParse('California');
      expect(result.success).toBe(false);
    });
  });
});

describe('addressSchema', () => {
  it('should accept valid addresses', () => {
    const result = addressSchema.safeParse({
      street1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('US');
    }
  });

  it('should accept addresses with optional fields', () => {
    const result = addressSchema.safeParse({
      street1: '123 Main St',
      street2: 'Suite 100',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      county: 'Test County',
    });
    expect(result.success).toBe(true);
  });

  it('should reject addresses with missing required fields', () => {
    const result = addressSchema.safeParse({
      street1: '123 Main St',
      city: 'Anytown',
    });
    expect(result.success).toBe(false);
  });
});

describe('createMatterSchema', () => {
  const validMatter = {
    title: 'Test Matter',
    type: MatterType.RESIDENTIAL_PURCHASE,
    jurisdiction: 'CA',
    responsibleAttorneyId: '550e8400-e29b-41d4-a716-446655440000',
    clientIds: ['550e8400-e29b-41d4-a716-446655440001'],
  };

  it('should accept valid matter input', () => {
    const result = createMatterSchema.safeParse(validMatter);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe(Priority.NORMAL);
      expect(result.data.billingType).toBe('HOURLY');
    }
  });

  it('should accept matter with optional fields', () => {
    const result = createMatterSchema.safeParse({
      ...validMatter,
      description: 'Test description',
      priority: Priority.HIGH,
      county: 'Los Angeles',
      tags: ['residential', 'purchase'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject matter with no clients', () => {
    const result = createMatterSchema.safeParse({
      ...validMatter,
      clientIds: [],
    });
    expect(result.success).toBe(false);
  });

  it('should reject matter with empty title', () => {
    const result = createMatterSchema.safeParse({
      ...validMatter,
      title: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createPartySchema', () => {
  it('should accept valid individual party', () => {
    const result = createPartySchema.safeParse({
      type: PartyType.INDIVIDUAL,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid entity party', () => {
    const result = createPartySchema.safeParse({
      type: PartyType.LLC,
      entityName: 'Acme LLC',
      stateOfFormation: 'DE',
    });
    expect(result.success).toBe(true);
  });

  it('should reject individual without name', () => {
    const result = createPartySchema.safeParse({
      type: PartyType.INDIVIDUAL,
      email: 'john@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('should reject entity without entity name', () => {
    const result = createPartySchema.safeParse({
      type: PartyType.LLC,
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.success).toBe(false);
  });
});

describe('createTaskSchema', () => {
  const validTask = {
    matterId: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Review contract',
    category: 'DOCUMENT_REVIEW' as const,
  };

  it('should accept valid task input', () => {
    const result = createTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe(Priority.NORMAL);
      expect(result.data.isBillable).toBe(true);
    }
  });

  it('should accept task with all optional fields', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      description: 'Review the purchase agreement',
      priority: Priority.HIGH,
      dueDate: '2024-12-31',
      assignedTo: '550e8400-e29b-41d4-a716-446655440001',
      checklist: ['Check price', 'Check contingencies'],
      tags: ['urgent', 'contract'],
      isBillable: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject task with empty string title', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      title: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('should accept valid pagination params', () => {
    const result = paginationSchema.safeParse({
      page: 2,
      pageSize: 50,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
  });

  it('should provide defaults', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should coerce string numbers', () => {
    const result = paginationSchema.safeParse({
      page: '3',
      pageSize: '25',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(25);
    }
  });

  it('should reject page size over 100', () => {
    const result = paginationSchema.safeParse({
      pageSize: 200,
    });
    expect(result.success).toBe(false);
  });
});
