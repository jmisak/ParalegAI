'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';

const CODE_LENGTH = 6;

interface MfaVerifyResponse {
  accessToken: string;
}

export default function VerifyMfaPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setInputRef = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    },
    []
  );

  const handleDigitChange = (index: number, value: string) => {
    // Accept only single digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]!;
    }
    setDigits(next);

    // Focus the input after the last pasted digit
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = useBackupCode ? backupCode.trim() : digits.join('');

    if (!useBackupCode && code.length !== CODE_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    if (useBackupCode && !code) {
      setError('Please enter your backup code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const mfaToken = sessionStorage.getItem('mfa_token');
      if (!mfaToken) {
        setError('MFA session expired. Please log in again.');
        return;
      }

      await api.post<MfaVerifyResponse>('/auth/mfa/verify', {
        mfaToken,
        code,
        type: useBackupCode ? 'backup' : 'totp',
        rememberDevice,
      });

      // Clean up and redirect
      sessionStorage.removeItem('mfa_token');
      router.push('/dashboard/matters');
    } catch {
      setError(
        useBackupCode
          ? 'Invalid backup code. Please try again.'
          : 'Invalid verification code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBackupCode = () => {
    setUseBackupCode((prev) => !prev);
    setError(null);
    setDigits(Array(CODE_LENGTH).fill(''));
    setBackupCode('');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-navy-900 text-sm">IC</span>
          </div>
          <span className="text-xl font-bold tracking-tight">IRONCLAD</span>
        </div>
        <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
        <CardDescription>
          {useBackupCode
            ? 'Enter one of your backup codes to continue'
            : 'Enter the 6-digit code from your authenticator app'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-md">
              {error}
            </div>
          )}

          {useBackupCode ? (
            <div className="space-y-2">
              <label htmlFor="backup-code" className="text-sm font-medium">
                Backup Code
              </label>
              <Input
                id="backup-code"
                type="text"
                placeholder="Enter your backup code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <div className="flex justify-between gap-2">
                {digits.map((digit, index) => (
                  <Input
                    key={index}
                    ref={setInputRef(index)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    onPaste={index === 0 ? handleDigitPaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    autoFocus={index === 0}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="remember-device"
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="remember-device" className="text-sm text-muted-foreground">
              Remember this device for 30 days
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleBackupCode}
              className="text-sm text-primary hover:underline"
            >
              {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code'}
            </button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center text-sm">
        <div className="text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
