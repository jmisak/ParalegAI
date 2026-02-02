/**
 * Validation schemas using Zod
 * @module utils/validation
 */

import { z } from 'zod';
import {
  MatterStatus,
  MatterType,
  DocumentStatus,
  DocumentType,
  TransactionStatus,
  TransactionType,
  TaskStatus,
  Priority,
  UserRole,
  PartyType,
  PartyRole,
  PropertyType,
  AIProvider,
  AITaskType,
} from '../enums';

// ============================================================================
// Common Schemas
// ============================================================================

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email format').toLowerCase();

/**
 * Phone number validation (US format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?1?\d{10,14}$/, 'Invalid phone number format')
  .transform((val) => val.replace(/\D/g, ''));

/**
 * US ZIP code validation
 */
export const zipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format');

/**
 * US state code validation
 */
export const stateCodeSchema = z
  .string()
  .length(2, 'State code must be 2 characters')
  .toUpperCase();

/**
 * Currency amount (cents)
 */
export const currencySchema = z.number().int().nonnegative('Amount must be non-negative');

/**
 * Percentage (0-100)
 */
export const percentageSchema = z.number().min(0).max(100, 'Percentage must be between 0 and 100');

/**
 * Non-empty string
 */
export const nonEmptyStringSchema = z.string().min(1, 'Field cannot be empty').trim();

/**
 * Date or ISO string
 */
export const dateSchema = z.coerce.date();

// ============================================================================
// Address Schema
// ============================================================================

