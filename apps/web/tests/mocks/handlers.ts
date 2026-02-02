/**
 * MSW (Mock Service Worker) API Handlers
 *
 * Mocks API responses for component and integration tests.
 */

import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;

    if (body.email === 'test@example.com' && body.password === 'correct-password') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'PARALEGAL',
          organizationId: 'org-123',
        },
      });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as any;

    return HttpResponse.json({
      id: 'new-user-123',
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: 'PARALEGAL',
      organizationId: 'org-123',
    }, { status: 201 });
  }),

  http.get(`${API_URL}/auth/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'PARALEGAL',
      organizationId: 'org-123',
    });
  }),

  // Matter endpoints
  http.get(`${API_URL}/matters`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const allMatters = [
      {
        id: 'matter-1',
        matterNumber: '2026-00001',
        title: '123 Oak Street Purchase',
        status: 'ACTIVE',
        transactionType: 'PURCHASE',
        propertyAddress: '123 Oak Street, Springfield, IL 62701',
        purchasePrice: 425000,
        organizationId: 'org-123',
      },
      {
        id: 'matter-2',
        matterNumber: '2026-00002',
        title: '456 Maple Avenue Sale',
        status: 'PENDING',
        transactionType: 'SALE',
        propertyAddress: '456 Maple Avenue, Springfield, IL 62702',
        purchasePrice: 375000,
        organizationId: 'org-123',
      },
    ];

    const filtered = status
      ? allMatters.filter(m => m.status === status)
      : allMatters;

    return HttpResponse.json(filtered);
  }),

  http.get(`${API_URL}/matters/:id`, ({ params }) => {
    const { id } = params;

    if (id === 'matter-1') {
      return HttpResponse.json({
        id: 'matter-1',
        matterNumber: '2026-00001',
        title: '123 Oak Street Purchase',
        description: 'Single family home purchase',
        status: 'ACTIVE',
        transactionType: 'PURCHASE',
        propertyType: 'SINGLE_FAMILY',
        propertyAddress: '123 Oak Street, Springfield, IL 62701',
        purchasePrice: 425000,
        closingDate: '2026-03-15T00:00:00.000Z',
        organizationId: 'org-123',
        assignedToId: 'user-123',
        createdById: 'user-456',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T10:00:00.000Z',
      });
    }

    return HttpResponse.json(
      { message: 'Matter not found' },
      { status: 404 }
    );
  }),

  http.post(`${API_URL}/matters`, async ({ request }) => {
    const body = await request.json() as any;

    return HttpResponse.json({
      id: 'new-matter-123',
      matterNumber: '2026-00099',
      ...body,
      organizationId: 'org-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.patch(`${API_URL}/matters/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;

    return HttpResponse.json({
      id,
      matterNumber: '2026-00001',
      title: 'Updated Title',
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/matters/:id`, ({ params }) => {
    return HttpResponse.json({ success: true });
  }),
];
