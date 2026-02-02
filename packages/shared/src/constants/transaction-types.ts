/**
 * Transaction type constants
 * @module constants/transaction-types
 */

import { TransactionType, ContingencyType, MatterType } from '../enums';

/**
 * Transaction type metadata
 */
export interface TransactionTypeInfo {
  /** Transaction type */
  type: TransactionType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Related matter types */
  matterTypes: readonly MatterType[];
  /** Default contingencies for this type */
  defaultContingencies: readonly ContingencyType[];
  /** Typical closing timeline (days) */
  typicalClosingDays: number;
  /** Whether financing is typically involved */
  typicallyFinanced: boolean;
}

/**
 * Transaction type information registry
 */
export const TRANSACTION_TYPE_INFO: Record<TransactionType, TransactionTypeInfo> = {
  [TransactionType.PURCHASE]: {
    type: TransactionType.PURCHASE,
    name: 'Purchase',
    description: 'Standard real estate purchase transaction',
    matterTypes: [MatterType.RESIDENTIAL_PURCHASE, MatterType.COMMERCIAL_PURCHASE],
    defaultContingencies: [
      ContingencyType.FINANCING,
      ContingencyType.APPRAISAL,
      ContingencyType.INSPECTION,
      ContingencyType.TITLE,
    ],
    typicalClosingDays: 30,
    typicallyFinanced: true,
  },
  [TransactionType.SALE]: {
    type: TransactionType.SALE,
    name: 'Sale',
    description: 'Standard real estate sale transaction',
    matterTypes: [MatterType.RESIDENTIAL_SALE, MatterType.COMMERCIAL_SALE],
    defaultContingencies: [ContingencyType.TITLE],
    typicalClosingDays: 30,
    typicallyFinanced: false,
  },
  [TransactionType.REFINANCE]: {
    type: TransactionType.REFINANCE,
    name: 'Refinance',
    description: 'Mortgage refinance transaction',
    matterTypes: [MatterType.REFINANCE_RESIDENTIAL, MatterType.REFINANCE_COMMERCIAL],
    defaultContingencies: [ContingencyType.APPRAISAL, ContingencyType.TITLE],
    typicalClosingDays: 45,
    typicallyFinanced: true,
  },
  [TransactionType.HOME_EQUITY]: {
    type: TransactionType.HOME_EQUITY,
    name: 'Home Equity Loan',
    description: 'Home equity loan or line of credit',
    matterTypes: [MatterType.REFINANCE_RESIDENTIAL],
    defaultContingencies: [ContingencyType.APPRAISAL, ContingencyType.TITLE],
    typicalClosingDays: 30,
    typicallyFinanced: true,
  },
  [TransactionType.LEASE]: {
    type: TransactionType.LEASE,
    name: 'Lease',
    description: 'Property lease transaction',
    matterTypes: [MatterType.LEASE_RESIDENTIAL, MatterType.LEASE_COMMERCIAL],
    defaultContingencies: [],
    typicalClosingDays: 14,
    typicallyFinanced: false,
  },
  [TransactionType.LEASE_OPTION]: {
    type: TransactionType.LEASE_OPTION,
    name: 'Lease with Option',
    description: 'Lease with option to purchase',
    matterTypes: [MatterType.LEASE_RESIDENTIAL, MatterType.LEASE_COMMERCIAL],
    defaultContingencies: [ContingencyType.INSPECTION],
    typicalClosingDays: 14,
    typicallyFinanced: false,
  },
  [TransactionType.EXCHANGE_1031_SELL]: {
    type: TransactionType.EXCHANGE_1031_SELL,
    name: '1031 Exchange - Sell',
    description: '1031 exchange relinquished property sale',
    matterTypes: [MatterType.EXCHANGE_1031],
    defaultContingencies: [ContingencyType.TITLE],
    typicalClosingDays: 30,
    typicallyFinanced: false,
  },
  [TransactionType.EXCHANGE_1031_BUY]: {
    type: TransactionType.EXCHANGE_1031_BUY,
    name: '1031 Exchange - Buy',
    description: '1031 exchange replacement property purchase',
    matterTypes: [MatterType.EXCHANGE_1031],
    defaultContingencies: [ContingencyType.TITLE, ContingencyType.INSPECTION],
    typicalClosingDays: 30,
    typicallyFinanced: true,
  },
  [TransactionType.FSBO]: {
    type: TransactionType.FSBO,
    name: 'For Sale By Owner',
    description: 'For sale by owner transaction',
    matterTypes: [MatterType.RESIDENTIAL_PURCHASE, MatterType.RESIDENTIAL_SALE],
    defaultContingencies: [
      ContingencyType.FINANCING,
      ContingencyType.APPRAISAL,
      ContingencyType.INSPECTION,
      ContingencyType.TITLE,
    ],
    typicalClosingDays: 30,
    typicallyFinanced: true,
  },
  [TransactionType.REO]: {
    type: TransactionType.REO,
    name: 'REO/Bank Owned',
    description: 'Bank-owned property sale',
    matterTypes: [MatterType.RESIDENTIAL_PURCHASE, MatterType.COMMERCIAL_PURCHASE],
    defaultContingencies: [
      ContingencyType.FINANCING,
      ContingencyType.APPRAISAL,
      ContingencyType.TITLE,
    ],
    typicalClosingDays: 45,
    typicallyFinanced: true,
  },
  [TransactionType.SHORT_SALE]: {
    type: TransactionType.SHORT_SALE,
    name: 'Short Sale',
    description: 'Sale for less than mortgage balance',
    matterTypes: [MatterType.SHORT_SALE],
    defaultContingencies: [
      ContingencyType.FINANCING,
      ContingencyType.APPRAISAL,
      ContingencyType.INSPECTION,
      ContingencyType.TITLE,
    ],
    typicalClosingDays: 90,
    typicallyFinanced: true,
  },
  [TransactionType.FORECLOSURE]: {
    type: TransactionType.FORECLOSURE,
    name: 'Foreclosure',
    description: 'Foreclosure sale transaction',
    matterTypes: [MatterType.FORECLOSURE],
    defaultContingencies: [ContingencyType.TITLE],
    typicalClosingDays: 30,
    typicallyFinanced: false,
  },
  [TransactionType.AUCTION]: {
    type: TransactionType.AUCTION,
    name: 'Auction Sale',
    description: 'Property sold at auction',
    matterTypes: [MatterType.RESIDENTIAL_PURCHASE, MatterType.COMMERCIAL_PURCHASE],
    defaultContingencies: [ContingencyType.TITLE],
    typicalClosingDays: 30,
    typicallyFinanced: false,
  },
  [TransactionType.GIFT]: {
    type: TransactionType.GIFT,
    name: 'Gift Transfer',
    description: 'Property transfer by gift',
    matterTypes: [MatterType.RESIDENTIAL_SALE],
    defaultContingencies: [],
    typicalClosingDays: 14,
    typicallyFinanced: false,
  },
  [TransactionType.ESTATE_TRANSFER]: {
    type: TransactionType.ESTATE_TRANSFER,
    name: 'Estate Transfer',
    description: 'Transfer from estate/probate',
    matterTypes: [MatterType.ESTATE_SALE],
    defaultContingencies: [ContingencyType.TITLE],
    typicalClosingDays: 60,
    typicallyFinanced: false,
  },
} as const;

