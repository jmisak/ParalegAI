'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys } from '@/lib/api';

export interface Document {
  id: string;
  name: string;
  documentType: string;
  mimeType: string;
  size: number;
  matterId?: string;
  matterName?: string;
  version: number;
  status: 'draft' | 'final' | 'archived';
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export interface DocumentFilters {
  matterId?: string;
  documentType?: string;
  status?: Document['status'];
  search?: string;
}

export interface UploadDocumentInput {
  file: File;
  matterId?: string;
  documentType: string;
  tags?: string[];
}

/**
 * Hook for fetching list of documents
 */
export function useDocuments(filters?: DocumentFilters) {
  const query = useQuery({
    queryKey: queryKeys.documents.list(filters as Record<string, unknown> | undefined),
    queryFn: async () => {
      // TODO: Replace with actual API call
      return getMockDocuments();
    },
  });

  return {
    documents: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching documents by matter ID
 */
export function useDocumentsByMatter(matterId: string) {
  const query = useQuery({
    queryKey: queryKeys.documents.byMatter(matterId),
    queryFn: async () => {
      return api.get<Document[]>(`/matters/${matterId}/documents`);
    },
    enabled: !!matterId,
  });

  return {
    documents: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Hook for fetching a single document
 */
export function useDocument(id: string) {
  const query = useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: async () => {
      return api.get<Document>(`/documents/${id}`);
    },
    enabled: !!id,
  });

  return {
    document: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Hook for uploading a document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadDocumentInput) => {
      const formData = new FormData();
      formData.append('file', input.file);
      formData.append('documentType', input.documentType);
      if (input.matterId) {
        formData.append('matterId', input.matterId);
      }
      if (input.tags) {
        formData.append('tags', JSON.stringify(input.tags));
      }

      const response = await fetch(
        `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/documents/upload`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json() as Promise<Document>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
      if (variables.matterId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.documents.byMatter(variables.matterId),
        });
      }
    },
  });
}

/**
 * Hook for deleting a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

/**
 * Hook for downloading a document
 */
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/documents/${id}/download`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
      const filename = filenameMatch?.[1] ?? 'document';

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
}

// Mock data for development
function getMockDocuments(): Document[] {
  return [
    {
      id: '1',
      name: 'Purchase Agreement - Johnson.pdf',
      documentType: 'Contract',
      mimeType: 'application/pdf',
      size: 245678,
      matterId: '1',
      matterName: 'Johnson Residential Purchase',
      version: 1,
      status: 'final',
      tags: ['contract', 'purchase'],
      createdBy: 'Jane Smith',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Title Report - 123 Oak Street.pdf',
      documentType: 'Title',
      mimeType: 'application/pdf',
      size: 512340,
      matterId: '1',
      matterName: 'Johnson Residential Purchase',
      version: 1,
      status: 'final',
      tags: ['title', 'report'],
      createdBy: 'Title Company',
      createdAt: '2026-01-20T14:15:00Z',
      updatedAt: '2026-01-20T14:15:00Z',
    },
    {
      id: '3',
      name: 'Commercial Lease Draft.docx',
      documentType: 'Lease',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 87234,
      matterId: '2',
      matterName: 'Smith Commercial Lease',
      version: 2,
      status: 'draft',
      tags: ['lease', 'commercial'],
      createdBy: 'John Doe',
      createdAt: '2026-01-22T09:00:00Z',
      updatedAt: '2026-01-24T16:45:00Z',
    },
    {
      id: '4',
      name: 'Property Survey.pdf',
      documentType: 'Survey',
      mimeType: 'application/pdf',
      size: 1245678,
      matterId: '1',
      matterName: 'Johnson Residential Purchase',
      version: 1,
      status: 'final',
      tags: ['survey'],
      createdBy: 'ABC Surveyors',
      createdAt: '2026-01-18T11:00:00Z',
      updatedAt: '2026-01-18T11:00:00Z',
    },
    {
      id: '5',
      name: 'Closing Checklist.xlsx',
      documentType: 'Checklist',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 34567,
      version: 1,
      status: 'draft',
      tags: ['checklist', 'closing'],
      createdBy: 'Jane Smith',
      createdAt: '2026-01-25T08:30:00Z',
      updatedAt: '2026-01-25T08:30:00Z',
    },
  ];
}
