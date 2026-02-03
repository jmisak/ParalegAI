'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Building,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Matter, CreateMatterInput, UpdateMatterInput } from '@/lib/hooks/use-matter';

/** US states for the property state dropdown */
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

const TRANSACTION_TYPES: { value: Matter['type']; label: string }[] = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'sale', label: 'Sale' },
  { value: 'refinance', label: 'Refinance' },
  { value: 'lease', label: 'Lease' },
  { value: 'other', label: 'Other' },
];

const MATTER_STATUSES: { value: Matter['status']; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'closed', label: 'Closed' },
  { value: 'on_hold', label: 'On Hold' },
];

/** Mock attorneys for the dropdown -- replace with real data hook later */
const MOCK_ATTORNEYS = [
  { id: 'att-1', name: 'Jane Smith' },
  { id: 'att-2', name: 'John Doe' },
  { id: 'att-3', name: 'Maria Garcia' },
];

/** Mock clients for the dropdown -- replace with real data hook later */
const MOCK_CLIENTS = [
  { id: 'client-1', name: 'Robert Johnson' },
  { id: 'client-2', name: 'Smith Enterprises LLC' },
  { id: 'client-3', name: 'Michael Davis' },
];

export interface MatterFormProps {
  /** Pre-existing matter data when editing */
  initialData?: Matter;
  /** Whether the form is in edit mode */
  isEditing?: boolean;
  /** Called on valid submit */
  onSubmit: (data: CreateMatterInput | UpdateMatterInput) => void;
  /** Whether the mutation is in progress */
  isSubmitting?: boolean;
  /** Cancel navigation target */
  cancelHref: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  propertyAddress?: string;
}

/**
 * Shared form component for creating and editing matters.
 * Validates required fields: name, type, propertyAddress.
 */
