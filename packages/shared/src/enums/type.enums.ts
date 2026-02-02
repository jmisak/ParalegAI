/**
 * Type enumerations for IronClad entities
 * @module enums/type
 */

/**
 * Types of legal matters handled
 */
export enum MatterType {
  /** Residential purchase transaction */
  RESIDENTIAL_PURCHASE = 'RESIDENTIAL_PURCHASE',
  /** Residential sale transaction */
  RESIDENTIAL_SALE = 'RESIDENTIAL_SALE',
  /** Commercial purchase transaction */
  COMMERCIAL_PURCHASE = 'COMMERCIAL_PURCHASE',
  /** Commercial sale transaction */
  COMMERCIAL_SALE = 'COMMERCIAL_SALE',
  /** Residential refinance */
  REFINANCE_RESIDENTIAL = 'REFINANCE_RESIDENTIAL',
  /** Commercial refinance */
  REFINANCE_COMMERCIAL = 'REFINANCE_COMMERCIAL',
  /** Residential lease transaction */
  LEASE_RESIDENTIAL = 'LEASE_RESIDENTIAL',
  /** Commercial lease transaction */
  LEASE_COMMERCIAL = 'LEASE_COMMERCIAL',
  /** Title examination only */
  TITLE_EXAMINATION = 'TITLE_EXAMINATION',
  /** Title curative work */
  TITLE_CURATIVE = 'TITLE_CURATIVE',
  /** 1031 exchange */
  EXCHANGE_1031 = 'EXCHANGE_1031',
  /** Foreclosure representation */
  FORECLOSURE = 'FORECLOSURE',
  /** Short sale transaction */
  SHORT_SALE = 'SHORT_SALE',
  /** Estate/probate real estate */
  ESTATE_SALE = 'ESTATE_SALE',
  /** New construction */
  NEW_CONSTRUCTION = 'NEW_CONSTRUCTION',
  /** Land/lot sale */
  LAND_SALE = 'LAND_SALE',
  /** Condominium conversion */
  CONDO_CONVERSION = 'CONDO_CONVERSION',
  /** General real estate consultation */
  CONSULTATION = 'CONSULTATION',
}

/**
 * Types of real estate properties
 */
export enum PropertyType {
  /** Single family residence */
  SINGLE_FAMILY = 'SINGLE_FAMILY',
  /** Condominium unit */
  CONDOMINIUM = 'CONDOMINIUM',
  /** Townhouse */
  TOWNHOUSE = 'TOWNHOUSE',
  /** Multi-family (2-4 units) */
  MULTI_FAMILY = 'MULTI_FAMILY',
  /** Apartment building (5+ units) */
  APARTMENT_BUILDING = 'APARTMENT_BUILDING',
  /** Cooperative unit */
  COOPERATIVE = 'COOPERATIVE',
  /** Manufactured/mobile home */
  MANUFACTURED = 'MANUFACTURED',
  /** Vacant land */
  VACANT_LAND = 'VACANT_LAND',
  /** Commercial office */
  COMMERCIAL_OFFICE = 'COMMERCIAL_OFFICE',
  /** Commercial retail */
  COMMERCIAL_RETAIL = 'COMMERCIAL_RETAIL',
  /** Industrial property */
  INDUSTRIAL = 'INDUSTRIAL',
  /** Mixed use property */
  MIXED_USE = 'MIXED_USE',
  /** Agricultural/farm */
  AGRICULTURAL = 'AGRICULTURAL',
  /** Planned unit development */
  PUD = 'PUD',
}

/**
 * Types of parties involved in transactions
 */
export enum PartyType {
  /** Individual person */
  INDIVIDUAL = 'INDIVIDUAL',
  /** Married couple */
  MARRIED_COUPLE = 'MARRIED_COUPLE',
  /** Corporation */
  CORPORATION = 'CORPORATION',
  /** Limited liability company */
  LLC = 'LLC',
  /** Partnership */
  PARTNERSHIP = 'PARTNERSHIP',
  /** Limited partnership */
  LIMITED_PARTNERSHIP = 'LIMITED_PARTNERSHIP',
  /** Trust */
  TRUST = 'TRUST',
  /** Estate */
  ESTATE = 'ESTATE',
  /** Government entity */
  GOVERNMENT = 'GOVERNMENT',
  /** Non-profit organization */
  NON_PROFIT = 'NON_PROFIT',
}

/**
 * Document categories
 */
