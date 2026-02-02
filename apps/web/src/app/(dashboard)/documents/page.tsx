'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Download,
  MoreHorizontal,
  Upload,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useDocuments } from '@/lib/hooks/use-documents';

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-danger-500" />,
  docx: <FileText className="w-5 h-5 text-primary" />,
  doc: <FileText className="w-5 h-5 text-primary" />,
  xlsx: <FileSpreadsheet className="w-5 h-5 text-success-500" />,
  xls: <FileSpreadsheet className="w-5 h-5 text-success-500" />,
  png: <FileImage className="w-5 h-5 text-warning-500" />,
  jpg: <FileImage className="w-5 h-5 text-warning-500" />,
  jpeg: <FileImage className="w-5 h-5 text-warning-500" />,
};

function getFileIcon(filename: string): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return fileTypeIcons[ext] ?? <File className="w-5 h-5 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DocumentsPage() {
  const { documents, isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredDocuments = documents?.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.matterName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">
            Manage and organize your legal documents
          </p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-medium">Templates</div>
              <div className="text-sm text-muted-foreground">50+ templates</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-success-500/10">
              <FileText className="w-6 h-6 text-success-500" />
            </div>
            <div>
              <div className="font-medium">Recent</div>
              <div className="text-sm text-muted-foreground">Last 7 days</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-warning-500/10">
              <FileText className="w-6 h-6 text-warning-500" />
            </div>
            <div>
              <div className="font-medium">Pending Review</div>
              <div className="text-sm text-muted-foreground">8 documents</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-lg bg-danger-500/10">
              <FileText className="w-6 h-6 text-danger-500" />
            </div>
            <div>
              <div className="font-medium">Shared</div>
              <div className="text-sm text-muted-foreground">With clients</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table/Grid */}
      <Card>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Matter
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Modified
                  </th>
                  <th className="text-right p-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Loading documents...
                    </td>
                  </tr>
                ) : !filteredDocuments?.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.name)}
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {doc.matterId ? (
                          <Link
                            href={`/dashboard/matters/${doc.matterId}`}
                            className="text-primary hover:underline"
                          >
                            {doc.matterName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-foreground">{doc.documentType}</td>
                      <td className="p-4 text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {isLoading ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  Loading documents...
                </div>
              ) : !filteredDocuments?.length ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No documents found.
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 mb-2">{getFileIcon(doc.name)}</div>
                      <div className="font-medium text-sm truncate w-full">
                        {doc.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(doc.size)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
