/**
 * API Mock Utilities
 *
 * Helper functions for mocking API calls in tests.
 * Works with both MSW and manual mocks.
 */

/**
 * Mock successful API response
 */
export const mockSuccessResponse = <T>(data: T, status = 200) => {
  return {
    status,
    ok: true,
    json: async () => data,
    headers: new Headers({
      'content-type': 'application/json',
    }),
  } as Response;
};

/**
 * Mock error API response
 */
export const mockErrorResponse = (
  message: string,
  status = 400,
  errors?: any[]
) => {
  return {
    status,
    ok: false,
    json: async () => ({
      message,
      errors,
      timestamp: new Date().toISOString(),
    }),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  } as Response;
};

/**
 * Mock network error
 */
export const mockNetworkError = () => {
  throw new Error('Network request failed');
};

/**
 * Create mock fetch function
 */
export const createMockFetch = (responses: Map<string, any>) => {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const key = `${options?.method || 'GET'} ${url}`;
    const response = responses.get(key);

    if (!response) {
      return mockErrorResponse('Not found', 404);
    }

    if (response instanceof Error) {
      throw response;
    }

    return mockSuccessResponse(response);
  };
};

/**
 * API Mock Builder for fluent API
 */
export class ApiMockBuilder {
  private responses = new Map<string, any>();

  get(url: string, response: any): this {
    this.responses.set(`GET ${url}`, response);
    return this;
  }

  post(url: string, response: any): this {
    this.responses.set(`POST ${url}`, response);
    return this;
  }

  patch(url: string, response: any): this {
    this.responses.set(`PATCH ${url}`, response);
    return this;
  }

  put(url: string, response: any): this {
    this.responses.set(`PUT ${url}`, response);
    return this;
  }

  delete(url: string, response: any): this {
    this.responses.set(`DELETE ${url}`, response);
    return this;
  }

  error(url: string, error: Error, method = 'GET'): this {
    this.responses.set(`${method} ${url}`, error);
    return this;
  }

  build(): typeof fetch {
    return createMockFetch(this.responses);
  }
}

/**
 * Create API mock builder
 */
export const createApiMock = (): ApiMockBuilder => {
  return new ApiMockBuilder();
};
