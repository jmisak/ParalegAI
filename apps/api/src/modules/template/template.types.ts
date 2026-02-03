/**
 * Document Template Type Definitions
 */

/**
 * Template categories for real estate law
 */
export type TemplateCategory =
  | 'purchase_agreement'
  | 'lease'
  | 'deed'
  | 'mortgage'
  | 'title'
  | 'closing'
  | 'disclosure'
  | 'letter'
  | 'notice'
  | 'general';

/**
 * Variable types for template fields
 */
export type VariableType =
  | 'text'
  | 'number'
  | 'date'
  | 'currency'
  | 'boolean'
  | 'address'
  | 'party'
  | 'list';

/**
 * Template variable definition
 */
export interface TemplateVariable {
  key: string;
  label: string;
  type: VariableType;
  required: boolean;
  defaultValue?: string;
  description?: string;
  /** Source for auto-population: 'matter', 'party', 'property', 'organization', 'manual' */
  source?: string;
  /** Path in source data (e.g., 'property.address.street') */
  sourcePath?: string;
  /** Validation pattern (regex) */
  pattern?: string;
  /** Options for select-type variables */
  options?: string[];
}

/**
 * Template definition stored in database
 */
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  content: string;
  variables: TemplateVariable[];
  jurisdiction?: string;
  version: number;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Variable resolution context
 */
export interface ResolutionContext {
  matter?: Record<string, unknown>;
  parties?: Record<string, Record<string, unknown>>;
  property?: Record<string, unknown>;
  organization?: Record<string, unknown>;
  transaction?: Record<string, unknown>;
  custom?: Record<string, string>;
}

/**
 * Rendered template result
 */
export interface RenderResult {
  content: string;
  unresolvedVariables: string[];
  warnings: string[];
}
