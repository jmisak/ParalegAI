import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TemplatesPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard/templates',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [k: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  queryKeys: {
    templates: {
      all: ['templates'],
      lists: () => ['templates', 'list'],
      list: (f?: Record<string, unknown>) => ['templates', 'list', f],
      details: () => ['templates', 'detail'],
      detail: (id: string) => ['templates', 'detail', id],
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

describe('TemplatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page header and create button', () => {
    renderWithProviders(<TemplatesPage />);

    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(
      screen.getByText('Document templates for real estate transactions')
    ).toBeInTheDocument();
    expect(screen.getByText('Create Template')).toBeInTheDocument();
  });

  it('should render the search input', () => {
    renderWithProviders(<TemplatesPage />);

    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
  });

  it('should render all category filter pills including All', () => {
    renderWithProviders(<TemplatesPage />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Purchase Agreement')).toBeInTheDocument();
    expect(screen.getByText('Lease')).toBeInTheDocument();
    expect(screen.getByText('Deed')).toBeInTheDocument();
    expect(screen.getByText('Closing')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Disclosure')).toBeInTheDocument();
    expect(screen.getByText('Mortgage')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should render template cards with mock data', async () => {
    renderWithProviders(<TemplatesPage />);

    // Mock data includes these templates
    expect(
      await screen.findByText('Residential Purchase Agreement')
    ).toBeInTheDocument();
    expect(screen.getByText('Commercial Lease Agreement')).toBeInTheDocument();
    expect(screen.getByText('General Warranty Deed')).toBeInTheDocument();
    expect(screen.getByText('Seller Disclosure Notice')).toBeInTheDocument();
  });

  it('should link each template card to its detail page', async () => {
    renderWithProviders(<TemplatesPage />);

    await screen.findByText('Residential Purchase Agreement');

    const links = screen.getAllByRole('link');
    const templateLinks = links.filter((l) =>
      l.getAttribute('href')?.startsWith('/dashboard/templates/tpl-')
    );
    expect(templateLinks.length).toBeGreaterThanOrEqual(4);
  });

  it('should filter templates by search query', async () => {
    renderWithProviders(<TemplatesPage />);

    await screen.findByText('Residential Purchase Agreement');

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'warranty deed' } });

    expect(screen.getByText('General Warranty Deed')).toBeInTheDocument();
    expect(screen.queryByText('Residential Purchase Agreement')).not.toBeInTheDocument();
    expect(screen.queryByText('Commercial Lease Agreement')).not.toBeInTheDocument();
  });

  it('should filter templates by category pill', async () => {
    renderWithProviders(<TemplatesPage />);

    await screen.findByText('Residential Purchase Agreement');

    // Filter to only lease category
    const leaseButton = screen.getAllByText('Lease');
    // The filter pill is the button variant (not the badge inside the card)
    const filterPill = leaseButton.find((el) => el.tagName === 'BUTTON');
    expect(filterPill).toBeDefined();
    fireEvent.click(filterPill!);

    expect(screen.getByText('Commercial Lease Agreement')).toBeInTheDocument();
    expect(screen.queryByText('Residential Purchase Agreement')).not.toBeInTheDocument();
    expect(screen.queryByText('General Warranty Deed')).not.toBeInTheDocument();
  });

  it('should show empty state when no templates match filters', async () => {
    renderWithProviders(<TemplatesPage />);

    await screen.findByText('Residential Purchase Agreement');

    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

    expect(screen.getByText('No templates found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search or category filter.')
    ).toBeInTheDocument();
  });
});
