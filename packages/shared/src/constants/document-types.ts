/**
 * Document type constants and categories
 * @module constants/document-types
 */

import { DocumentType } from '../enums';

/**
 * Document category grouping
 */
export interface DocumentCategory {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description: string;
  /** Document types in this category */
  documentTypes: readonly DocumentType[];
}

/**
 * Document type metadata
 */
export interface DocumentTypeInfo {
  /** Document type */
  type: DocumentType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Category ID */
  categoryId: string;
  /** Typical file extensions */
  extensions: readonly string[];
  /** Whether document typically requires signatures */
  requiresSignature: boolean;
  /** Whether document is typically recorded */
  isRecordable: boolean;
  /** Whether AI processing is recommended */
  aiProcessingRecommended: boolean;
  /** Default retention period (years) */
  retentionYears: number;
}

/**
 * Document categories
 */
export const DOCUMENT_CATEGORIES: readonly DocumentCategory[] = [
  {
    id: 'contracts',
    name: 'Contracts & Agreements',
    description: 'Purchase agreements, amendments, and related contract documents',
    documentTypes: [
      DocumentType.CONTRACT,
      DocumentType.AMENDMENT,
      DocumentType.ADDENDUM,
      DocumentType.LEASE,
      DocumentType.ASSIGNMENT,
    ],
  },
  {
    id: 'conveyance',
    name: 'Conveyance Documents',
    description: 'Deeds and documents that transfer property ownership',
    documentTypes: [
      DocumentType.DEED_WARRANTY,
      DocumentType.DEED_QUITCLAIM,
      DocumentType.DEED_SPECIAL_WARRANTY,
    ],
  },
  {
    id: 'financing',
    name: 'Financing Documents',
    description: 'Mortgages, notes, and loan-related documents',
    documentTypes: [
      DocumentType.DEED_OF_TRUST,
      DocumentType.MORTGAGE,
      DocumentType.PROMISSORY_NOTE,
      DocumentType.SUBORDINATION,
    ],
  },
  {
    id: 'title',
    name: 'Title Documents',
    description: 'Title commitments, policies, and searches',
    documentTypes: [
      DocumentType.TITLE_COMMITMENT,
      DocumentType.TITLE_POLICY,
      DocumentType.TITLE_SEARCH,
      DocumentType.LIEN,
      DocumentType.RELEASE,
    ],
  },
  {
    id: 'closing',
    name: 'Closing Documents',
    description: 'Settlement statements and closing disclosures',
    documentTypes: [
      DocumentType.CLOSING_DISCLOSURE,
      DocumentType.HUD1,
      DocumentType.ALTA_SETTLEMENT,
    ],
  },
  {
    id: 'diligence',
    name: 'Due Diligence',
    description: 'Surveys, inspections, and appraisals',
    documentTypes: [
      DocumentType.SURVEY,
      DocumentType.INSPECTION,
      DocumentType.APPRAISAL,
      DocumentType.HOA_DOCS,
      DocumentType.ESTOPPEL,
    ],
  },
  {
    id: 'authority',
    name: 'Authority Documents',
    description: 'Powers of attorney and affidavits',
    documentTypes: [DocumentType.POWER_OF_ATTORNEY, DocumentType.AFFIDAVIT],
  },
  {
    id: 'correspondence',
    name: 'Correspondence',
    description: 'Letters, memos, and communications',
    documentTypes: [DocumentType.CORRESPONDENCE, DocumentType.MEMO],
  },
  {
    id: 'other',
    name: 'Other Documents',
    description: 'Miscellaneous documents',
    documentTypes: [DocumentType.OTHER],
  },
] as const;

/**
 * Document type information registry
 */
