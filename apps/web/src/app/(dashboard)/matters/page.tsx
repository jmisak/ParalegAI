'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMatter } from '@/lib/hooks/use-matter';

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

export default function MattersPage() {
  const { matters, isLoading } = useMatter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatters = matters?.filter(
    (matter) =>
      matter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.matterNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matters</h1>
          <p className="text-muted-foreground">
            Manage your real estate transactions and cases
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/matters/new">
            <Plus className="w-4 h-4 mr-2" />
            New Matter
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search matters..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matters?.filter((m) => m.status === 'active').length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Closing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matters?.filter((m) => m.status === 'pending').length ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-600">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Matters Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Matter
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Client
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Closing Date
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading matters...
                  </td>
                </tr>
              ) : !filteredMatters?.length ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No matters found. Create your first matter to get started.
                  </td>
                </tr>
              ) : (
                filteredMatters.map((matter) => (
                  <tr
                    key={matter.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        href={`/dashboard/matters/${matter.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {matter.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {matter.matterNumber}
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{matter.clientName}</td>
                    <td className="p-4 text-foreground capitalize">
                      {matter.type.replace('_', ' ')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[matter.status] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {statusLabels[matter.status] ?? matter.status}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">
                      {matter.closingDate
                        ? new Date(matter.closingDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
