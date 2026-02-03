'use client';

import { useState } from 'react';
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

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post('/auth/request-access', {
        fullName,
        email,
        organization,
        roleTitle,
        phone: phone || undefined,
        message: message || undefined,
      });
      setIsSubmitted(true);
    } catch {
      setError('Unable to submit your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-navy-900 text-sm">IC</span>
            </div>
            <span className="text-xl font-bold tracking-tight">IRONCLAD</span>
          </div>
          <CardTitle className="text-2xl font-bold">Request Submitted</CardTitle>
          <CardDescription>
            Your request has been submitted. An administrator will review it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 text-sm text-success-600 bg-success-50 border border-success-200 rounded-md">
            We have received your access request for{' '}
            <span className="font-medium">{email}</span>. You will be notified
            once your account has been approved.
          </div>
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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-navy-900 text-sm">IC</span>
          </div>
          <span className="text-xl font-bold tracking-tight">IRONCLAD</span>
        </div>
        <CardTitle className="text-2xl font-bold">Request Access</CardTitle>
        <CardDescription>
          Submit a request to join your firm on IRONCLAD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-danger-600 bg-danger-50 border border-danger-200 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="attorney@lawfirm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="organization" className="text-sm font-medium">
              Organization / Firm Name
            </label>
            <Input
              id="organization"
              type="text"
              placeholder="Smith & Associates LLP"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="roleTitle" className="text-sm font-medium">
              Role / Title
            </label>
            <Input
              id="roleTitle"
              type="text"
              placeholder="Paralegal, Associate Attorney, etc."
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="message"
              placeholder="Any additional context for your request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Request Access'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center text-sm">
        <div className="text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