export const DOCUMENT_TYPE_INFO: Record<DocumentType, DocumentTypeInfo> = {
  [DocumentType.CONTRACT]: {
    type: DocumentType.CONTRACT,
    name: 'Purchase Agreement',
    description: 'Real estate purchase and sale agreement',
    categoryId: 'contracts',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.AMENDMENT]: {
    type: DocumentType.AMENDMENT,
    name: 'Amendment',
    description: 'Amendment to existing contract',
    categoryId: 'contracts',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.ADDENDUM]: {
    type: DocumentType.ADDENDUM,
    name: 'Addendum',
    description: 'Addendum to existing contract',
    categoryId: 'contracts',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.DEED_WARRANTY]: {
    type: DocumentType.DEED_WARRANTY,
    name: 'Warranty Deed',
    description: 'General warranty deed with full covenants',
    categoryId: 'conveyance',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.DEED_QUITCLAIM]: {
    type: DocumentType.DEED_QUITCLAIM,
    name: 'Quitclaim Deed',
    description: 'Quitclaim deed without warranties',
    categoryId: 'conveyance',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.DEED_SPECIAL_WARRANTY]: {
    type: DocumentType.DEED_SPECIAL_WARRANTY,
    name: 'Special Warranty Deed',
    description: 'Special warranty deed with limited covenants',
    categoryId: 'conveyance',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.DEED_OF_TRUST]: {
    type: DocumentType.DEED_OF_TRUST,
    name: 'Deed of Trust',
    description: 'Security instrument for loan',
    categoryId: 'financing',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.MORTGAGE]: {
    type: DocumentType.MORTGAGE,
    name: 'Mortgage',
    description: 'Mortgage security instrument',
    categoryId: 'financing',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.PROMISSORY_NOTE]: {
    type: DocumentType.PROMISSORY_NOTE,
    name: 'Promissory Note',
    description: 'Loan promissory note',
    categoryId: 'financing',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 30,
  },
  [DocumentType.TITLE_COMMITMENT]: {
    type: DocumentType.TITLE_COMMITMENT,
    name: 'Title Commitment',
    description: 'Preliminary title insurance commitment',
    categoryId: 'title',
    extensions: ['.pdf'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.TITLE_POLICY]: {
    type: DocumentType.TITLE_POLICY,
    name: 'Title Policy',
    description: 'Title insurance policy',
    categoryId: 'title',
    extensions: ['.pdf'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.TITLE_SEARCH]: {
    type: DocumentType.TITLE_SEARCH,
    name: 'Title Search',
    description: 'Title examination report',
    categoryId: 'title',
    extensions: ['.pdf', '.docx'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.SURVEY]: {
    type: DocumentType.SURVEY,
    name: 'Survey',
    description: 'Property survey or plat',
    categoryId: 'diligence',
    extensions: ['.pdf', '.dwg', '.dxf'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: false,
    retentionYears: 10,
  },
  [DocumentType.CLOSING_DISCLOSURE]: {
    type: DocumentType.CLOSING_DISCLOSURE,
    name: 'Closing Disclosure',
    description: 'TRID Closing Disclosure form',
    categoryId: 'closing',
    extensions: ['.pdf'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.HUD1]: {
    type: DocumentType.HUD1,
    name: 'HUD-1 Settlement Statement',
    description: 'HUD-1 settlement statement',
    categoryId: 'closing',
    extensions: ['.pdf'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.ALTA_SETTLEMENT]: {
    type: DocumentType.ALTA_SETTLEMENT,
    name: 'ALTA Settlement Statement',
    description: 'ALTA combined settlement statement',
    categoryId: 'closing',
    extensions: ['.pdf'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.POWER_OF_ATTORNEY]: {
    type: DocumentType.POWER_OF_ATTORNEY,
    name: 'Power of Attorney',
    description: 'Power of attorney document',
    categoryId: 'authority',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.AFFIDAVIT]: {
    type: DocumentType.AFFIDAVIT,
    name: 'Affidavit',
    description: 'Sworn affidavit document',
    categoryId: 'authority',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.LEASE]: {
    type: DocumentType.LEASE,
    name: 'Lease Agreement',
    description: 'Real property lease agreement',
    categoryId: 'contracts',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.ASSIGNMENT]: {
    type: DocumentType.ASSIGNMENT,
    name: 'Assignment',
    description: 'Assignment of contract or interest',
    categoryId: 'contracts',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.RELEASE]: {
    type: DocumentType.RELEASE,
    name: 'Release/Satisfaction',
    description: 'Release or satisfaction of lien',
    categoryId: 'title',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.LIEN]: {
    type: DocumentType.LIEN,
    name: 'Lien Document',
    description: 'Lien or encumbrance document',
    categoryId: 'title',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 99,
  },
  [DocumentType.SUBORDINATION]: {
    type: DocumentType.SUBORDINATION,
    name: 'Subordination Agreement',
    description: 'Lien subordination agreement',
    categoryId: 'financing',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: true,
    aiProcessingRecommended: true,
    retentionYears: 30,
  },
  [DocumentType.ESTOPPEL]: {
    type: DocumentType.ESTOPPEL,
    name: 'Estoppel Certificate',
    description: 'HOA or lender estoppel certificate',
    categoryId: 'diligence',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: true,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.HOA_DOCS]: {
    type: DocumentType.HOA_DOCS,
    name: 'HOA Documents',
    description: 'HOA governing documents and disclosures',
    categoryId: 'diligence',
    extensions: ['.pdf'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.INSPECTION]: {
    type: DocumentType.INSPECTION,
    name: 'Inspection Report',
    description: 'Property inspection report',
    categoryId: 'diligence',
    extensions: ['.pdf'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.APPRAISAL]: {
    type: DocumentType.APPRAISAL,
    name: 'Appraisal Report',
    description: 'Property appraisal report',
    categoryId: 'diligence',
    extensions: ['.pdf'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: true,
    retentionYears: 10,
  },
  [DocumentType.CORRESPONDENCE]: {
    type: DocumentType.CORRESPONDENCE,
    name: 'Correspondence',
    description: 'Letters and communications',
    categoryId: 'correspondence',
    extensions: ['.pdf', '.docx', '.doc', '.eml', '.msg'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: false,
    retentionYears: 7,
  },
  [DocumentType.MEMO]: {
    type: DocumentType.MEMO,
    name: 'Internal Memo',
    description: 'Internal memorandum',
    categoryId: 'correspondence',
    extensions: ['.pdf', '.docx', '.doc'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: false,
    retentionYears: 7,
  },
  [DocumentType.OTHER]: {
    type: DocumentType.OTHER,
    name: 'Other Document',
    description: 'Miscellaneous document',
    categoryId: 'other',
    extensions: ['.pdf', '.docx', '.doc', '.xlsx', '.xls'],
    requiresSignature: false,
    isRecordable: false,
    aiProcessingRecommended: false,
    retentionYears: 7,
  },
} as const;

/**
 * Get document type info
 */
export const getDocumentTypeInfo = (type: DocumentType): DocumentTypeInfo =>
  DOCUMENT_TYPE_INFO[type];

/**
 * Get documents by category
 */
export const getDocumentsByCategory = (categoryId: string): readonly DocumentType[] => {
  const category = DOCUMENT_CATEGORIES.find((c) => c.id === categoryId);
  return category?.documentTypes ?? [];
};

/**
 * Get recordable document types
 */
export const RECORDABLE_DOCUMENT_TYPES = Object.values(DOCUMENT_TYPE_INFO)
  .filter((info) => info.isRecordable)
  .map((info) => info.type);

/**
 * Get document types requiring signatures
 */
export const SIGNATURE_REQUIRED_TYPES = Object.values(DOCUMENT_TYPE_INFO)
  .filter((info) => info.requiresSignature)
  .map((info) => info.type);
