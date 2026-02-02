/**
 * JWT Service Mock
 *
 * Mocks JWT token generation and verification for testing auth flows.
 */

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

export class MockJwtService {
  sign(payload: JwtPayload): string {
    return `mock-jwt-token-${payload.sub}`;
  }

  verify(token: string): JwtPayload {
    const userId = token.replace('mock-jwt-token-', '');
    return {
      sub: userId,
      email: `test@example.com`,
      role: 'PARALEGAL',
      organizationId: 'test-org',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  decode(token: string): JwtPayload | null {
    try {
      return this.verify(token);
    } catch {
      return null;
    }
  }
}

export const createMockJwtService = (): MockJwtService => {
  return new MockJwtService();
};