/**
 * Contingency type metadata
 */
export interface ContingencyTypeInfo {
  /** Contingency type */
  type: ContingencyType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Typical duration (days) */
  typicalDays: number;
  /** Can be waived by buyer */
  buyerCanWaive: boolean;
  /** Party responsible for satisfying */
  responsibleParty: 'BUYER' | 'SELLER' | 'LENDER' | 'THIRD_PARTY';
}

/**
 * Contingency type information registry
 */
export const CONTINGENCY_TYPE_INFO: Record<ContingencyType, ContingencyTypeInfo> = {
  [ContingencyType.FINANCING]: {
    type: ContingencyType.FINANCING,
    name: 'Financing Contingency',
    description: 'Buyer must obtain financing approval',
    typicalDays: 21,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.APPRAISAL]: {
    type: ContingencyType.APPRAISAL,
    name: 'Appraisal Contingency',
    description: 'Property must appraise at or above purchase price',
    typicalDays: 14,
    buyerCanWaive: true,
    responsibleParty: 'LENDER',
  },
  [ContingencyType.INSPECTION]: {
    type: ContingencyType.INSPECTION,
    name: 'Inspection Contingency',
    description: 'Property inspection and acceptance',
    typicalDays: 10,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.TITLE]: {
    type: ContingencyType.TITLE,
    name: 'Title Contingency',
    description: 'Clear and marketable title',
    typicalDays: 14,
    buyerCanWaive: false,
    responsibleParty: 'SELLER',
  },
  [ContingencyType.SURVEY]: {
    type: ContingencyType.SURVEY,
    name: 'Survey Contingency',
    description: 'Satisfactory property survey',
    typicalDays: 14,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.HOA_REVIEW]: {
    type: ContingencyType.HOA_REVIEW,
    name: 'HOA Review Contingency',
    description: 'Review and acceptance of HOA documents',
    typicalDays: 7,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.ATTORNEY_REVIEW]: {
    type: ContingencyType.ATTORNEY_REVIEW,
    name: 'Attorney Review Contingency',
    description: 'Attorney review and approval of contract',
    typicalDays: 5,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.SALE_OF_PROPERTY]: {
    type: ContingencyType.SALE_OF_PROPERTY,
    name: 'Sale of Property Contingency',
    description: "Contingent on sale of buyer's existing property",
    typicalDays: 60,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.INSURANCE]: {
    type: ContingencyType.INSURANCE,
    name: 'Insurance Contingency',
    description: 'Ability to obtain acceptable insurance',
    typicalDays: 14,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.ENVIRONMENTAL]: {
    type: ContingencyType.ENVIRONMENTAL,
    name: 'Environmental Contingency',
    description: 'Environmental assessment and clearance',
    typicalDays: 21,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.ZONING]: {
    type: ContingencyType.ZONING,
    name: 'Zoning Contingency',
    description: 'Zoning verification or approval',
    typicalDays: 14,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
  [ContingencyType.DUE_DILIGENCE]: {
    type: ContingencyType.DUE_DILIGENCE,
    name: 'Due Diligence Contingency',
    description: 'General due diligence period',
    typicalDays: 14,
    buyerCanWaive: true,
    responsibleParty: 'BUYER',
  },
} as const;

/**
 * Get transaction type info
 */
export const getTransactionTypeInfo = (type: TransactionType): TransactionTypeInfo =>
  TRANSACTION_TYPE_INFO[type];

/**
 * Get contingency type info
 */
export const getContingencyTypeInfo = (type: ContingencyType): ContingencyTypeInfo =>
  CONTINGENCY_TYPE_INFO[type];

/**
 * Get default contingencies for a transaction type
 */
export const getDefaultContingencies = (type: TransactionType): readonly ContingencyType[] =>
  TRANSACTION_TYPE_INFO[type].defaultContingencies;

/**
 * Get all transaction types for a matter type
 */
export const getTransactionTypesForMatter = (matterType: MatterType): readonly TransactionType[] =>
  (Object.values(TRANSACTION_TYPE_INFO) as TransactionTypeInfo[])
    .filter((info) => info.matterTypes.includes(matterType))
    .map((info) => info.type);
