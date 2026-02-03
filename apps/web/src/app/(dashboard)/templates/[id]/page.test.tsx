import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TemplateDetailPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard/templates/tpl-1',
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

// Create a resolved promise for the params prop (Next.js 15 pattern)
function makeParams(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id });
}

describe('TemplateDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render template name and description', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    expect(
      await screen.findByText('Residential Purchase Agreement')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Standard residential real estate purchase agreement/)
    ).toBeInTheDocument();
  });

  it('should render category badge and version badge', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');
    // Category badge
    expect(screen.getByText('Purchase Agreement')).toBeInTheDocument();
    // Version badge
    expect(screen.getByText('v3')).toBeInTheDocument();
  });

  it('should render back link to templates list', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toHaveAttribute('href', '/dashboard/templates');
  });

  it('should render variable form inputs', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');

    // Check for variable labels
    expect(screen.getByText('Buyer Name')).toBeInTheDocument();
    expect(screen.getByText('Seller Name')).toBeInTheDocument();
    expect(screen.getByText('Property Address')).toBeInTheDocument();
    expect(screen.getByText('Purchase Price')).toBeInTheDocument();
    expect(screen.getByText('Closing Date')).toBeInTheDocument();
  });

  it('should render the Preview and Download buttons', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');

    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Download as PDF')).toBeInTheDocument();
  });

  it('should show template info sidebar', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');

    expect(screen.getByText('Template Info')).toBeInTheDocument();
    expect(screen.getByText('Texas')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should show variable definitions sidebar', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');

    expect(screen.getByText('Variable Definitions')).toBeInTheDocument();
  });

  it('should render preview content on clicking Preview', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');

    const previewBtn = screen.getByText('Preview');
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByText('Document Preview')).toBeInTheDocument();
    });
    expect(screen.getByText(/RENDERED DOCUMENT PREVIEW/)).toBeInTheDocument();
  });

  it('should show required field counter', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('tpl-1')} />);

    await screen.findByText('Residential Purchase Agreement');

    // The template has 6 required fields, with defaults for some
    expect(screen.getByText(/required fields filled/)).toBeInTheDocument();
  });

  it('should show error state for nonexistent template', async () => {
    renderWithProviders(<TemplateDetailPage params={makeParams('nonexistent')} />);

    await waitFor(() => {
      expect(
        screen.getByText('Template not found or an error occurred.')
      ).toBeInTheDocument();
    });
  });
});
