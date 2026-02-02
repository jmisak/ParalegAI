/**
 * Permission and role enumerations for IronClad
 * @module enums/permission
 */

/**
 * User roles within the system
 */
export enum UserRole {
  /** System administrator with full access */
  ADMIN = 'ADMIN',
  /** Senior attorney/partner */
  ATTORNEY_SENIOR = 'ATTORNEY_SENIOR',
  /** Associate attorney */
  ATTORNEY_ASSOCIATE = 'ATTORNEY_ASSOCIATE',
  /** Paralegal staff */
  PARALEGAL = 'PARALEGAL',
  /** Legal assistant */
  LEGAL_ASSISTANT = 'LEGAL_ASSISTANT',
  /** Closing coordinator */
  CLOSING_COORDINATOR = 'CLOSING_COORDINATOR',
  /** Title examiner */
  TITLE_EXAMINER = 'TITLE_EXAMINER',
  /** External client (limited access) */
  CLIENT = 'CLIENT',
  /** External party (very limited access) */
  EXTERNAL_PARTY = 'EXTERNAL_PARTY',
  /** Read-only auditor */
  AUDITOR = 'AUDITOR',
}

/**
 * Party roles within a transaction
 */
export enum PartyRole {
  /** Buyer in transaction */
  BUYER = 'BUYER',
  /** Seller in transaction */
  SELLER = 'SELLER',
  /** Borrower in loan */
  BORROWER = 'BORROWER',
  /** Lender in loan */
  LENDER = 'LENDER',
  /** Landlord in lease */
  LANDLORD = 'LANDLORD',
  /** Tenant in lease */
  TENANT = 'TENANT',
  /** Guarantor */
  GUARANTOR = 'GUARANTOR',
  /** Attorney for buyer */
  ATTORNEY_BUYER = 'ATTORNEY_BUYER',
  /** Attorney for seller */
  ATTORNEY_SELLER = 'ATTORNEY_SELLER',
  /** Attorney for lender */
  ATTORNEY_LENDER = 'ATTORNEY_LENDER',
  /** Real estate agent - buyer side */
  AGENT_BUYER = 'AGENT_BUYER',
  /** Real estate agent - seller side */
  AGENT_SELLER = 'AGENT_SELLER',
  /** Title company/agent */
  TITLE_AGENT = 'TITLE_AGENT',
  /** Escrow officer */
  ESCROW_OFFICER = 'ESCROW_OFFICER',
  /** Loan officer */
  LOAN_OFFICER = 'LOAN_OFFICER',
  /** Notary public */
  NOTARY = 'NOTARY',
  /** Witness */
  WITNESS = 'WITNESS',
  /** HOA representative */
  HOA_REP = 'HOA_REP',
  /** 1031 exchange accommodator */
  EXCHANGE_ACCOMMODATOR = 'EXCHANGE_ACCOMMODATOR',
  /** Other party */
  OTHER = 'OTHER',
}

/**
 * Permission flags for granular access control
 * Uses bit flags for efficient storage and checking
 */
export enum Permission {
  // Matter permissions (0x0001 - 0x000F)
  MATTER_VIEW = 0x0001,
  MATTER_CREATE = 0x0002,
  MATTER_EDIT = 0x0004,
  MATTER_DELETE = 0x0008,

  // Document permissions (0x0010 - 0x00F0)
  DOCUMENT_VIEW = 0x0010,
  DOCUMENT_CREATE = 0x0020,
  DOCUMENT_EDIT = 0x0040,
  DOCUMENT_DELETE = 0x0080,

  // Party permissions (0x0100 - 0x0F00)
  PARTY_VIEW = 0x0100,
  PARTY_CREATE = 0x0200,
  PARTY_EDIT = 0x0400,
  PARTY_DELETE = 0x0800,

  // Task permissions (0x1000 - 0xF000)
  TASK_VIEW = 0x1000,
  TASK_CREATE = 0x2000,
  TASK_EDIT = 0x4000,
  TASK_DELETE = 0x8000,

  // AI permissions (0x010000 - 0x0F0000)
  AI_USE = 0x010000,
  AI_GENERATE_DOCS = 0x020000,
  AI_ANALYZE = 0x040000,
  AI_CONFIGURE = 0x080000,

  // Admin permissions (0x100000 - 0xF00000)
  USER_MANAGE = 0x100000,
  ROLE_MANAGE = 0x200000,
  SYSTEM_CONFIG = 0x400000,
  AUDIT_VIEW = 0x800000,

  // Billing permissions (0x1000000 - 0xF000000)
  BILLING_VIEW = 0x1000000,
  BILLING_MANAGE = 0x2000000,
  REPORT_VIEW = 0x4000000,
  REPORT_EXPORT = 0x8000000,
}

/**
 * Access levels for matter-specific access
 */
export enum MatterAccessLevel {
  /** No access */
  NONE = 'NONE',
  /** View only */
  VIEW = 'VIEW',
  /** View and comment */
  COMMENT = 'COMMENT',
  /** View, comment, and edit */
  EDIT = 'EDIT',
  /** Full access including delete */
  FULL = 'FULL',
  /** Owner - can manage access */
  OWNER = 'OWNER',
}
