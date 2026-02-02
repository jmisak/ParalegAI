const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Make request
  const requestBody = body ? JSON.stringify(body) : null;
  const response = await fetch(url.toString(), {
    ...rest,
    headers,
    body: requestBody,
    credentials: 'include', // Include cookies for auth
  });

  // Handle non-OK responses
  if (!response.ok) {
    let errorData: { message?: string; code?: string; details?: Record<string, unknown> } = {};
    try {
      errorData = await response.json();
    } catch {
      // Response is not JSON
    }

    throw new ApiError(
      errorData.message ?? `Request failed with status ${response.status}`,
      response.status,
      errorData.code,
      errorData.details
    );
  }

  // Handle empty responses
  if (response.status === 204) {
    return undefined as T;
  }

  // Parse JSON response
  return response.json();
}

/**
 * API client with typed methods for HTTP operations
 */
export const api = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

/**
 * Type-safe query key factory for TanStack Query
 */
export const queryKeys = {
  all: ['all'] as const,

  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // Matters
  matters: {
    all: ['matters'] as const,
    lists: () => [...queryKeys.matters.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.matters.lists(), filters] as const,
    details: () => [...queryKeys.matters.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.matters.details(), id] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.documents.lists(), filters] as const,
    details: () => [...queryKeys.documents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    byMatter: (matterId: string) =>
      [...queryKeys.documents.all, 'matter', matterId] as const,
  },

  // Clients
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.clients.lists(), filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
  },
};