export enum DocumentType {
  /** Purchase and sale agreement */
  CONTRACT = 'CONTRACT',
  /** Amendment to contract */
  AMENDMENT = 'AMENDMENT',
  /** Addendum to contract */
  ADDENDUM = 'ADDENDUM',
  /** Warranty deed */
  DEED_WARRANTY = 'DEED_WARRANTY',
  /** Quitclaim deed */
  DEED_QUITCLAIM = 'DEED_QUITCLAIM',
  /** Special warranty deed */
  DEED_SPECIAL_WARRANTY = 'DEED_SPECIAL_WARRANTY',
  /** Deed of trust */
  DEED_OF_TRUST = 'DEED_OF_TRUST',
  /** Mortgage document */
  MORTGAGE = 'MORTGAGE',
  /** Promissory note */
  PROMISSORY_NOTE = 'PROMISSORY_NOTE',
  /** Title commitment */
  TITLE_COMMITMENT = 'TITLE_COMMITMENT',
  /** Title policy */
  TITLE_POLICY = 'TITLE_POLICY',
  /** Title search */
  TITLE_SEARCH = 'TITLE_SEARCH',
  /** Survey */
  SURVEY = 'SURVEY',
  /** Closing disclosure */
  CLOSING_DISCLOSURE = 'CLOSING_DISCLOSURE',
  /** HUD-1 settlement statement */
  HUD1 = 'HUD1',
  /** ALTA settlement statement */
  ALTA_SETTLEMENT = 'ALTA_SETTLEMENT',
  /** Power of attorney */
  POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
  /** Affidavit */
  AFFIDAVIT = 'AFFIDAVIT',
  /** Lease agreement */
  LEASE = 'LEASE',
  /** Assignment */
  ASSIGNMENT = 'ASSIGNMENT',
  /** Release/satisfaction */
  RELEASE = 'RELEASE',
  /** Lien document */
  LIEN = 'LIEN',
  /** Subordination agreement */
  SUBORDINATION = 'SUBORDINATION',
  /** Estoppel certificate */
  ESTOPPEL = 'ESTOPPEL',
  /** HOA documents */
  HOA_DOCS = 'HOA_DOCS',
  /** Inspection report */
  INSPECTION = 'INSPECTION',
  /** Appraisal report */
  APPRAISAL = 'APPRAISAL',
  /** Correspondence/letter */
  CORRESPONDENCE = 'CORRESPONDENCE',
  /** Internal memo */
  MEMO = 'MEMO',
  /** Other/miscellaneous */
  OTHER = 'OTHER',
}

/**
 * Transaction types
 */
export enum TransactionType {
  /** Standard purchase */
  PURCHASE = 'PURCHASE',
  /** Standard sale */
  SALE = 'SALE',
  /** Refinance */
  REFINANCE = 'REFINANCE',
  /** Home equity loan */
  HOME_EQUITY = 'HOME_EQUITY',
  /** Lease transaction */
  LEASE = 'LEASE',
  /** Lease with option to purchase */
  LEASE_OPTION = 'LEASE_OPTION',
  /** 1031 exchange (sell side) */
  EXCHANGE_1031_SELL = 'EXCHANGE_1031_SELL',
  /** 1031 exchange (buy side) */
  EXCHANGE_1031_BUY = 'EXCHANGE_1031_BUY',
  /** For sale by owner */
  FSBO = 'FSBO',
  /** REO/bank owned */
  REO = 'REO',
  /** Short sale */
  SHORT_SALE = 'SHORT_SALE',
  /** Foreclosure */
  FORECLOSURE = 'FORECLOSURE',
  /** Auction sale */
  AUCTION = 'AUCTION',
  /** Gift transfer */
  GIFT = 'GIFT',
  /** Estate transfer */
  ESTATE_TRANSFER = 'ESTATE_TRANSFER',
}

/**
 * Contingency types in transactions
 */
export enum ContingencyType {
  /** Financing/mortgage contingency */
  FINANCING = 'FINANCING',
  /** Appraisal contingency */
  APPRAISAL = 'APPRAISAL',
  /** Inspection contingency */
  INSPECTION = 'INSPECTION',
  /** Title contingency */
  TITLE = 'TITLE',
  /** Survey contingency */
  SURVEY = 'SURVEY',
  /** HOA review contingency */
  HOA_REVIEW = 'HOA_REVIEW',
  /** Attorney review contingency */
  ATTORNEY_REVIEW = 'ATTORNEY_REVIEW',
  /** Sale of buyer's property */
  SALE_OF_PROPERTY = 'SALE_OF_PROPERTY',
  /** Insurance contingency */
  INSURANCE = 'INSURANCE',
  /** Environmental contingency */
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  /** Zoning contingency */
  ZONING = 'ZONING',
  /** Due diligence (general) */
  DUE_DILIGENCE = 'DUE_DILIGENCE',
}

/**
 * AI model providers
 */
export enum AIProvider {
  /** OpenAI */
  OPENAI = 'OPENAI',
  /** Anthropic Claude */
  ANTHROPIC = 'ANTHROPIC',
  /** Google Gemini */
  GOOGLE = 'GOOGLE',
  /** Azure OpenAI */
  AZURE_OPENAI = 'AZURE_OPENAI',
  /** Local/self-hosted */
  LOCAL = 'LOCAL',
}

/**
 * AI task types
 */
export enum AITaskType {
  /** Document summarization */
  SUMMARIZE = 'SUMMARIZE',
  /** Document analysis */
  ANALYZE = 'ANALYZE',
  /** Document generation */
  GENERATE = 'GENERATE',
  /** Document extraction */
  EXTRACT = 'EXTRACT',
  /** Question answering */
  QA = 'QA',
  /** Document comparison */
  COMPARE = 'COMPARE',
  /** Risk assessment */
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  /** Deadline calculation */
  DEADLINE_CALC = 'DEADLINE_CALC',
  /** Document classification */
  CLASSIFY = 'CLASSIFY',
  /** Embedding generation */
  EMBED = 'EMBED',
}
