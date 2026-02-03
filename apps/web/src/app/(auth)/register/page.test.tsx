import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/register',
  useSearchParams: () => new URLSearchParams(),
}));

const mockPost = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the request access form', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Request Access')).toBeInTheDocument();
    expect(
      screen.getByText('Submit a request to join your firm on IRONCLAD')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Organization / Firm Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Role / Title')).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request access/i })).toBeInTheDocument();
  });

  it('should render the mobile branding', () => {
    render(<RegisterPage />);

    expect(screen.getByText('IC')).toBeInTheDocument();
    expect(screen.getByText('IRONCLAD')).toBeInTheDocument();
  });

  it('should have a "Sign in" link to /login', () => {
    render(<RegisterPage />);

    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('should mark Phone and Message as optional', () => {
    render(<RegisterPage />);

    const optionalLabels = screen.getAllByText('(optional)');
    expect(optionalLabels).toHaveLength(2);
  });

  it('should submit the form with all fields', async () => {
    mockPost.mockResolvedValueOnce({});
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jane@lawfirm.com' },
    });
    fireEvent.change(screen.getByLabelText('Organization / Firm Name'), {
      target: { value: 'Smith & Associates LLP' },
    });
    fireEvent.change(screen.getByLabelText('Role / Title'), {
      target: { value: 'Paralegal' },
    });
    fireEvent.change(screen.getByLabelText(/Phone/), {
      target: { value: '(555) 123-4567' },
    });
    fireEvent.change(screen.getByLabelText(/Message/), {
      target: { value: 'Looking to join the team' },
    });

    fireEvent.click(screen.getByRole('button', { name: /request access/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/request-access', {
        fullName: 'Jane Doe',
        email: 'jane@lawfirm.com',
        organization: 'Smith & Associates LLP',
        roleTitle: 'Paralegal',
        phone: '(555) 123-4567',
        message: 'Looking to join the team',
      });
    });
  });

  it('should omit empty optional fields from the request', async () => {
    mockPost.mockResolvedValueOnce({});
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Smith' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@firm.com' },
    });
    fireEvent.change(screen.getByLabelText('Organization / Firm Name'), {
      target: { value: 'Firm Inc.' },
    });
    fireEvent.change(screen.getByLabelText('Role / Title'), {
      target: { value: 'Associate' },
    });

    fireEvent.click(screen.getByRole('button', { name: /request access/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/request-access', {
        fullName: 'John Smith',
        email: 'john@firm.com',
        organization: 'Firm Inc.',
        roleTitle: 'Associate',
        phone: undefined,
        message: undefined,
      });
    });
  });

  it('should show success state after successful submission', async () => {
    mockPost.mockResolvedValueOnce({});
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jane@lawfirm.com' },
    });
    fireEvent.change(screen.getByLabelText('Organization / Firm Name'), {
      target: { value: 'Firm LLP' },
    });
    fireEvent.change(screen.getByLabelText('Role / Title'), {
      target: { value: 'Attorney' },
    });

    fireEvent.click(screen.getByRole('button', { name: /request access/i }));

    await waitFor(() => {
      expect(screen.getByText('Request Submitted')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Your request has been submitted. An administrator will review it.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('jane@lawfirm.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('should show error on submission failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('Server error'));
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jane@lawfirm.com' },
    });
    fireEvent.change(screen.getByLabelText('Organization / Firm Name'), {
      target: { value: 'Firm LLP' },
    });
    fireEvent.change(screen.getByLabelText('Role / Title'), {
      target: { value: 'Attorney' },
    });

    fireEvent.click(screen.getByRole('button', { name: /request access/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Unable to submit your request. Please try again later.')
      ).toBeInTheDocument();
    });
  });

  it('should show "Submitting..." while request is in flight', async () => {
    let resolvePost: (value: unknown) => void;
    mockPost.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jane@lawfirm.com' },
    });
    fireEvent.change(screen.getByLabelText('Organization / Firm Name'), {
      target: { value: 'Firm LLP' },
    });
    fireEvent.change(screen.getByLabelText('Role / Title'), {
      target: { value: 'Attorney' },
    });

    fireEvent.click(screen.getByRole('button', { name: /request access/i }));

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();

    resolvePost!({});
    await waitFor(() => {
      expect(screen.getByText('Request Submitted')).toBeInTheDocument();
    });
  });

  it('should not submit the form if required fields are empty (HTML validation)', () => {
    render(<RegisterPage />);

    // The required attribute prevents submission - we verify the attributes exist
    expect(screen.getByLabelText('Full Name')).toBeRequired();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Organization / Firm Name')).toBeRequired();
    expect(screen.getByLabelText('Role / Title')).toBeRequired();
    expect(screen.getByLabelText(/Phone/)).not.toBeRequired();
    expect(screen.getByLabelText(/Message/)).not.toBeRequired();
  });
});
