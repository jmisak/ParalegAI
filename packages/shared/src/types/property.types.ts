/**
 * Property types for IronClad
 * @module types/property
 */

import type { PropertyType } from '../enums';
import type { Address } from './party.types';

/**
 * Real estate property entity
 */
export interface Property {
  /** Unique property identifier */
  readonly id: string;
  /** Organization ID */
  organizationId: string;
  /** Property type */
  type: PropertyType;
  /** Property address */
  address: Address;
  /** Full legal description */
  legalDescription: LegalDescription;
  /** Assessor's parcel number (APN) */
  apn?: string | undefined;
  /** Alternate parcel ID */
  alternateParcelId?: string | undefined;
  /** Tax map/lot reference */
  taxMapLot?: string | undefined;
  /** Subdivision name */
  subdivision?: string | undefined;
  /** Lot number */
  lot?: string | undefined;
  /** Block number */
  block?: string | undefined;
  /** Unit number (for condos) */
  unit?: string | undefined;
  /** Building name/number */
  building?: string | undefined;
  /** Phase number */
  phase?: string | undefined;
  /** Lot size (acres) */
  lotSizeAcres?: number | undefined;
  /** Lot size (square feet) */
  lotSizeSqFt?: number | undefined;
  /** Building size (square feet) */
  buildingSizeSqFt?: number | undefined;
  /** Year built */
  yearBuilt?: number | undefined;
  /** Number of bedrooms */
  bedrooms?: number | undefined;
  /** Number of bathrooms */
  bathrooms?: number | undefined;
  /** Number of stories */
  stories?: number | undefined;
  /** Garage spaces */
  garageSpaces?: number | undefined;
  /** Parking spaces */
  parkingSpaces?: number | undefined;
  /** Zoning designation */
  zoning?: string | undefined;
  /** Current use */
  currentUse?: string | undefined;
  /** HOA information */
  hoa?: HOAInfo | undefined;
  /** Flood zone designation */
  floodZone?: FloodZoneInfo | undefined;
  /** Assessed value */
  assessedValue?: number | undefined;
  /** Assessment year */
  assessmentYear?: number | undefined;
  /** Annual tax amount */
  annualTaxes?: number | undefined;
  /** Tax status */
  taxStatus?: TaxStatus | undefined;
  /** Current title holder(s) */
  titleHolders?: readonly TitleHolder[] | undefined;
  /** Vesting type */
  vestingType?: VestingType | undefined;
  /** Encumbrances and liens */
  encumbrances?: readonly Encumbrance[] | undefined;
  /** Easements */
  easements?: readonly Easement[] | undefined;
  /** Utility information */
  utilities?: PropertyUtilities | undefined;
  /** Property images */
  imageUrls?: readonly string[] | undefined;
  /** Internal notes */
  notes?: string | undefined;
  /** Tags for categorization */
  tags: readonly string[];
  /** Custom fields */
  customFields?: Record<string, unknown> | undefined;
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Legal description structure
 */
export interface LegalDescription {
  /** Legal description type */
  type: LegalDescriptionType;
  /** Full legal description text */
  fullDescription: string;
  /** Metes and bounds description */
  metesAndBounds?: string | undefined;
  /** Government survey details */
  governmentSurvey?: GovernmentSurvey | undefined;
  /** Platted lot description */
  plattedLot?: PlattedLot | undefined;
}

/**
 * Legal description type
 */
export type LegalDescriptionType =
  | 'METES_AND_BOUNDS'
  | 'GOVERNMENT_SURVEY'
  | 'PLATTED_LOT'
  | 'CONDOMINIUM'
  | 'REFERENCE';

/**
 * Government survey (rectangular survey system)
 */
export interface GovernmentSurvey {
  /** Section number */
  section: string;
  /** Township */
  township: string;
  /** Range */
  range: string;
  /** Quarter section */
  quarterSection?: string | undefined;
  /** Principal meridian */
  principalMeridian: string;
}

/**
 * Platted lot description
 */
export interface PlattedLot {
  /** Lot number */
  lot: string;
  /** Block number */
  block?: string | undefined;
  /** Subdivision name */
  subdivision: string;
  /** Plat book reference */
  platBook?: string | undefined;
  /** Plat page reference */
  platPage?: string | undefined;
  /** Recording date */
  recordingDate?: Date | undefined;
}

/**
 * HOA information
 */
export interface HOAInfo {
  /** HOA name */
  name: string;
  /** Management company */
  managementCompany?: string | undefined;
  /** Contact name */
  contactName?: string | undefined;
  /** Contact email */
  email?: string | undefined;
  /** Contact phone */
  phone?: string | undefined;
  /** Monthly dues */
  monthlyDues?: number | undefined;
  /** Special assessments */
  specialAssessments?: number | undefined;
  /** Transfer fee */
  transferFee?: number | undefined;
  /** Move-in fee */
  moveInFee?: number | undefined;
  /** HOA has first right of refusal */
  hasFirstRefusal: boolean;
  /** Pending litigation flag */
  pendingLitigation: boolean;
}

/**
 * Flood zone information
 */
export interface FloodZoneInfo {
  /** FEMA flood zone designation */
  zone: string;
  /** Community panel number */
  panelNumber?: string | undefined;
  /** Map effective date */
  mapDate?: Date | undefined;
  /** Flood insurance required */
  insuranceRequired: boolean;
  /** LOMA/LOMR information */
  loma?: string | undefined;
}

/**
 * Property tax status
 */
export type TaxStatus = 'CURRENT' | 'DELINQUENT' | 'TAX_SALE' | 'EXEMPT' | 'UNKNOWN';

/**
 * Title holder information
 */
export interface TitleHolder {
  /** Party ID */
  partyId: string;
  /** Party name */
  name: string;
  /** Ownership percentage */
  ownershipPercentage?: number | undefined;
  /** Vesting type */
  vestingType?: VestingType | undefined;
}

/**
 * Vesting types for title
 */
export type VestingType =
  | 'SOLE_OWNER'
  | 'JOINT_TENANTS'
  | 'TENANTS_IN_COMMON'
  | 'TENANTS_BY_ENTIRETY'
  | 'COMMUNITY_PROPERTY'
  | 'COMMUNITY_PROPERTY_SURVIVORSHIP'
  | 'TRUST'
  | 'CORPORATION'
  | 'LLC'
  | 'PARTNERSHIP';

/**
 * Encumbrance/lien on property
 */
export interface Encumbrance {
  /** Encumbrance type */
  type: EncumbranceType;
  /** Holder/beneficiary name */
  holder: string;
  /** Original amount */
  originalAmount?: number | undefined;
  /** Current balance (estimated) */
  currentBalance?: number | undefined;
  /** Recording information */
  recordingInfo: {
    book: string;
    page: string;
    date: Date;
  };
  /** Position/priority */
  position?: number | undefined;
  /** Maturity date */
  maturityDate?: Date | undefined;
  /** Notes */
  notes?: string | undefined;
}

/**
 * Encumbrance types
 */
export type EncumbranceType =
  | 'MORTGAGE'
  | 'DEED_OF_TRUST'
  | 'HELOC'
  | 'MECHANICS_LIEN'
  | 'TAX_LIEN'
  | 'JUDGMENT_LIEN'
  | 'HOA_LIEN'
  | 'IRS_LIEN'
  | 'STATE_TAX_LIEN'
  | 'UCC_FILING'
  | 'LIS_PENDENS'
  | 'OTHER';

/**
 * Easement on property
 */
export interface Easement {
  /** Easement type */
  type: EasementType;
  /** Easement holder/beneficiary */
  holder?: string | undefined;
  /** Description */
  description: string;
  /** Recording information */
  recordingInfo?: {
    book: string;
    page: string;
    date: Date;
  } | undefined;
  /** Affected area description */
  affectedArea?: string | undefined;
}

/**
 * Easement types
 */
export type EasementType =
  | 'UTILITY'
  | 'ACCESS'
  | 'DRAINAGE'
  | 'CONSERVATION'
  | 'VIEW'
  | 'SOLAR'
  | 'PARTY_WALL'
  | 'RIGHT_OF_WAY'
  | 'OTHER';

/**
 * Property utility information
 */
export interface PropertyUtilities {
  /** Water source */
  water?: 'PUBLIC' | 'WELL' | 'CISTERN' | 'NONE' | undefined;
  /** Sewer type */
  sewer?: 'PUBLIC' | 'SEPTIC' | 'CESSPOOL' | 'NONE' | undefined;
  /** Electric provider */
  electric?: string | undefined;
  /** Gas provider/type */
  gas?: string | undefined;
  /** Internet providers available */
  internet?: readonly string[] | undefined;
  /** Trash service */
  trash?: string | undefined;
}

/**
 * Property creation input
 */
export interface CreatePropertyInput {
  /** Property type */
  type: PropertyType;
  /** Property address */
  address: Address;
  /** Legal description */
  legalDescription: LegalDescription;
  /** APN */
  apn?: string | undefined;
  /** Subdivision */
  subdivision?: string | undefined;
  /** Lot */
  lot?: string | undefined;
  /** Block */
  block?: string | undefined;
  /** Unit (for condos) */
  unit?: string | undefined;
  /** Tags */
  tags?: readonly string[] | undefined;
}

/**
 * Property search criteria
 */
export interface PropertySearchCriteria {
  /** Search query (matches address, APN, subdivision) */
  query?: string | undefined;
  /** Filter by property type */
  type?: PropertyType | readonly PropertyType[] | undefined;
  /** Filter by state */
  state?: string | undefined;
  /** Filter by county */
  county?: string | undefined;
  /** Filter by city */
  city?: string | undefined;
  /** Filter by ZIP code */
  zipCode?: string | undefined;
  /** Filter by subdivision */
  subdivision?: string | undefined;
  /** Filter by tags */
  tags?: readonly string[] | undefined;
}
