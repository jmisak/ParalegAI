'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

export interface Matter {
  id: string;
  matterNumber: string;
  name: string;
  clientId: string;
  clientName: string;
  type: 'purchase' | 'sale' | 'refinance' | 'lease' | 'other';
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  parcelNumber?: string;
  purchasePrice?: number;
  contractDate?: string;
  closingDate?: string;
  dueDiligenceDeadline?: string;
  opposingParty?: string;
  assignedAttorney?: string;
  documents?: MatterDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface MatterDocument {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export interface MatterFilters {
  status?: Matter['status'];
  type?: Matter['type'];
  clientId?: string;
  search?: string;
}

export interface CreateMatterInput {
  name: string;
  clientId: string;
  type: Matter['type'];
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  parcelNumber?: string;
  purchasePrice?: number;
  contractDate?: string;
  closingDate?: string;
  dueDiligenceDeadline?: string;
  opposingParty?: string;
  assignedAttorney?: string;
}

export interface UpdateMatterInput extends Partial<CreateMatterInput> {
  status?: Matter['status'];
}

/**
 * Hook for fetching list of matters
 */
export function useMatter(filters?: MatterFilters) {
  const query = useQuery({
    queryKey: queryKeys.matters.list(filters as Record<string, unknown> | undefined),
    queryFn: async () => {
      if (USE_MOCKS) return getMockMatters();
      return api.get<Matter[]>('/matters', { params: filters as Record<string, string> });
    },
  });

  return {
    matters: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single matter by ID
 */
export function useMatterDetail(id: string) {
  const query = useQuery({
    queryKey: queryKeys.matters.detail(id),
    queryFn: async () => {
      if (USE_MOCKS) {
        const matters = getMockMatters();
        const matter = matters.find((m) => m.id === id);
        if (!matter) throw new Error('Matter not found');
        return matter;
      }
      return api.get<Matter>(`/matters/${id}`);
    },
    enabled: !!id,
  });

  return {
    matter: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Hook for creating a new matter
 */
export function useCreateMatter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMatterInput) => {
      return api.post<Matter>('/matters', input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matters.lists() });
    },
  });
}

/**
 * Hook for updating a matter
 */
export function useUpdateMatter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMatterInput) => {
      return api.patch<Matter>(`/matters/${id}`, input);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.matters.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.matters.lists() });
    },
  });
}

/**
 * Hook for deleting a matter (soft delete)
 */
export function useDeleteMatter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/matters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matters.all });
    },
  });
}

// Mock data for development
function getMockMatters(): Matter[] {
  return [
    {
      id: '1',
      matterNumber: 'MTR-2026-0001',
      name: 'Johnson Residential Purchase',
      clientId: 'client-1',
      clientName: 'Robert Johnson',
      type: 'purchase',
      status: 'active',
      propertyAddress: '123 Oak Street',
      propertyCity: 'Austin',
      propertyState: 'TX',
      propertyZip: '78701',
      parcelNumber: '12345-67-890',
      purchasePrice: 450000,
      contractDate: '2026-01-15',
      closingDate: '2026-02-28',
      dueDiligenceDeadline: '2026-02-01',
      opposingParty: 'Sarah Williams',
      assignedAttorney: 'Jane Smith',
      documents: [
        { id: 'd1', name: 'Purchase Agreement.pdf', type: 'Contract', createdAt: '2026-01-15' },
        { id: 'd2', name: 'Title Report.pdf', type: 'Title', createdAt: '2026-01-20' },
      ],
      createdAt: '2026-01-10',
      updatedAt: '2026-01-25',
    },
    {
      id: '2',
      matterNumber: 'MTR-2026-0002',
      name: 'Smith Commercial Lease',
      clientId: 'client-2',
      clientName: 'Smith Enterprises LLC',
      type: 'lease',
      status: 'pending',
      propertyAddress: '456 Business Park Dr',
      propertyCity: 'Dallas',
      propertyState: 'TX',
      propertyZip: '75201',
      closingDate: '2026-03-01',
      assignedAttorney: 'John Doe',
      documents: [],
      createdAt: '2026-01-20',
      updatedAt: '2026-01-25',
    },
    {
      id: '3',
      matterNumber: 'MTR-2026-0003',
      name: 'Davis Property Sale',
      clientId: 'client-3',
      clientName: 'Michael Davis',
      type: 'sale',
      status: 'active',
      propertyAddress: '789 Lake View Blvd',
      propertyCity: 'Houston',
      propertyState: 'TX',
      propertyZip: '77001',
      purchasePrice: 625000,
      contractDate: '2026-01-22',
      closingDate: '2026-03-15',
      opposingParty: 'TBD',
      assignedAttorney: 'Jane Smith',
      documents: [
        { id: 'd3', name: 'Listing Agreement.pdf', type: 'Contract', createdAt: '2026-01-22' },
      ],
      createdAt: '2026-01-22',
      updatedAt: '2026-01-25',
    },
  ];
}
