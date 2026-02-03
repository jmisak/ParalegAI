import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatterForm } from './matter-form';
import type { Matter } from '@/lib/hooks/use-matter';

// Wrap with QueryClientProvider is not needed for this component since it does
// not call any hooks that depend on TanStack Query. We only need the next/link mock.
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string; [k: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('MatterForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    cancelHref: '/dashboard/matters',
  };

  it('should render all form sections', () => {
    render(<MatterForm {...defaultProps} />);

    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Property Details')).toBeInTheDocument();
    expect(screen.getByText('Financial')).toBeInTheDocument();
    expect(screen.getByText('Key Dates')).toBeInTheDocument();
    expect(screen.getByText('Parties')).toBeInTheDocument();
  });

  it('should render required field labels with asterisks', () => {
    render(<MatterForm {...defaultProps} />);

    const nameLabel = screen.getByText('Matter Name');
    expect(nameLabel.parentElement?.querySelector('.text-danger-500')).toBeTruthy();

    const typeLabel = screen.getByText('Transaction Type');
    expect(typeLabel.parentElement?.querySelector('.text-danger-500')).toBeTruthy();

    const addressLabel = screen.getByText('Address');
    expect(addressLabel.parentElement?.querySelector('.text-danger-500')).toBeTruthy();
  });

  it('should show validation errors when submitting empty required fields', () => {
    const onSubmit = vi.fn();
    render(<MatterForm {...defaultProps} onSubmit={onSubmit} />);

    // Clear the name field (it starts empty) and submit
    fireEvent.click(screen.getByRole('button', { name: /create matter/i }));

    expect(screen.getByText('Matter name is required.')).toBeInTheDocument();
    expect(screen.getByText('Property address is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with form data when valid', () => {
    const onSubmit = vi.fn();
    render(<MatterForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/matter name/i), {
      target: { value: 'Test Matter' },
    });
    fireEvent.change(screen.getByLabelText(/^address/i), {
      target: { value: '123 Test St' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create matter/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.name).toBe('Test Matter');
    expect(payload.propertyAddress).toBe('123 Test St');
    expect(payload.type).toBe('purchase'); // default
  });

  it('should not show status field in create mode', () => {
    render(<MatterForm {...defaultProps} />);

    expect(screen.queryByLabelText(/^status$/i)).not.toBeInTheDocument();
  });

  it('should show status field in edit mode', () => {
    const mockMatter: Matter = {
      id: '1',
      matterNumber: 'MTR-2026-0001',
      name: 'Test',
      clientId: 'client-1',
      clientName: 'Test Client',
      type: 'purchase',
      status: 'active',
      propertyAddress: '123 Test St',
      propertyCity: 'Austin',
      propertyState: 'TX',
      propertyZip: '78701',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    render(
      <MatterForm
        {...defaultProps}
        initialData={mockMatter}
        isEditing
        cancelHref="/dashboard/matters/1"
      />
    );

    expect(screen.getByLabelText(/^status$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('should pre-populate fields with initialData in edit mode', () => {
    const mockMatter: Matter = {
      id: '1',
      matterNumber: 'MTR-2026-0001',
      name: 'Johnson Purchase',
      clientId: 'client-1',
      clientName: 'Robert Johnson',
      type: 'sale',
      status: 'pending',
      propertyAddress: '456 Oak Ave',
      propertyCity: 'Dallas',
      propertyState: 'TX',
      propertyZip: '75201',
      purchasePrice: 500000,
      opposingParty: 'Jane Doe',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    render(
      <MatterForm
        {...defaultProps}
        initialData={mockMatter}
        isEditing
        cancelHref="/dashboard/matters/1"
      />
    );

    expect(screen.getByLabelText(/matter name/i)).toHaveValue('Johnson Purchase');
    expect(screen.getByLabelText(/^address/i)).toHaveValue('456 Oak Ave');
    expect(screen.getByLabelText(/city/i)).toHaveValue('Dallas');
    expect(screen.getByLabelText(/purchase price/i)).toHaveValue('500000');
    expect(screen.getByLabelText(/opposing party/i)).toHaveValue('Jane Doe');
  });

  it('should show the cancel link pointing to cancelHref', () => {
    render(<MatterForm {...defaultProps} cancelHref="/dashboard/matters" />);

    const cancelLink = screen.getByRole('link', { name: /cancel/i });
    expect(cancelLink).toHaveAttribute('href', '/dashboard/matters');
  });

  it('should disable submit button when isSubmitting is true', () => {
    render(<MatterForm {...defaultProps} isSubmitting />);

    expect(screen.getByRole('button', { name: /create matter/i })).toBeDisabled();
  });

  it('should include status in payload when editing', () => {
    const onSubmit = vi.fn();
    const mockMatter: Matter = {
      id: '1',
      matterNumber: 'MTR-2026-0001',
      name: 'Test',
      clientId: 'client-1',
      clientName: 'Test Client',
      type: 'purchase',
      status: 'active',
      propertyAddress: '123 Test St',
      propertyCity: 'Austin',
      propertyState: 'TX',
      propertyZip: '78701',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    render(
      <MatterForm
        onSubmit={onSubmit}
        initialData={mockMatter}
        isEditing
        cancelHref="/dashboard/matters/1"
      />
    );

    // Change status to closed
    fireEvent.change(screen.getByLabelText(/^status$/i), {
      target: { value: 'closed' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].status).toBe('closed');
  });

  it('should strip currency formatting from purchase price', () => {
    const onSubmit = vi.fn();
    render(<MatterForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/matter name/i), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/^address/i), {
      target: { value: '123 St' },
    });
    fireEvent.change(screen.getByLabelText(/purchase price/i), {
      target: { value: '450,000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create matter/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].purchasePrice).toBe(450000);
  });
});
