/**
 * Deadline calculation constants
 * @module constants/deadlines
 */

import { ContingencyType } from '../enums';

/**
 * Standard deadline definition
 */
export interface DeadlineDefinition {
  /** Deadline identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Days from base date (negative = before, positive = after) */
  daysOffset: number;
  /** Base date reference */
  baseDateReference: BaseDateReference;
  /** Calendar type for calculation */
  calendarType: 'CALENDAR' | 'BUSINESS';
  /** Whether this is a statutory/legal deadline */
  isStatutory: boolean;
  /** Responsible party */
  responsibleParty: 'BUYER' | 'SELLER' | 'LENDER' | 'TITLE' | 'ATTORNEY' | 'BOTH';
  /** Related contingency type */
  contingencyType?: ContingencyType | undefined;
  /** Default reminder days before deadline */
  reminderDays: readonly number[];
  /** Whether deadline is critical */
  isCritical: boolean;
  /** Consequence of missing */
  consequence?: string | undefined;
}

/**
 * Base date reference options
 */
export type BaseDateReference =
  | 'CONTRACT_DATE'
  | 'EFFECTIVE_DATE'
  | 'CLOSING_DATE'
  | 'INSPECTION_DATE'
  | 'APPRAISAL_DATE'
  | 'TITLE_COMMITMENT_DATE';

/**
 * Federal holidays (US)
 */
export const FEDERAL_HOLIDAYS: readonly { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 7, day: 4, name: 'Independence Day' },
  { month: 11, day: 11, name: "Veterans Day" },
  { month: 12, day: 25, name: 'Christmas Day' },
];

/**
 * Floating federal holidays (calculated dynamically)
 */
export const FLOATING_HOLIDAYS: readonly {
  name: string;
  month: number;
  weekday: number;
  occurrence: number;
}[] = [
  { name: 'MLK Day', month: 1, weekday: 1, occurrence: 3 }, // 3rd Monday of January
  { name: "Presidents' Day", month: 2, weekday: 1, occurrence: 3 }, // 3rd Monday of February
  { name: 'Memorial Day', month: 5, weekday: 1, occurrence: -1 }, // Last Monday of May
  { name: 'Labor Day', month: 9, weekday: 1, occurrence: 1 }, // 1st Monday of September
  { name: 'Columbus Day', month: 10, weekday: 1, occurrence: 2 }, // 2nd Monday of October
  { name: 'Thanksgiving', month: 11, weekday: 4, occurrence: 4 }, // 4th Thursday of November
];

/**
 * Standard real estate deadlines
 */