export const addressSchema = z.object({
  street1: nonEmptyStringSchema,
  street2: z.string().optional(),
  city: nonEmptyStringSchema,
  state: stateCodeSchema,
  zipCode: zipCodeSchema,
  country: z.string().default('US'),
  county: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ============================================================================
// Auth Schemas
// ============================================================================

export const userCredentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createUserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: nonEmptyStringSchema.max(100),
  lastName: nonEmptyStringSchema.max(100),
  role: z.nativeEnum(UserRole),
  phone: phoneSchema.optional(),
  department: z.string().optional(),
  title: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// Matter Schemas
// ============================================================================

export const createMatterSchema = z.object({
  title: nonEmptyStringSchema.max(255),
  type: z.nativeEnum(MatterType),
  jurisdiction: stateCodeSchema,
  responsibleAttorneyId: uuidSchema,
  clientIds: z.array(uuidSchema).min(1, 'At least one client is required'),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(Priority).optional().default(Priority.NORMAL),
  county: z.string().max(100).optional(),
  expectedCloseDate: dateSchema.optional(),
  billingType: z
    .enum(['HOURLY', 'FLAT_FEE', 'CONTINGENCY', 'RETAINER', 'PRO_BONO', 'HYBRID'])
    .optional()
    .default('HOURLY'),
  propertyId: uuidSchema.optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const updateMatterSchema = z.object({
  title: nonEmptyStringSchema.max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.nativeEnum(MatterStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  responsibleAttorneyId: uuidSchema.optional(),
  assignedUserIds: z.array(uuidSchema).optional(),
  expectedCloseDate: dateSchema.optional(),
  billingType: z
    .enum(['HOURLY', 'FLAT_FEE', 'CONTINGENCY', 'RETAINER', 'PRO_BONO', 'HYBRID'])
    .optional(),
  flatFeeAmount: currencySchema.optional(),
  hourlyRateOverride: currencySchema.optional(),
  internalNotes: z.string().max(10000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const matterSearchSchema = z.object({
  query: z.string().max(500).optional(),
  status: z.union([z.nativeEnum(MatterStatus), z.array(z.nativeEnum(MatterStatus))]).optional(),
  type: z.union([z.nativeEnum(MatterType), z.array(z.nativeEnum(MatterType))]).optional(),
  priority: z.union([z.nativeEnum(Priority), z.array(z.nativeEnum(Priority))]).optional(),
  jurisdiction: stateCodeSchema.optional(),
  responsibleAttorneyId: uuidSchema.optional(),
  assignedUserId: uuidSchema.optional(),
  clientId: uuidSchema.optional(),
  openedDateFrom: dateSchema.optional(),
  openedDateTo: dateSchema.optional(),
  tags: z.array(z.string()).optional(),
  includeArchived: z.boolean().optional().default(false),
});

// ============================================================================
// Document Schemas
// ============================================================================

export const uploadDocumentSchema = z.object({
  matterId: uuidSchema,
  title: nonEmptyStringSchema.max(255),
  type: z.nativeEnum(DocumentType),
  fileData: z.string().or(z.instanceof(Buffer)),
  fileName: nonEmptyStringSchema.max(255),
  mimeType: z.string().max(100),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  partyIds: z.array(uuidSchema).optional(),
  processWithAI: z.boolean().optional().default(true),
});

export const updateDocumentSchema = z.object({
  title: nonEmptyStringSchema.max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  type: z.nativeEnum(DocumentType).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  partyIds: z.array(uuidSchema).optional(),
  executionDate: dateSchema.optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const documentSearchSchema = z.object({
  query: z.string().max(500).optional(),
  matterId: uuidSchema.optional(),
  type: z.union([z.nativeEnum(DocumentType), z.array(z.nativeEnum(DocumentType))]).optional(),
  status: z
    .union([z.nativeEnum(DocumentStatus), z.array(z.nativeEnum(DocumentStatus))])
    .optional(),
  uploadedBy: uuidSchema.optional(),
  createdFrom: dateSchema.optional(),
  createdTo: dateSchema.optional(),
  tags: z.array(z.string()).optional(),
  templatesOnly: z.boolean().optional(),
  semanticSearch: z.boolean().optional(),
});

// ============================================================================
// Party Schemas
// ============================================================================

export const createPartySchema = z
  .object({
    type: z.nativeEnum(PartyType),
    // Individual fields
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    middleName: z.string().max(100).optional(),
    suffix: z.string().max(20).optional(),
    // Entity fields
    entityName: z.string().max(255).optional(),
    dba: z.string().max(255).optional(),
    stateOfFormation: stateCodeSchema.optional(),
    // Contact info
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    address: addressSchema.optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
  })
  .refine(
    (data) => {
      // Individual types require first/last name
      if (data.type === PartyType.INDIVIDUAL || data.type === PartyType.MARRIED_COUPLE) {
        return data.firstName && data.lastName;
      }
      // Entity types require entity name
      return data.entityName;
    },
    {
      message: 'Individuals require firstName/lastName; Entities require entityName',
    }
  );

export const updatePartySchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  middleName: z.string().max(100).optional(),
  suffix: z.string().max(20).optional(),
  entityName: z.string().max(255).optional(),
  dba: z.string().max(255).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  maritalStatus: z
    .enum(['SINGLE', 'MARRIED', 'DOMESTIC_PARTNERSHIP', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'UNKNOWN'])
    .optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  customFields: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const partySearchSchema = z.object({
  query: z.string().max(500).optional(),
  type: z.union([z.nativeEnum(PartyType), z.array(z.nativeEnum(PartyType))]).optional(),
  matterId: uuidSchema.optional(),
  role: z.union([z.nativeEnum(PartyRole), z.array(z.nativeEnum(PartyRole))]).optional(),
  state: stateCodeSchema.optional(),
  includeInactive: z.boolean().optional().default(false),
});

// ============================================================================
// Property Schemas
// ============================================================================

export const legalDescriptionSchema = z.object({
  type: z.enum(['METES_AND_BOUNDS', 'GOVERNMENT_SURVEY', 'PLATTED_LOT', 'CONDOMINIUM', 'REFERENCE']),
  fullDescription: nonEmptyStringSchema.max(10000),
  metesAndBounds: z.string().max(10000).optional(),
  governmentSurvey: z
    .object({
      section: z.string(),
      township: z.string(),
      range: z.string(),
      quarterSection: z.string().optional(),
      principalMeridian: z.string(),
    })
    .optional(),
  plattedLot: z
    .object({
      lot: z.string(),
      block: z.string().optional(),
      subdivision: z.string(),
      platBook: z.string().optional(),
      platPage: z.string().optional(),
      recordingDate: dateSchema.optional(),
    })
    .optional(),
});

export const createPropertySchema = z.object({
  type: z.nativeEnum(PropertyType),
  address: addressSchema,
  legalDescription: legalDescriptionSchema,
  apn: z.string().max(50).optional(),
  subdivision: z.string().max(255).optional(),
  lot: z.string().max(50).optional(),
  block: z.string().max(50).optional(),
  unit: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const updatePropertySchema = z.object({
  type: z.nativeEnum(PropertyType).optional(),
  address: addressSchema.optional(),
  legalDescription: legalDescriptionSchema.optional(),
  apn: z.string().max(50).optional(),
  lotSizeAcres: z.number().positive().optional(),
  lotSizeSqFt: z.number().positive().optional(),
  buildingSizeSqFt: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1600).max(2100).optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  zoning: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  customFields: z.record(z.unknown()).optional(),
});

// ============================================================================
// Transaction Schemas
// ============================================================================

export const createTransactionSchema = z.object({
  matterId: uuidSchema,
  propertyId: uuidSchema,
  type: z.nativeEnum(TransactionType),
  purchasePrice: currencySchema.positive('Purchase price must be positive'),
  earnestMoney: currencySchema.nonnegative(),
  contractDate: dateSchema,
  closingDate: dateSchema,
  financing: z
    .object({
      type: z.enum([
        'CONVENTIONAL',
        'FHA',
        'VA',
        'USDA',
        'JUMBO',
        'PORTFOLIO',
        'HARD_MONEY',
        'SELLER_FINANCING',
        'CASH',
        'ASSUMPTION',
      ]),
      loanAmount: currencySchema.optional(),
      interestRate: percentageSchema.optional(),
      loanTermMonths: z.number().int().positive().optional(),
      lenderName: z.string().max(255).optional(),
    })
    .optional(),
});

export const updateTransactionSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  purchasePrice: currencySchema.positive().optional(),
  earnestMoney: currencySchema.nonnegative().optional(),
  closingDate: dateSchema.optional(),
  sellerConcessions: currencySchema.nonnegative().optional(),
  specialStipulations: z.string().max(10000).optional(),
  notes: z.string().max(5000).optional(),
  customFields: z.record(z.unknown()).optional(),
});

// ============================================================================
// Task Schemas
// ============================================================================

export const createTaskSchema = z.object({
  matterId: uuidSchema,
  title: nonEmptyStringSchema.max(255),
  category: z.enum([
    'DOCUMENT_PREPARATION',
    'DOCUMENT_REVIEW',
    'CLIENT_COMMUNICATION',
    'LENDER_COMMUNICATION',
    'TITLE_WORK',
    'DUE_DILIGENCE',
    'CLOSING_PREP',
    'POST_CLOSING',
    'DEADLINE_TRACKING',
    'INTERNAL',
    'OTHER',
  ]),
  description: z.string().max(5000).optional(),
  priority: z.nativeEnum(Priority).optional().default(Priority.NORMAL),
  dueDate: dateSchema.optional(),
  assignedTo: uuidSchema.optional(),
  checklist: z.array(z.string().max(500)).max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isBillable: z.boolean().optional().default(true),
});

export const updateTaskSchema = z.object({
  title: nonEmptyStringSchema.max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: dateSchema.optional(),
  assignedTo: uuidSchema.nullable().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  actualHours: z.number().nonnegative().optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const taskSearchSchema = z.object({
  matterId: uuidSchema.optional(),
  assignedTo: uuidSchema.optional(),
  status: z.union([z.nativeEnum(TaskStatus), z.array(z.nativeEnum(TaskStatus))]).optional(),
  priority: z.union([z.nativeEnum(Priority), z.array(z.nativeEnum(Priority))]).optional(),
  category: z
    .union([
      z.enum([
        'DOCUMENT_PREPARATION',
        'DOCUMENT_REVIEW',
        'CLIENT_COMMUNICATION',
        'LENDER_COMMUNICATION',
        'TITLE_WORK',
        'DUE_DILIGENCE',
        'CLOSING_PREP',
        'POST_CLOSING',
        'DEADLINE_TRACKING',
        'INTERNAL',
        'OTHER',
      ]),
      z.array(
        z.enum([
          'DOCUMENT_PREPARATION',
          'DOCUMENT_REVIEW',
          'CLIENT_COMMUNICATION',
          'LENDER_COMMUNICATION',
          'TITLE_WORK',
          'DUE_DILIGENCE',
          'CLOSING_PREP',
          'POST_CLOSING',
          'DEADLINE_TRACKING',
          'INTERNAL',
          'OTHER',
        ])
      ),
    ])
    .optional(),
  dueDateFrom: dateSchema.optional(),
  dueDateTo: dateSchema.optional(),
  includeCompleted: z.boolean().optional().default(false),
  overdueOnly: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// AI Schemas
// ============================================================================

export const aiRequestSchema = z.object({
  taskType: z.nativeEnum(AITaskType),
  provider: z.nativeEnum(AIProvider).optional(),
  model: z.string().max(100).optional(),
  input: z.object({
    prompt: nonEmptyStringSchema.max(50000),
    systemPrompt: z.string().max(10000).optional(),
    documentContent: z.string().optional(),
    structuredData: z.record(z.unknown()).optional(),
  }),
  parameters: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().positive().max(100000).optional(),
      topP: z.number().min(0).max(1).optional(),
      responseFormat: z.enum(['text', 'json', 'markdown']).optional(),
      useRAG: z.boolean().optional(),
      ragParameters: z
        .object({
          topK: z.number().int().positive().max(50).default(5),
          minScore: z.number().min(0).max(1).default(0.7),
          matterFilter: uuidSchema.optional(),
          documentTypeFilter: z.array(z.string()).optional(),
          includeMetadata: z.boolean().default(true),
          rerank: z.boolean().default(false),
        })
        .optional(),
    })
    .optional(),
  matterId: uuidSchema.optional(),
  documentId: uuidSchema.optional(),
});

// ============================================================================
// API Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().max(100).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const searchRequestSchema = z.object({
  query: nonEmptyStringSchema.max(500),
  resourceTypes: z.array(z.string()).optional(),
  filters: z.record(z.unknown()).optional(),
  pagination: paginationSchema.optional(),
  semantic: z.boolean().optional().default(false),
  highlight: z.boolean().optional().default(true),
});

// ============================================================================
// Export Types
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateMatterInput = z.infer<typeof createMatterSchema>;
export type UpdateMatterInput = z.infer<typeof updateMatterSchema>;
export type MatterSearchInput = z.infer<typeof matterSearchSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DocumentSearchInput = z.infer<typeof documentSearchSchema>;
export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type PartySearchInput = z.infer<typeof partySearchSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskSearchInput = z.infer<typeof taskSearchSchema>;
export type AIRequestInput = z.infer<typeof aiRequestSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchRequestInput = z.infer<typeof searchRequestSchema>;
