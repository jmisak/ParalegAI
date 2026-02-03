import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditMatterPage from './page';

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
  usePathname: () => '/dashboard/matters/1/edit',
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

// Mock the hooks module to control matter data
const mockMatter = {
  id: '1',
  matterNumber: 'MTR-2026-0001',
  name: 'Johnson Residential Purchase',
  clientId: 'client-1',
  clientName: 'Robert Johnson',
  type: 'purchase' as const,
  status: 'active' as const,
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
  documents: [],
  createdAt: '2026-01-10',
  updatedAt: '2026-01-25',
};

const mockMutateFn = vi.fn();

vi.mock('@/lib/hooks/use-matter', () => ({
  useMatterDetail: (id: string) => ({
    matter: id === '1' ? mockMatter : undefined,
    isLoading: false,
    isError: id !== '1',
    error: id !== '1' ? new Error('Not found') : null,
  }),
  useUpdateMatter: () => ({
    mutate: mockMutateFn,
    isPending: false,
    isError: false,
  }),
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

describe('EditMatterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page header with matter info', () => {
    renderWithProviders(
      <EditMatterPage params={Promise.resolve({ id: '1' })} />
    );

    expect(screen.getByText('Edit Matter')).toBeInTheDocument();
  });

  it('should render the form pre-populated with matter data', () => {
    renderWithProviders(
      <EditMatterPage params={Promise.resolve({ id: '1' })} />
    );

    expect(screen.getByLabelText(/matter name/i)).toHaveValue('Johnson Residential Purchase');
    expect(screen.getByLabelText(/^address/i)).toHaveValue('123 Oak Street');
    expect(screen.getByLabelText(/city/i)).toHaveValue('Austin');
    expect(screen.getByLabelText(/zip/i)).toHaveValue('78701');
    expect(screen.getByLabelText(/parcel number/i)).toHaveValue('12345-67-890');
    expect(screen.getByLabelText(/purchase price/i)).toHaveValue('450000');
    expect(screen.getByLabelText(/opposing party/i)).toHaveValue('Sarah Williams');
  });

  it('should show the status field in edit mode', () => {
    renderWithProviders(
      <EditMatterPage params={Promise.resolve({ id: '1' })} />
    );

    const statusSelect = screen.getByLabelText(/^status$/i);
    expect(statusSelect).toBeInTheDocument();
    expect(statusSelect).toHaveValue('active');
  });

  it('should render Save Changes button', () => {
    renderWithProviders(
      <EditMatterPage params={Promise.resolve({ id: '1' })} />
    );

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('should have cancel link back to matter detail', () => {
    renderWithProviders(
      <EditMatterPage params={Promise.resolve({ id: '1' })} />
    );

    const cancelLink = screen.getByRole('link', { name: /cancel/i });
    expect(cancelLink).toHaveAttribute('href', '/dashboard/matters/1');
  });

  it('should show back link to matter detail', () => {
    renderWithProviders(
      <EditMatterPage params={Promise.resolve({ id: '1' })} />
    );

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toHaveAttribute('href', '/dashboard/matters/1');
  });

  it('should show error state when matter not found', () => {
    renderWithProviders(
      <EditMatterPage params={Promise.resolve({ id: 'nonexistent' })} />
    );

    expect(
      screen.getByText('Matter not found or an error occurred.')
    ).toBeInTheDocument();
  });
});