export const STANDARD_DEADLINES: readonly DeadlineDefinition[] = [
  {
    id: 'earnest_money',
    name: 'Earnest Money Due',
    description: 'Deadline for delivery of earnest money deposit',
    daysOffset: 3,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'BUSINESS',
    isStatutory: false,
    responsibleParty: 'BUYER',
    reminderDays: [1],
    isCritical: true,
    consequence: 'Contract may be voidable by seller',
  },
  {
    id: 'inspection',
    name: 'Inspection Deadline',
    description: 'Deadline for completion of property inspections',
    daysOffset: 10,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    contingencyType: ContingencyType.INSPECTION,
    reminderDays: [3, 1],
    isCritical: true,
    consequence: 'Inspection contingency may be deemed waived',
  },
  {
    id: 'inspection_response',
    name: 'Inspection Response',
    description: 'Deadline for buyer to submit inspection response',
    daysOffset: 12,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    contingencyType: ContingencyType.INSPECTION,
    reminderDays: [2, 1],
    isCritical: true,
    consequence: 'Buyer accepts property as-is',
  },
  {
    id: 'seller_inspection_response',
    name: 'Seller Inspection Response',
    description: 'Deadline for seller to respond to repair requests',
    daysOffset: 15,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'SELLER',
    contingencyType: ContingencyType.INSPECTION,
    reminderDays: [2, 1],
    isCritical: true,
    consequence: 'Deemed rejection of repair requests',
  },
  {
    id: 'due_diligence',
    name: 'Due Diligence Deadline',
    description: 'End of due diligence period',
    daysOffset: 14,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    contingencyType: ContingencyType.DUE_DILIGENCE,
    reminderDays: [5, 3, 1],
    isCritical: true,
    consequence: 'Buyer waives right to terminate for due diligence issues',
  },
  {
    id: 'appraisal',
    name: 'Appraisal Deadline',
    description: 'Deadline for appraisal completion',
    daysOffset: 14,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'LENDER',
    contingencyType: ContingencyType.APPRAISAL,
    reminderDays: [5, 2],
    isCritical: false,
  },
  {
    id: 'financing',
    name: 'Financing Deadline',
    description: 'Deadline for loan approval',
    daysOffset: 21,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    contingencyType: ContingencyType.FINANCING,
    reminderDays: [7, 3, 1],
    isCritical: true,
    consequence: 'Financing contingency may be waived',
  },
  {
    id: 'title_commitment',
    name: 'Title Commitment Delivery',
    description: 'Deadline for delivery of title commitment',
    daysOffset: 14,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'TITLE',
    contingencyType: ContingencyType.TITLE,
    reminderDays: [5, 2],
    isCritical: false,
  },
  {
    id: 'title_objection',
    name: 'Title Objection Deadline',
    description: 'Deadline for buyer to raise title objections',
    daysOffset: 21,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    contingencyType: ContingencyType.TITLE,
    reminderDays: [5, 2],
    isCritical: true,
    consequence: 'Title exceptions deemed accepted',
  },
  {
    id: 'survey',
    name: 'Survey Deadline',
    description: 'Deadline for survey delivery',
    daysOffset: 14,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    contingencyType: ContingencyType.SURVEY,
    reminderDays: [5, 2],
    isCritical: false,
  },
  {
    id: 'hoa_docs',
    name: 'HOA Documents Delivery',
    description: 'Deadline for delivery of HOA documents',
    daysOffset: 7,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'SELLER',
    contingencyType: ContingencyType.HOA_REVIEW,
    reminderDays: [3, 1],
    isCritical: false,
  },
  {
    id: 'hoa_review',
    name: 'HOA Review Deadline',
    description: 'Deadline for buyer to review and approve HOA documents',
    daysOffset: 14,
    baseDateReference: 'EFFECTIVE_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    contingencyType: ContingencyType.HOA_REVIEW,
    reminderDays: [3, 1],
    isCritical: true,
    consequence: 'HOA documents deemed accepted',
  },
  {
    id: 'closing_disclosure',
    name: 'Closing Disclosure Delivery',
    description: 'TRID deadline - CD must be received 3 business days before closing',
    daysOffset: -3,
    baseDateReference: 'CLOSING_DATE',
    calendarType: 'BUSINESS',
    isStatutory: true,
    responsibleParty: 'LENDER',
    reminderDays: [5],
    isCritical: true,
    consequence: 'Closing must be delayed',
  },
  {
    id: 'walk_through',
    name: 'Final Walk-Through',
    description: 'Final property walk-through',
    daysOffset: -1,
    baseDateReference: 'CLOSING_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BUYER',
    reminderDays: [3, 1],
    isCritical: false,
  },
  {
    id: 'closing',
    name: 'Closing Date',
    description: 'Scheduled closing date',
    daysOffset: 0,
    baseDateReference: 'CLOSING_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'BOTH',
    reminderDays: [7, 3, 1],
    isCritical: true,
    consequence: 'May trigger default provisions',
  },
  {
    id: 'possession',
    name: 'Possession Date',
    description: 'Buyer takes possession',
    daysOffset: 0,
    baseDateReference: 'CLOSING_DATE',
    calendarType: 'CALENDAR',
    isStatutory: false,
    responsibleParty: 'SELLER',
    reminderDays: [1],
    isCritical: false,
  },
  {
    id: 'recording',
    name: 'Recording Deadline',
    description: 'Deadline to record deed',
    daysOffset: 1,
    baseDateReference: 'CLOSING_DATE',
    calendarType: 'BUSINESS',
    isStatutory: false,
    responsibleParty: 'TITLE',
    reminderDays: [1],
    isCritical: true,
    consequence: 'Gap in title coverage',
  },
] as const;

/**
 * 1031 Exchange specific deadlines
 */
export const EXCHANGE_1031_DEADLINES: readonly DeadlineDefinition[] = [
  {
    id: '1031_identification',
    name: '45-Day Identification',
    description: 'Deadline to identify replacement properties',
    daysOffset: 45,
    baseDateReference: 'CLOSING_DATE', // Of relinquished property
    calendarType: 'CALENDAR',
    isStatutory: true,
    responsibleParty: 'BUYER',
    reminderDays: [14, 7, 3, 1],
    isCritical: true,
    consequence: 'Exchange fails - gain becomes taxable',
  },
  {
    id: '1031_exchange',
    name: '180-Day Exchange',
    description: 'Deadline to close on replacement property',
    daysOffset: 180,
    baseDateReference: 'CLOSING_DATE', // Of relinquished property
    calendarType: 'CALENDAR',
    isStatutory: true,
    responsibleParty: 'BUYER',
    reminderDays: [30, 14, 7, 3],
    isCritical: true,
    consequence: 'Exchange fails - gain becomes taxable',
  },
] as const;

/**
 * Get deadline definition by ID
 */
export const getDeadlineDefinition = (id: string): DeadlineDefinition | undefined =>
  [...STANDARD_DEADLINES, ...EXCHANGE_1031_DEADLINES].find((d) => d.id === id);

/**
 * Get deadlines by contingency type
 */
export const getDeadlinesByContingency = (
  contingencyType: ContingencyType
): readonly DeadlineDefinition[] =>
  STANDARD_DEADLINES.filter((d) => d.contingencyType === contingencyType);

/**
 * Get critical deadlines
 */
export const getCriticalDeadlines = (): readonly DeadlineDefinition[] =>
  [...STANDARD_DEADLINES, ...EXCHANGE_1031_DEADLINES].filter((d) => d.isCritical);

/**
 * Get statutory deadlines
 */
export const getStatutoryDeadlines = (): readonly DeadlineDefinition[] =>
  [...STANDARD_DEADLINES, ...EXCHANGE_1031_DEADLINES].filter((d) => d.isStatutory);