export function MatterForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
  cancelHref,
}: MatterFormProps) {
  // -- Form state --
  const [name, setName] = useState(initialData?.name ?? '');
  const [type, setType] = useState<Matter['type']>(initialData?.type ?? 'purchase');
  const [status, setStatus] = useState<Matter['status']>(initialData?.status ?? 'active');
  const [clientId, setClientId] = useState(initialData?.clientId ?? '');
  const [propertyAddress, setPropertyAddress] = useState(initialData?.propertyAddress ?? '');
  const [propertyCity, setPropertyCity] = useState(initialData?.propertyCity ?? '');
  const [propertyState, setPropertyState] = useState(initialData?.propertyState ?? '');
  const [propertyZip, setPropertyZip] = useState(initialData?.propertyZip ?? '');
  const [parcelNumber, setParcelNumber] = useState(initialData?.parcelNumber ?? '');
  const [purchasePrice, setPurchasePrice] = useState(
    initialData?.purchasePrice != null ? String(initialData.purchasePrice) : ''
  );
  const [contractDate, setContractDate] = useState(initialData?.contractDate ?? '');
  const [closingDate, setClosingDate] = useState(initialData?.closingDate ?? '');
  const [dueDiligenceDeadline, setDueDiligenceDeadline] = useState(
    initialData?.dueDiligenceDeadline ?? ''
  );
  const [opposingParty, setOpposingParty] = useState(initialData?.opposingParty ?? '');
  const [assignedAttorney, setAssignedAttorney] = useState(initialData?.assignedAttorney ?? '');

  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Matter name is required.';
    if (!type) next.type = 'Transaction type is required.';
    if (!propertyAddress.trim()) next.propertyAddress = 'Property address is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateMatterInput & { status?: Matter['status'] } = {
      name: name.trim(),
      clientId,
      type,
      propertyAddress: propertyAddress.trim(),
      propertyCity: propertyCity.trim(),
      propertyState,
      propertyZip: propertyZip.trim(),
      parcelNumber: parcelNumber.trim() || undefined,
      purchasePrice: purchasePrice ? Number(purchasePrice.replace(/[^0-9.]/g, '')) : undefined,
      contractDate: contractDate || undefined,
      closingDate: closingDate || undefined,
      dueDiligenceDeadline: dueDiligenceDeadline || undefined,
      opposingParty: opposingParty.trim() || undefined,
      assignedAttorney: assignedAttorney.trim() || undefined,
    };

    if (isEditing) {
      payload.status = status;
    }

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="matter-form">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matter Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Matter Name <span className="text-danger-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="e.g. Johnson Residential Purchase"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(errors.name && 'border-danger-500 focus-visible:ring-danger-500')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-500">{errors.name}</p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1.5">
                Transaction Type <span className="text-danger-500">*</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as Matter['type'])}
                className={cn(
                  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  errors.type && 'border-danger-500 focus-visible:ring-danger-500'
                )}
              >
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-danger-500">{errors.type}</p>
              )}
            </div>

            {/* Client */}
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-foreground mb-1.5">
                Client
              </label>
              <select
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a client...</option>
                {MOCK_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status -- edit only */}
            {isEditing && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Matter['status'])}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {MATTER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Address */}
            <div className="sm:col-span-2">
              <label htmlFor="propertyAddress" className="block text-sm font-medium text-foreground mb-1.5">
                Address <span className="text-danger-500">*</span>
              </label>
              <Input
                id="propertyAddress"
                placeholder="123 Main Street"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className={cn(
                  errors.propertyAddress && 'border-danger-500 focus-visible:ring-danger-500'
                )}
              />
              {errors.propertyAddress && (
                <p className="mt-1 text-sm text-danger-500">{errors.propertyAddress}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="propertyCity" className="block text-sm font-medium text-foreground mb-1.5">
                City
              </label>
              <Input
                id="propertyCity"
                placeholder="Austin"
                value={propertyCity}
                onChange={(e) => setPropertyCity(e.target.value)}
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="propertyState" className="block text-sm font-medium text-foreground mb-1.5">
                State
              </label>
              <select
                id="propertyState"
                value={propertyState}
                onChange={(e) => setPropertyState(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select state...</option>
                {US_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* ZIP */}
            <div>
              <label htmlFor="propertyZip" className="block text-sm font-medium text-foreground mb-1.5">
                ZIP Code
              </label>
              <Input
                id="propertyZip"
                placeholder="78701"
                value={propertyZip}
                onChange={(e) => setPropertyZip(e.target.value)}
                maxLength={10}
              />
            </div>

            {/* Parcel Number */}
            <div>
              <label htmlFor="parcelNumber" className="block text-sm font-medium text-foreground mb-1.5">
                Parcel Number
              </label>
              <Input
                id="parcelNumber"
                placeholder="12345-67-890"
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-foreground mb-1.5">
                Purchase Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="purchasePrice"
                  placeholder="450,000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Key Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="contractDate" className="block text-sm font-medium text-foreground mb-1.5">
                Contract Date
              </label>
              <Input
                id="contractDate"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="closingDate" className="block text-sm font-medium text-foreground mb-1.5">
                Closing Date
              </label>
              <Input
                id="closingDate"
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="dueDiligenceDeadline" className="block text-sm font-medium text-foreground mb-1.5">
                Due Diligence Deadline
              </label>
              <Input
                id="dueDiligenceDeadline"
                type="date"
                value={dueDiligenceDeadline}
                onChange={(e) => setDueDiligenceDeadline(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Parties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="opposingParty" className="block text-sm font-medium text-foreground mb-1.5">
                Opposing Party
              </label>
              <Input
                id="opposingParty"
                placeholder="Name of opposing party"
                value={opposingParty}
                onChange={(e) => setOpposingParty(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="assignedAttorney" className="block text-sm font-medium text-foreground mb-1.5">
                Assigned Attorney
              </label>
              <select
                id="assignedAttorney"
                value={assignedAttorney}
                onChange={(e) => setAssignedAttorney(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select attorney...</option>
                {MOCK_ATTORNEYS.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" type="button" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Matter'}
        </Button>
      </div>
    </form>
  );
}
