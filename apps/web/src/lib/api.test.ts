import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError, queryKeys } from './api';

describe('api', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await api.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include query params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.get('/test', { params: { page: 1, limit: 10 } });

      const calls = mockFetch.mock.calls;
      expect(calls[0]).toBeDefined();
      const calledUrl = calls[0]![0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=10');
    });
  });

  describe('post', () => {
    it('should make a POST request with body', async () => {
      const mockData = { id: 1 };
      const body = { name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await api.post('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('put', () => {
    it('should make a PUT request', async () => {
      const body = { name: 'Updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(body),
      });

      await api.put('/test/1', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe('patch', () => {
    it('should make a PATCH request', async () => {
      const body = { name: 'Patched' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(body),
      });

      await api.patch('/test/1', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw ApiError on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found', code: 'NOT_FOUND' }),
      });

      await expect(api.get('/test')).rejects.toThrow(ApiError);
    });

    it('should include error details in ApiError', async () => {
      const errorResponse = {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { field: 'email' },
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('Validation failed');
        expect(apiError.status).toBe(400);
        expect(apiError.code).toBe('VALIDATION_ERROR');
        expect(apiError.details).toEqual({ field: 'email' });
      }
    });

    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Not JSON')),
      });

      await expect(api.get('/test')).rejects.toThrow(ApiError);
    });
  });
});

describe('queryKeys', () => {
  it('should generate auth keys', () => {
    expect(queryKeys.auth.all).toEqual(['auth']);
    expect(queryKeys.auth.me()).toEqual(['auth', 'me']);
  });

  it('should generate matter keys', () => {
    expect(queryKeys.matters.all).toEqual(['matters']);
    expect(queryKeys.matters.lists()).toEqual(['matters', 'list']);
    expect(queryKeys.matters.list({ status: 'active' })).toEqual([
      'matters',
      'list',
      { status: 'active' },
    ]);
    expect(queryKeys.matters.details()).toEqual(['matters', 'detail']);
    expect(queryKeys.matters.detail('123')).toEqual(['matters', 'detail', '123']);
  });

  it('should generate document keys', () => {
    expect(queryKeys.documents.all).toEqual(['documents']);
    expect(queryKeys.documents.byMatter('matter-1')).toEqual([
      'documents',
      'matter',
      'matter-1',
    ]);
  });

  it('should generate client keys', () => {
    expect(queryKeys.clients.all).toEqual(['clients']);
    expect(queryKeys.clients.detail('client-1')).toEqual([
      'clients',
      'detail',
      'client-1',
    ]);
  });
});
