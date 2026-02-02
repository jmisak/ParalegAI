'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export { QueryProvider } from './query-provider';
export { ThemeProvider, useTheme } from './theme-provider';
export { AuthProvider, useAuthContext, type User, type LoginCredentials } from './auth-provider';
