import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyMfaPage from './page';

// Track the most recent router.push call
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
  usePathname: () => '/verify-mfa',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the api module
const mockPost = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

describe('VerifyMfaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the TOTP input with 6 digit boxes', () => {
    render(<VerifyMfaPage />);

    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(
      screen.getByText('Enter the 6-digit code from your authenticator app')
    ).toBeInTheDocument();

    const digitInputs = screen.getAllByRole('textbox');
    expect(digitInputs).toHaveLength(6);
  });

  it('should auto-advance focus when a digit is entered', () => {
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0]!, { target: { value: '1' } });

    // The second input should now be focused
    expect(inputs[1]).toHaveFocus();
  });

  it('should move focus back on backspace in empty field', () => {
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    // Type a digit then move to next
    fireEvent.change(inputs[0]!, { target: { value: '5' } });
    // Clear second input and press backspace
    fireEvent.keyDown(inputs[1]!, { key: 'Backspace' });

    expect(inputs[0]).toHaveFocus();
  });

  it('should handle paste of full code', () => {
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0]!, {
      clipboardData: { getData: () => '123456' },
    });

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('5');
    expect(inputs[5]).toHaveValue('6');
  });

  it('should toggle to backup code input', () => {
    render(<VerifyMfaPage />);

    fireEvent.click(screen.getByText('Use a backup code'));

    expect(screen.getByText('Enter one of your backup codes to continue')).toBeInTheDocument();
    expect(screen.getByLabelText('Backup Code')).toBeInTheDocument();
    expect(screen.getByText('Use authenticator app instead')).toBeInTheDocument();
  });

  it('should toggle back to TOTP from backup code', () => {
    render(<VerifyMfaPage />);

    fireEvent.click(screen.getByText('Use a backup code'));
    fireEvent.click(screen.getByText('Use authenticator app instead'));

    expect(
      screen.getByText('Enter the 6-digit code from your authenticator app')
    ).toBeInTheDocument();
  });

  it('should show error for incomplete TOTP code', async () => {
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0]!, { target: { value: '1' } });
    fireEvent.change(inputs[1]!, { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter the full 6-digit code.')).toBeInTheDocument();
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('should show error for empty backup code', async () => {
    render(<VerifyMfaPage />);

    fireEvent.click(screen.getByText('Use a backup code'));
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter your backup code.')).toBeInTheDocument();
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('should submit TOTP code and redirect on success', async () => {
    mockPost.mockResolvedValueOnce({ accessToken: 'token-123' });
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i]!, { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/mfa/verify', {
        code: '123456',
        type: 'totp',
        rememberDevice: false,
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/matters');
  });

  it('should submit backup code and redirect on success', async () => {
    mockPost.mockResolvedValueOnce({ accessToken: 'token-456' });
    render(<VerifyMfaPage />);

    fireEvent.click(screen.getByText('Use a backup code'));
    fireEvent.change(screen.getByLabelText('Backup Code'), {
      target: { value: 'ABCD-1234-EFGH' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/mfa/verify', {
        code: 'ABCD-1234-EFGH',
        type: 'backup',
        rememberDevice: false,
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/matters');
  });

  it('should send rememberDevice when checkbox is checked', async () => {
    mockPost.mockResolvedValueOnce({ accessToken: 'token-789' });
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    '999999'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i]!, { target: { value: digit } });
    });

    fireEvent.click(screen.getByLabelText('Remember this device for 30 days'));
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/mfa/verify', {
        code: '999999',
        type: 'totp',
        rememberDevice: true,
      });
    });
  });

  it('should show error on failed TOTP verification', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid code'));
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    '000000'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i]!, { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid verification code. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('should show error on failed backup code verification', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid backup code'));
    render(<VerifyMfaPage />);

    fireEvent.click(screen.getByText('Use a backup code'));
    fireEvent.change(screen.getByLabelText('Backup Code'), {
      target: { value: 'BAD-CODE' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid backup code. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('should show "Verifying..." while submitting', async () => {
    let resolvePost: (value: unknown) => void;
    mockPost.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );
    render(<VerifyMfaPage />);

    const inputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i]!, { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled();

    // Resolve to clean up
    resolvePost!({ accessToken: 'token' });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('should render "Back to login" link', () => {
    render(<VerifyMfaPage />);

    const link = screen.getByRole('link', { name: /back to login/i });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('should clear error when toggling between modes', async () => {
    render(<VerifyMfaPage />);

    // Trigger an error
    fireEvent.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() => {
      expect(screen.getByText('Please enter the full 6-digit code.')).toBeInTheDocument();
    });

    // Toggle to backup code - error should clear
    fireEvent.click(screen.getByText('Use a backup code'));
    expect(screen.queryByText('Please enter the full 6-digit code.')).not.toBeInTheDocument();
  });
});
