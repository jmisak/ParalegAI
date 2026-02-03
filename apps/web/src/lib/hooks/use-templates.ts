'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TemplateCategory =
  | 'purchase_agreement'
  | 'lease'
  | 'deed'
  | 'closing'
  | 'title'
  | 'disclosure'
  | 'mortgage'
  | 'other';

export type TemplateVariableType = 'text' | 'date' | 'currency' | 'select' | 'boolean';

export interface TemplateVariable {
  key: string;
  label: string;
  type: TemplateVariableType;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  variables: TemplateVariable[];
  jurisdiction: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFilters {
  category?: TemplateCategory;
  status?: Template['status'];
  search?: string;
}

export interface CreateTemplateInput {
  name: string;
  category: TemplateCategory;
  description: string;
  variables: TemplateVariable[];
  jurisdiction: string;
}

export interface RenderTemplateInput {
  templateId: string;
  variables: Record<string, string | boolean>;
}

export interface RenderTemplateOutput {
  content: string;
  renderedAt: string;
}

// ---------------------------------------------------------------------------
// Category helpers
// ---------------------------------------------------------------------------

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'purchase_agreement', label: 'Purchase Agreement' },
  { value: 'lease', label: 'Lease' },
  { value: 'deed', label: 'Deed' },
  { value: 'closing', label: 'Closing' },
  { value: 'title', label: 'Title' },
  { value: 'disclosure', label: 'Disclosure' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'other', label: 'Other' },
];

export const categoryColors: Record<TemplateCategory, string> = {
  purchase_agreement: 'bg-primary/10 text-primary',
  lease: 'bg-success-100 text-success-700',
  deed: 'bg-navy-100 text-navy-700',
  closing: 'bg-warning-100 text-warning-700',
  title: 'bg-danger-100 text-danger-700',
  disclosure: 'bg-gold-100 text-gold-700',
  mortgage: 'bg-primary/10 text-primary',
  other: 'bg-muted text-muted-foreground',
};

