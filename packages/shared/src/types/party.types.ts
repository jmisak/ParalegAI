/**
 * Party types for IronClad
 * @module types/party
 */

import type { PartyType, PartyRole } from '../enums';

/**
 * Party entity (individuals or organizations involved in matters)
 */
export interface Party {
  /** Unique party identifier */
  readonly id: string;
  /** Organization ID */
  organizationId: string;
  /** Party type */
  type: PartyType;
  /** Display name */
  displayName: string;
  /** First name (for individuals) */
  firstName?: string | undefined;
  /** Middle name (for individuals) */
  middleName?: string | undefined;
  /** Last name (for individuals) */
  lastName?: string | undefined;
  /** Suffix (Jr., III, etc.) */
  suffix?: string | undefined;
  /** Entity name (for organizations) */
  entityName?: string | undefined;
  /** DBA/trade name */
  dba?: string | undefined;
  /** State of formation (for entities) */
  stateOfFormation?: string | undefined;
  /** Entity ID number */
  entityIdNumber?: string | undefined;
  /** Tax ID (SSN or EIN) - encrypted */
  taxId?: string | undefined;
  /** Primary email */
  email?: string | undefined;
  /** Primary phone */
  phone?: string | undefined;
  /** Secondary phone */
  phoneSecondary?: string | undefined;
  /** Fax number */
  fax?: string | undefined;
  /** Primary address */
  address?: Address | undefined;
  /** Mailing address (if different) */
  mailingAddress?: Address | undefined;
  /** Marital status (for individuals) */
  maritalStatus?: MaritalStatus | undefined;
  /** Spouse information */
  spouse?: SpouseInfo | undefined;
  /** Date of birth (for individuals) */
  dateOfBirth?: Date | undefined;
  /** Driver's license info */
  driversLicense?: DriversLicense | undefined;
  /** Contact preferences */
  contactPreferences?: ContactPreferences | undefined;
  /** Associated user ID (if party has system access) */
  userId?: string | undefined;
  /** Internal notes */
  notes?: string | undefined;
  /** Tags for categorization */
  tags: readonly string[];
  /** Custom fields */
  customFields?: Record<string, unknown> | undefined;
  /** Whether party is active */
  isActive: boolean;
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Address structure
 */
export interface Address {
  /** Street address line 1 */
  street1: string;
  /** Street address line 2 */
  street2?: string | undefined;
  /** City */
  city: string;
  /** State/province code */
  state: string;
  /** ZIP/postal code */
  zipCode: string;
  /** Country code */
  country: string;
  /** County */
  county?: string | undefined;
}

/**
 * Marital status options
 */
export type MaritalStatus =
  | 'SINGLE'
  | 'MARRIED'
  | 'DOMESTIC_PARTNERSHIP'
  | 'DIVORCED'
  | 'WIDOWED'
  | 'SEPARATED'
  | 'UNKNOWN';

/**
 * Spouse information
 */
export interface SpouseInfo {
  /** Spouse first name */
  firstName: string;
  /** Spouse middle name */
  middleName?: string | undefined;
  /** Spouse last name */
  lastName: string;
  /** Whether spouse is co-signer/co-owner */
  isCoSigner: boolean;
  /** Spouse email */
  email?: string | undefined;
  /** Spouse phone */
  phone?: string | undefined;
}

/**
 * Driver's license information
 */
export interface DriversLicense {
  /** License number */
  number: string;
  /** Issuing state */
  state: string;
  /** Expiration date */
  expirationDate: Date;
}

/**
 * Contact preferences
 */
export interface ContactPreferences {
  /** Preferred contact method */
  preferredMethod: 'email' | 'phone' | 'mail' | 'text';
  /** Best time to contact */
  bestTime?: 'morning' | 'afternoon' | 'evening' | 'anytime' | undefined;
  /** Do not contact flag */
  doNotContact: boolean;
  /** Email opt-in for updates */
  emailOptIn: boolean;
  /** SMS opt-in */
  smsOptIn: boolean;
}

/**
 * Party role assignment in a matter
 */
export interface PartyMatterRole {
  /** Assignment ID */
  readonly id: string;
  /** Party ID */
  partyId: string;
  /** Matter ID */
  matterId: string;
  /** Role in the matter */
  role: PartyRole;
  /** Whether this is a primary party */
  isPrimary: boolean;
  /** Signing authority */
  signingAuthority?: SigningAuthority | undefined;
  /** Power of attorney info */
  powerOfAttorney?: PowerOfAttorneyInfo | undefined;
  /** Notes specific to this role */
  notes?: string | undefined;
  /** Assignment timestamp */
  readonly assignedAt: Date;
  /** Assigned by user ID */
  assignedBy: string;
}

/**
 * Signing authority types
 */
export type SigningAuthority =
  | 'INDIVIDUAL'
  | 'AUTHORIZED_SIGNER'
  | 'OFFICER'
  | 'MEMBER'
  | 'PARTNER'
  | 'TRUSTEE'
  | 'EXECUTOR'
  | 'ATTORNEY_IN_FACT'
  | 'GUARDIAN';

/**
 * Power of attorney information
 */
export interface PowerOfAttorneyInfo {
  /** Attorney-in-fact name */
  attorneyInFactName: string;
  /** POA document date */
  documentDate: Date;
  /** POA type */
  poaType: 'GENERAL' | 'LIMITED' | 'DURABLE' | 'SPRINGING';
  /** Recording information (if recorded) */
  recordingInfo?: {
    book: string;
    page: string;
    county: string;
    state: string;
  } | undefined;
}

/**
 * Trust information (when party type is TRUST)
 */
export interface TrustInfo {
  /** Trust name */
  trustName: string;
  /** Trust date */
  trustDate: Date;
  /** Trustee names */
  trustees: readonly string[];
  /** Trust type */
  trustType: 'REVOCABLE' | 'IRREVOCABLE' | 'LAND_TRUST' | 'OTHER';
  /** Trust tax ID */
  taxId?: string | undefined;
}

/**
 * Estate information (when party type is ESTATE)
 */
export interface EstateInfo {
  /** Decedent name */
  decedentName: string;
  /** Date of death */
  dateOfDeath: Date;
  /** Probate case number */
  probateCaseNumber?: string | undefined;
  /** Probate court */
  probateCourt?: string | undefined;
  /** Personal representative name */
  personalRepresentative: string;
  /** PR appointment date */
  appointmentDate: Date;
}

/**
 * Party creation input
 */
export interface CreatePartyInput {
  /** Party type */
  type: PartyType;
  /** For individuals */
  firstName?: string | undefined;
  lastName?: string | undefined;
  middleName?: string | undefined;
  suffix?: string | undefined;
  /** For entities */
  entityName?: string | undefined;
  dba?: string | undefined;
  stateOfFormation?: string | undefined;
  /** Contact information */
  email?: string | undefined;
  phone?: string | undefined;
  address?: Address | undefined;
  /** Optional tags */
  tags?: readonly string[] | undefined;
}

/**
 * Party search criteria
 */
export interface PartySearchCriteria {
  /** Search query (matches name, email, phone) */
  query?: string | undefined;
  /** Filter by party type */
  type?: PartyType | readonly PartyType[] | undefined;
  /** Filter by matter ID */
  matterId?: string | undefined;
  /** Filter by role */
  role?: PartyRole | readonly PartyRole[] | undefined;
  /** Filter by state */
  state?: string | undefined;
  /** Include inactive parties */
  includeInactive?: boolean | undefined;
}
