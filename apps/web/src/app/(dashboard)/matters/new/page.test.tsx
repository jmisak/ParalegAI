import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewMatterPage from './page';

// Track router.push calls
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard/matters/new',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string; [k: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock the API so the mutation resolves immediately
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ id: 'new-123', name: 'Test Matter' }),
    patch: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
  queryKeys: {
    matters: {
      all: ['matters'],
      lists: () => ['matters', 'list'],
      list: (f?: Record<string, unknown>) => ['matters', 'list', f],
      details: () => ['matters', 'detail'],
      detail: (id: string) => ['matters', 'detail', id],
    },
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('NewMatterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page header', () => {
    renderWithProviders(<NewMatterPage />);

    expect(screen.getByText('New Matter')).toBeInTheDocument();
    expect(screen.getByText('Create a new real estate matter')).toBeInTheDocument();
  });

  it('should render the back link to matters list', () => {
    renderWithProviders(<NewMatterPage />);

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toHaveAttribute('href', '/dashboard/matters');
  });

  it('should render the matter form', () => {
    renderWithProviders(<NewMatterPage />);

    expect(screen.getByTestId('matter-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create matter/i })).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', () => {
    renderWithProviders(<NewMatterPage />);

    fireEvent.click(screen.getByRole('button', { name: /create matter/i }));

    expect(screen.getByText('Matter name is required.')).toBeInTheDocument();
    expect(screen.getByText('Property address is required.')).toBeInTheDocument();
  });

  it('should have a cancel link to matters list', () => {
    renderWithProviders(<NewMatterPage />);

    const cancelLink = screen.getByRole('link', { name: /cancel/i });
    expect(cancelLink).toHaveAttribute('href', '/dashboard/matters');
  });
});