export function getCategoryLabel(category: TemplateCategory): string {
  return TEMPLATE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

// ---------------------------------------------------------------------------
// API response type (backend uses isActive: boolean, not status string)
// ---------------------------------------------------------------------------

interface ApiTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  content: string;
  variables: TemplateVariable[];
  jurisdiction?: string;
  version: number;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

function mapApiTemplate(t: ApiTemplate): Template {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    variables: t.variables,
    jurisdiction: t.jurisdiction ?? '',
    version: t.version,
    status: t.isActive ? 'active' : 'draft',
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Hook for fetching list of templates with optional filters
 */
export function useTemplates(filters?: TemplateFilters) {
  const query = useQuery({
    queryKey: queryKeys.templates.list(filters as Record<string, unknown> | undefined),
    queryFn: async () => {
      if (USE_MOCKS) return getMockTemplates();
      const data = await api.get<ApiTemplate[]>('/templates', {
        params: filters as Record<string, string>,
      });
      return data.map(mapApiTemplate);
    },
  });

  return {
    templates: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single template by ID
 */
export function useTemplate(id: string) {
  const query = useQuery({
    queryKey: queryKeys.templates.detail(id),
    queryFn: async () => {
      if (USE_MOCKS) {
        const templates = getMockTemplates();
        const template = templates.find((t) => t.id === id);
        if (!template) throw new Error('Template not found');
        return template;
      }
      const data = await api.get<ApiTemplate>(`/templates/${id}`);
      return mapApiTemplate(data);
    },
    enabled: !!id,
  });

  return {
    template: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Hook for creating a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      return api.post<Template>('/templates', input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.lists() });
    },
  });
}

/**
 * Hook for rendering a template with variable values
 */
export function useRenderTemplate() {
  return useMutation({
    mutationFn: async (input: RenderTemplateInput) => {
      if (USE_MOCKS) return getMockRenderedContent(input);
      return api.post<RenderTemplateOutput>(
        `/templates/${input.templateId}/render`,
        { variables: input.variables },
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function getMockTemplates(): Template[] {
  return [
    {
      id: 'tpl-1',
      name: 'Residential Purchase Agreement',
      category: 'purchase_agreement',
      description:
        'Standard residential real estate purchase agreement compliant with Texas Property Code. Includes financing contingency, inspection period, and standard closing provisions.',
      variables: [
        { key: 'buyer_name', label: 'Buyer Name', type: 'text', required: true },
        { key: 'seller_name', label: 'Seller Name', type: 'text', required: true },
        { key: 'property_address', label: 'Property Address', type: 'text', required: true },
        { key: 'purchase_price', label: 'Purchase Price', type: 'currency', required: true },
        { key: 'closing_date', label: 'Closing Date', type: 'date', required: true },
        { key: 'earnest_money', label: 'Earnest Money Amount', type: 'currency', required: true },
        {
          key: 'financing_type',
          label: 'Financing Type',
          type: 'select',
          required: true,
          options: ['Conventional', 'FHA', 'VA', 'Cash', 'Seller Financing'],
        },
        {
          key: 'inspection_period_days',
          label: 'Inspection Period (Days)',
          type: 'text',
          required: false,
          defaultValue: '10',
        },
        {
          key: 'includes_survey',
          label: 'Survey Required',
          type: 'boolean',
          required: false,
          defaultValue: 'true',
        },
      ],
      jurisdiction: 'Texas',
      version: 3,
      status: 'active',
      createdAt: '2025-11-01T10:00:00Z',
      updatedAt: '2026-01-15T14:30:00Z',
    },
    {
      id: 'tpl-2',
      name: 'Commercial Lease Agreement',
      category: 'lease',
      description:
        'Triple-net (NNN) commercial lease for office, retail, or industrial properties. Includes CAM charges, escalation clauses, and tenant improvement allowance provisions.',
      variables: [
        { key: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
        { key: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
        { key: 'premises_address', label: 'Premises Address', type: 'text', required: true },
        { key: 'lease_start_date', label: 'Lease Start Date', type: 'date', required: true },
        { key: 'lease_term_months', label: 'Lease Term (Months)', type: 'text', required: true },
        { key: 'monthly_rent', label: 'Monthly Base Rent', type: 'currency', required: true },
        { key: 'security_deposit', label: 'Security Deposit', type: 'currency', required: true },
        {
          key: 'lease_type',
          label: 'Lease Type',
          type: 'select',
          required: true,
          options: ['NNN', 'Gross', 'Modified Gross'],
        },
        {
          key: 'personal_guarantee',
          label: 'Personal Guarantee Required',
          type: 'boolean',
          required: false,
          defaultValue: 'false',
        },
      ],
      jurisdiction: 'Texas',
      version: 2,
      status: 'active',
      createdAt: '2025-10-15T09:00:00Z',
      updatedAt: '2026-01-10T11:00:00Z',
    },
    {
      id: 'tpl-3',
      name: 'General Warranty Deed',
      category: 'deed',
      description:
        'Standard general warranty deed for transferring real property with full covenants of title. Includes legal description placeholder and notary acknowledgment.',
      variables: [
        { key: 'grantor_name', label: 'Grantor (Seller)', type: 'text', required: true },
        { key: 'grantee_name', label: 'Grantee (Buyer)', type: 'text', required: true },
        { key: 'property_address', label: 'Property Address', type: 'text', required: true },
        { key: 'legal_description', label: 'Legal Description', type: 'text', required: true },
        { key: 'consideration', label: 'Consideration Amount', type: 'currency', required: true },
        { key: 'execution_date', label: 'Execution Date', type: 'date', required: true },
        { key: 'county', label: 'County', type: 'text', required: true },
      ],
      jurisdiction: 'Texas',
      version: 1,
      status: 'active',
      createdAt: '2025-12-01T08:00:00Z',
      updatedAt: '2025-12-01T08:00:00Z',
    },
    {
      id: 'tpl-4',
      name: 'Seller Disclosure Notice',
      category: 'disclosure',
      description:
        'Texas statutory seller disclosure notice per Section 5.008 of the Texas Property Code. Covers structural, environmental, and systems disclosures.',
      variables: [
        { key: 'seller_name', label: 'Seller Name', type: 'text', required: true },
        { key: 'property_address', label: 'Property Address', type: 'text', required: true },
        { key: 'disclosure_date', label: 'Disclosure Date', type: 'date', required: true },
        {
          key: 'year_built',
          label: 'Year Built',
          type: 'text',
          required: false,
        },
        {
          key: 'has_foundation_issues',
          label: 'Known Foundation Issues',
          type: 'boolean',
          required: true,
          defaultValue: 'false',
        },
        {
          key: 'has_flood_damage',
          label: 'Previous Flood Damage',
          type: 'boolean',
          required: true,
          defaultValue: 'false',
        },
        {
          key: 'in_hoa',
          label: 'Property in HOA',
          type: 'boolean',
          required: false,
          defaultValue: 'false',
        },
      ],
      jurisdiction: 'Texas',
      version: 1,
      status: 'active',
      createdAt: '2026-01-05T12:00:00Z',
      updatedAt: '2026-01-20T09:00:00Z',
    },
  ];
}

function getMockRenderedContent(input: RenderTemplateInput): RenderTemplateOutput {
  const vars = input.variables;
  const lines: string[] = [
    '='.repeat(60),
    '',
    '               RENDERED DOCUMENT PREVIEW',
    '',
    '='.repeat(60),
    '',
  ];

  Object.entries(vars).forEach(([key, value]) => {
    if (value !== '' && value !== undefined) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      lines.push(`${label}: ${String(value)}`);
    }
  });

  lines.push('');
  lines.push('-'.repeat(60));
  lines.push('');
  lines.push('This is a preview of the rendered template output.');
  lines.push('The full document will be generated via the document engine.');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);

  return {
    content: lines.join('\n'),
    renderedAt: new Date().toISOString(),
  };
}
