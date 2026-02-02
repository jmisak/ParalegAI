/**
 * @ironclad/shared - Shared types, constants, and utilities
 * @module @ironclad/shared
 */

// Enums
export * from './enums';

// Types
export * from './types';

// Constants
export * from './constants';

// Utilities - export selectively to avoid name conflicts with types
export {
  // Validation schemas
  uuidSchema,
  emailSchema,
  phoneSchema,
  zipCodeSchema,
  stateCodeSchema,
  addressSchema,
  userCredentialsSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  createMatterSchema,
  updateMatterSchema,
  matterSearchSchema,
  uploadDocumentSchema,
  updateDocumentSchema,
  documentSearchSchema,
  createPartySchema,
  updatePartySchema,
  partySearchSchema,
  legalDescriptionSchema,
  createPropertySchema,
  updatePropertySchema,
  createTransactionSchema,
  updateTransactionSchema,
  createTaskSchema,
  updateTaskSchema,
  taskSearchSchema,
  aiRequestSchema,
  paginationSchema,
  searchRequestSchema,
  // Export Zod-inferred types with different names to avoid conflicts
  type AddressInput,
  type CreateUserInput as CreateUserSchemaInput,
  type UpdateUserInput as UpdateUserSchemaInput,
  type CreateMatterInput as CreateMatterSchemaInput,
  type UpdateMatterInput as UpdateMatterSchemaInput,
  type MatterSearchInput,
  type UploadDocumentInput as UploadDocumentSchemaInput,
  type UpdateDocumentInput as UpdateDocumentSchemaInput,
  type DocumentSearchInput,
  type CreatePartyInput as CreatePartySchemaInput,
  type UpdatePartyInput as UpdatePartySchemaInput,
  type PartySearchInput,
  type CreatePropertyInput as CreatePropertySchemaInput,
  type UpdatePropertyInput as UpdatePropertySchemaInput,
  type CreateTransactionInput as CreateTransactionSchemaInput,
  type UpdateTransactionInput as UpdateTransactionSchemaInput,
  type CreateTaskInput as CreateTaskSchemaInput,
  type UpdateTaskInput as UpdateTaskSchemaInput,
  type TaskSearchInput,
  type AIRequestInput,
  type PaginationInput,
  type SearchRequestInput,
} from './utils/validation';

export {
  // Formatters
  formatCurrency,
  formatDollars,
  formatWholeDollars,
  parseCurrencyToCents,
  formatPhone,
  formatPhoneInternational,
  formatDate,
  formatDateShort,
  formatDateLegal,
  formatDateTime,
  formatRelativeTime,
  formatAddressSingleLine,
  formatAddressMultiLine,
  formatFullName,
  formatNameLegal,
  formatPercentage,
  formatPercentageWhole,
  formatFileSize,
  formatMatterNumber,
  formatAPN,
  truncate,
  formatSSNMasked,
  formatEIN,
} from './utils/formatters';

export {
  // Calculations
  isWeekend,
  getFederalHolidays,
  isFederalHoliday,
  isBusinessDay,
  addBusinessDays,
  addCalendarDays,
  calculateDeadline,
  businessDaysBetween,
  calculateProration,
  calculateTaxProration,
  calculateMonthlyPayment,
  calculateLTV,
  calculateDTI,
  calculateTransferTax,
  calculateCommission,
  calculateCommissionSplit,
  calculateRecordingFees,
  calculatePrepaidInterest,
  daysUntilDeadline,
  isDeadlineOverdue,
  getDeadlineStatus,
} from './utils/calculations';
