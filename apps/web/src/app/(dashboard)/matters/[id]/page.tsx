'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Users,
  Building,
  MapPin,
  DollarSign,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMatterDetail } from '@/lib/hooks/use-matter';

const statusColors: Record<string, string> = {
  active: 'bg-success-100 text-success-700',
  pending: 'bg-warning-100 text-warning-700',
  closed: 'bg-muted text-muted-foreground',
  on_hold: 'bg-navy-100 text-navy-700',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  closed: 'Closed',
  on_hold: 'On Hold',
};

export default function MatterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { matter, isLoading, error } = useMatterDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading matter details...</div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/matters">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matters
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Matter not found or an error occurred.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/matters">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{matter.name}</h1>
            <p className="text-muted-foreground">{matter.matterNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[matter.status] ?? 'bg-muted text-muted-foreground'}`}
          >
            {statusLabels[matter.status] ?? matter.status}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/matters/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div>{matter.propertyAddress}</div>
                      <div className="text-muted-foreground">
                        {matter.propertyCity}, {matter.propertyState}{' '}
                        {matter.propertyZip}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Transaction Type
                  </div>
                  <div className="mt-1 capitalize">
                    {matter.type.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Purchase Price
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {matter.purchasePrice
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(matter.purchasePrice)
                        : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Parcel Number
                  </div>
                  <div className="mt-1">{matter.parcelNumber ?? '-'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
              <Button variant="outline" size="sm">
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              {matter.documents?.length ? (
                <div className="space-y-2">
                  {matter.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} &bull;{' '}
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No documents uploaded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Contract Date</div>
                <div className="font-medium">
                  {matter.contractDate
                    ? new Date(matter.contractDate).toLocaleDateString()
                    : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Closing Date</div>
                <div className="font-medium">
                  {matter.closingDate
                    ? new Date(matter.closingDate).toLocaleDateString()
                    : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Due Diligence Deadline
                </div>
                <div className="font-medium">
                  {matter.dueDiligenceDeadline
                    ? new Date(matter.dueDiligenceDeadline).toLocaleDateString()
                    : '-'}
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
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Client</div>
                <div className="font-medium">{matter.clientName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Opposing Party
                </div>
                <div className="font-medium">
                  {matter.opposingParty ?? '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Assigned Attorney
                </div>
                <div className="font-medium">
                  {matter.assignedAttorney ?? '-'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-4">
                Activity timeline coming soon.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
