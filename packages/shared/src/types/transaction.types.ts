/**
 * Transaction types for IronClad
 * @module types/transaction
 */

import type {
  TransactionType,
  TransactionStatus,
  ContingencyType,
  ContingencyStatus,
} from '../enums';

/**
 * Real estate transaction entity
 */
export interface Transaction {
  /** Unique transaction identifier */
  readonly id: string;
  /** Associated matter ID */
  matterId: string;
  /** Associated property ID */
  propertyId: string;
  /** Transaction type */
  type: TransactionType;
  /** Current status */
  status: TransactionStatus;
  /** Purchase/sale price */
  purchasePrice: number;
  /** Earnest money deposit amount */
  earnestMoney: number;
  /** Earnest money holder */
  earnestMoneyHolder?: EarnestMoneyHolder | undefined;
  /** Down payment amount */
  downPayment?: number | undefined;
  /** Financing information */
  financing?: FinancingInfo | undefined;
  /** Seller concessions */
  sellerConcessions?: number | undefined;
  /** Contract date */
  contractDate: Date;
  /** Effective date (if different from contract date) */
  effectiveDate: Date;
  /** Scheduled closing date */
  closingDate: Date;
  /** Actual closing date */
  actualClosingDate?: Date | undefined;
  /** Possession date */
  possessionDate?: Date | undefined;
  /** Extended closing dates */
  closingExtensions?: readonly ClosingExtension[] | undefined;
  /** Transaction contingencies */
  contingencies: readonly Contingency[];
  /** Key deadlines */
  deadlines: readonly TransactionDeadline[];
  /** Prorations and adjustments */
  prorations?: Prorations | undefined;
  /** Closing costs breakdown */
  closingCosts?: ClosingCosts | undefined;
  /** Title company information */
  titleCompany?: TitleCompanyInfo | undefined;
  /** Escrow information */
  escrow?: EscrowInfo | undefined;
  /** Commission information */
  commissions?: CommissionInfo | undefined;
  /** Home warranty information */
  homeWarranty?: HomeWarrantyInfo | undefined;
  /** Survey information */
  surveyInfo?: SurveyInfo | undefined;
  /** Inspection information */
  inspectionInfo?: InspectionInfo | undefined;
  /** 1031 exchange information */
  exchange1031?: Exchange1031Info | undefined;
  /** Special stipulations/provisions */
  specialStipulations?: string | undefined;
  /** Internal notes */
  notes?: string | undefined;
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
 * Earnest money holder information
 */
export interface EarnestMoneyHolder {
  /** Holder type */
  type: 'LISTING_BROKER' | 'SELLING_BROKER' | 'TITLE_COMPANY' | 'ATTORNEY' | 'ESCROW';
  /** Company/firm name */
  companyName: string;
  /** Contact name */
  contactName?: string | undefined;
  /** Contact phone */
  phone?: string | undefined;
  /** Contact email */
  email?: string | undefined;
  /** Date earnest money received */
  dateReceived?: Date | undefined;
  /** Check/wire reference */
  reference?: string | undefined;
}

/**
 * Financing information
 */
export interface FinancingInfo {
  /** Financing type */
  type: FinancingType;
  /** Loan amount */
  loanAmount?: number | undefined;
  /** Interest rate */
  interestRate?: number | undefined;
  /** Loan term (months) */
  loanTermMonths?: number | undefined;
  /** Loan type */
  loanType?: 'FIXED' | 'ARM' | 'INTEREST_ONLY' | 'BALLOON' | undefined;
  /** Lender name */
  lenderName?: string | undefined;
  /** Loan officer name */
  loanOfficer?: string | undefined;
  /** Loan officer email */
  loanOfficerEmail?: string | undefined;
  /** Loan officer phone */
  loanOfficerPhone?: string | undefined;
  /** Loan processor */
  loanProcessor?: string | undefined;
  /** Loan number */
  loanNumber?: string | undefined;
  /** Pre-approval date */
  preApprovalDate?: Date | undefined;
  /** Pre-approval amount */
  preApprovalAmount?: number | undefined;
  /** Appraisal ordered date */
  appraisalOrderedDate?: Date | undefined;
  /** Appraisal completed date */
  appraisalCompletedDate?: Date | undefined;
  /** Appraised value */
  appraisedValue?: number | undefined;
  /** Clear to close date */
  clearToCloseDate?: Date | undefined;
  /** PMI required */
  pmiRequired?: boolean | undefined;
  /** Estimated monthly payment */
  estimatedMonthlyPayment?: number | undefined;
}

/**
 * Financing types
 */
export type FinancingType =
  | 'CONVENTIONAL'
  | 'FHA'
  | 'VA'
  | 'USDA'
  | 'JUMBO'
  | 'PORTFOLIO'
  | 'HARD_MONEY'
  | 'SELLER_FINANCING'
  | 'CASH'
  | 'ASSUMPTION';

/**
 * Closing extension record
 */
export interface ClosingExtension {
  /** Original closing date */
  originalDate: Date;
  /** New closing date */
  newDate: Date;
  /** Reason for extension */
  reason: string;
  /** Extension fee (if any) */
  fee?: number | undefined;
  /** Amendment document ID */
  amendmentDocumentId?: string | undefined;
  /** Date approved */
  approvedDate: Date;
}

/**
 * Transaction contingency
 */
export interface Contingency {
  /** Contingency ID */
  readonly id: string;
  /** Contingency type */
  type: ContingencyType;
  /** Current status */
  status: ContingencyStatus;
  /** Description/details */
  description?: string | undefined;
  /** Start date */
  startDate: Date;
  /** Deadline date */
  deadlineDate: Date;
  /** Date satisfied/waived */
  satisfiedDate?: Date | undefined;
  /** Satisfied by party */
  satisfiedBy?: 'BUYER' | 'SELLER' | 'BOTH' | undefined;
  /** Related document IDs */
  documentIds?: readonly string[] | undefined;
  /** Notes */
  notes?: string | undefined;
}

/**
 * Transaction deadline
 */
export interface TransactionDeadline {
  /** Deadline ID */
  readonly id: string;
  /** Deadline type/name */
  type: string;
  /** Deadline description */
  description: string;
  /** Due date */
  dueDate: Date;
  /** Responsible party role */
  responsibleParty: 'BUYER' | 'SELLER' | 'BOTH' | 'LENDER' | 'TITLE' | 'ATTORNEY';
  /** Whether deadline is completed */
  isCompleted: boolean;
  /** Completion date */
  completedDate?: Date | undefined;
  /** Reminder days before */
  reminderDaysBefore?: number | undefined;
  /** Whether deadline is critical */
  isCritical: boolean;
  /** Notes */
  notes?: string | undefined;
}

/**
 * Prorations and adjustments for closing
 */
export interface Prorations {
  /** Proration date */
  prorationDate: Date;
  /** Days in year basis */
  daysInYear: 360 | 365 | 366;
  /** Property taxes */
  taxes?: ProrationItem | undefined;
  /** HOA dues */
  hoaDues?: ProrationItem | undefined;
  /** Rent (if applicable) */
  rent?: ProrationItem | undefined;
  /** Security deposits */
  securityDeposits?: number | undefined;
  /** Other prorations */
  other?: readonly ProrationItem[] | undefined;
}

/**
 * Individual proration item
 */
export interface ProrationItem {
  /** Item description */
  description: string;
  /** Annual/periodic amount */
  amount: number;
  /** Period (annual, monthly, quarterly) */
  period: 'ANNUAL' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL';
  /** Paid through date */
  paidThroughDate: Date;
  /** Credit to buyer */
  creditToBuyer: number;
  /** Credit to seller */
  creditToSeller: number;
}

/**
 * Closing costs breakdown
 */
export interface ClosingCosts {
  /** Buyer's closing costs */
  buyerCosts: readonly ClosingCostItem[];
  /** Seller's closing costs */
  sellerCosts: readonly ClosingCostItem[];
  /** Total buyer costs */
  totalBuyerCosts: number;
  /** Total seller costs */
  totalSellerCosts: number;
}

/**
 * Individual closing cost item
 */
export interface ClosingCostItem {
  /** Cost category */
  category: ClosingCostCategory;
  /** Item description */
  description: string;
  /** Amount */
  amount: number;
  /** Payee */
  payee?: string | undefined;
  /** POC (paid outside closing) */
  paidOutsideClosing: boolean;
}

/**
 * Closing cost categories
 */
export type ClosingCostCategory =
  | 'ORIGINATION'
  | 'APPRAISAL'
  | 'CREDIT_REPORT'
  | 'TITLE_INSURANCE'
  | 'TITLE_SEARCH'
  | 'SETTLEMENT_FEE'
  | 'RECORDING'
  | 'TRANSFER_TAX'
  | 'SURVEY'
  | 'INSPECTION'
  | 'ATTORNEY'
  | 'PREPAID_INTEREST'
  | 'PREPAID_INSURANCE'
  | 'PREPAID_TAXES'
  | 'ESCROW_RESERVES'
  | 'HOA'
  | 'HOME_WARRANTY'
  | 'COMMISSION'
  | 'OTHER';

/**
 * Title company information
 */
export interface TitleCompanyInfo {
  /** Company name */
  companyName: string;
  /** Office location */
  office?: string | undefined;
  /** Closer/settlement agent */
  closerName?: string | undefined;
  /** Email */
  email?: string | undefined;
  /** Phone */
  phone?: string | undefined;
  /** Title file/order number */
  fileNumber?: string | undefined;
  /** Underwriter */
  underwriter?: string | undefined;
}

/**
 * Escrow information
 */
export interface EscrowInfo {
  /** Escrow company */
  companyName: string;
  /** Escrow officer */
  officerName: string;
  /** Email */
  email?: string | undefined;
  /** Phone */
  phone?: string | undefined;
  /** Escrow number */
  escrowNumber?: string | undefined;
}

/**
 * Commission information
 */
export interface CommissionInfo {
  /** Total commission percentage */
  totalPercentage: number;
  /** Total commission amount */
  totalAmount: number;
  /** Listing side percentage */
  listingSidePercentage?: number | undefined;
  /** Listing side amount */
  listingSideAmount?: number | undefined;
  /** Selling side percentage */
  sellingSidePercentage?: number | undefined;
  /** Selling side amount */
  sellingSideAmount?: number | undefined;
  /** Commission splits */
  splits?: readonly CommissionSplit[] | undefined;
}

/**
 * Commission split
 */
export interface CommissionSplit {
  /** Recipient name/company */
  recipient: string;
  /** Percentage of side */
  percentage: number;
  /** Amount */
  amount: number;
  /** Side (listing or selling) */
  side: 'LISTING' | 'SELLING';
}

/**
 * Home warranty information
 */
export interface HomeWarrantyInfo {
  /** Provider name */
  provider: string;
  /** Plan name */
  planName?: string | undefined;
  /** Coverage amount/premium */
  premium: number;
  /** Paid by */
  paidBy: 'BUYER' | 'SELLER';
  /** Coverage start date */
  startDate?: Date | undefined;
  /** Policy number */
  policyNumber?: string | undefined;
}

/**
 * Survey information
 */
export interface SurveyInfo {
  /** Survey company */
  company: string;
  /** Surveyor name */
  surveyorName?: string | undefined;
  /** Survey type */
  surveyType: 'BOUNDARY' | 'ALTA' | 'LOCATION' | 'TOPOGRAPHIC' | 'AS_BUILT';
  /** Ordered date */
  orderedDate?: Date | undefined;
  /** Completed date */
  completedDate?: Date | undefined;
  /** Survey document ID */
  documentId?: string | undefined;
  /** Issues found */
  issues?: string | undefined;
}

/**
 * Inspection information
 */
export interface InspectionInfo {
  /** Inspections performed */
  inspections: readonly InspectionRecord[];
  /** Overall inspection status */
  overallStatus: 'PENDING' | 'COMPLETED' | 'ISSUES_FOUND' | 'REPAIRS_REQUESTED' | 'RESOLVED';
  /** Repair request amount */
  repairRequestAmount?: number | undefined;
  /** Repair credit received */
  repairCreditAmount?: number | undefined;
}

/**
 * Individual inspection record
 */
export interface InspectionRecord {
  /** Inspection type */
  type: InspectionType;
  /** Inspector name/company */
  inspector: string;
  /** Scheduled date */
  scheduledDate: Date;
  /** Completed date */
  completedDate?: Date | undefined;
  /** Report document ID */
  reportDocumentId?: string | undefined;
  /** Status */
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  /** Issues found summary */
  issuesSummary?: string | undefined;
  /** Cost */
  cost?: number | undefined;
}

/**
 * Inspection types
 */
export type InspectionType =
  | 'GENERAL'
  | 'TERMITE'
  | 'RADON'
  | 'MOLD'
  | 'ROOF'
  | 'FOUNDATION'
  | 'HVAC'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'POOL'
  | 'SEPTIC'
  | 'WELL'
  | 'CHIMNEY'
  | 'LEAD'
  | 'ASBESTOS'
  | 'ENVIRONMENTAL';

/**
 * 1031 Exchange information
 */
export interface Exchange1031Info {
  /** Exchange type */
  exchangeType: 'DELAYED' | 'SIMULTANEOUS' | 'REVERSE' | 'IMPROVEMENT';
  /** Qualified intermediary */
  intermediary: {
    companyName: string;
    contactName?: string;
    email?: string;
    phone?: string;
  };
  /** Exchange number */
  exchangeNumber?: string | undefined;
  /** Relinquished property closing date */
  relinquishedClosingDate?: Date | undefined;
  /** 45-day identification deadline */
  identificationDeadline: Date;
  /** 180-day exchange deadline */
  exchangeDeadline: Date;
  /** Identified replacement properties */
  identifiedProperties?: readonly string[] | undefined;
  /** Exchange amount */
  exchangeAmount: number;
  /** Boot (taxable portion) */
  bootAmount?: number | undefined;
}

/**
 * Transaction creation input
 */
export interface CreateTransactionInput {
  /** Matter ID */
  matterId: string;
  /** Property ID */
  propertyId: string;
  /** Transaction type */
  type: TransactionType;
  /** Purchase price */
  purchasePrice: number;
  /** Earnest money */
  earnestMoney: number;
  /** Contract date */
  contractDate: Date;
  /** Closing date */
  closingDate: Date;
  /** Financing info */
  financing?: Partial<FinancingInfo> | undefined;
}

/**
 * Transaction search criteria
 */
export interface TransactionSearchCriteria {
  /** Filter by matter ID */
  matterId?: string | undefined;
  /** Filter by property ID */
  propertyId?: string | undefined;
  /** Filter by transaction type */
  type?: TransactionType | readonly TransactionType[] | undefined;
  /** Filter by status */
  status?: TransactionStatus | readonly TransactionStatus[] | undefined;
  /** Filter by closing date range */
  closingDateFrom?: Date | undefined;
  closingDateTo?: Date | undefined;
  /** Filter by price range */
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
}
