'use client';

import { useAuthContext, type LoginCredentials, type AuthContextValue } from '@/components/providers/auth-provider';

/**
 * Hook for authentication state and actions
 * Wraps the auth context for convenient usage
 */
export function useAuth(): AuthContextValue {
  const context = useAuthContext();
  return context;
}

export type { LoginCredentials };
