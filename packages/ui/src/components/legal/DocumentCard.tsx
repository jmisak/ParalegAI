import * as React from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Card, CardContent } from '../base/Card.js';
import { Badge } from '../base/Badge.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../base/DropdownMenu.js';
import { Button } from '../base/Button.js';

export type DocumentStatus =
  | 'pending'
  | 'uploaded'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'signed';

export type DocumentType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'other';

export interface DocumentCardProps {
  /** Document ID */
  id: string;
  /** Document name */
  name: string;
  /** File type */
  type: DocumentType;
  /** Document status */
  status: DocumentStatus;
  /** File size in bytes */
  size?: number;
  /** Upload/modification date */
  date?: Date;
  /** Uploaded by user name */
  uploadedBy?: string;
  /** Whether the document requires action */
  requiresAction?: boolean;
  /** Preview thumbnail URL */
  thumbnailUrl?: string;
  /** Click handler for viewing document */
  onView?: () => void;
  /** Click handler for downloading document */
  onDownload?: () => void;
  /** Additional actions menu items */
  menuItems?: Array<{
    label: string;
    onClick: () => void;
    destructive?: boolean;
  }>;
  /** Compact mode for lists */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

const statusConfig: Record<
  DocumentStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
  },
  uploaded: {
    label: 'Uploaded',
    icon: Upload,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50 dark:bg-green-950',
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    color: 'text-red-600 bg-red-50 dark:bg-red-950',
  },
  signed: {
    label: 'Signed',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50 dark:bg-green-950',
  },
};

const fileTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  pdf: { icon: FileText, color: 'text-red-500' },
  doc: { icon: FileText, color: 'text-blue-500' },
  docx: { icon: FileText, color: 'text-blue-500' },
  xls: { icon: FileSpreadsheet, color: 'text-green-500' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-500' },
  jpg: { icon: FileImage, color: 'text-purple-500' },
  jpeg: { icon: FileImage, color: 'text-purple-500' },
  png: { icon: FileImage, color: 'text-purple-500' },
  other: { icon: File, color: 'text-gray-500' },
};

/**
 * DocumentCard displays a file preview with status.
 *
 * @example
 * ```tsx
 * <DocumentCard
 *   id="1"
 *   name="Purchase Agreement.pdf"
 *   type="pdf"
 *   status="approved"
 *   size={1024000}
 *   date={new Date()}
 *   onView={() => {}}
 *   onDownload={() => {}}
 * />
 * ```
 */
const DocumentCard = React.forwardRef<HTMLDivElement, DocumentCardProps>(
  (
    {
      _id,
      name,
      type,
      status,
      size,
      date,
      uploadedBy,
      requiresAction,
      thumbnailUrl,
      onView,
      onDownload,
      menuItems = [],
      compact = false,
      className,
    },
    ref
  ) => {
    const statusInfo = statusConfig[status];
    const fileInfo = fileTypeConfig[type] || fileTypeConfig['other'];
    const FileIcon = fileInfo.icon;
    const StatusIcon = statusInfo.icon;

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    if (compact) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
            requiresAction && 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
            className
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted',
              fileInfo.color
            )}
          >
            <FileIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {size && <span>{formatFileSize(size)}</span>}
              {date && (
                <>
                  <span aria-hidden="true">-</span>
                  <span>{formatDate(date)}</span>
                </>
              )}
            </div>
          </div>

          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
              statusInfo.color
            )}
          >
            <StatusIcon className="h-3 w-3" />
            <span>{statusInfo.label}</span>
          </div>

          <div className="flex items-center gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onView}
                aria-label="View document"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDownload}
                aria-label="Download document"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {menuItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuItems.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={item.onClick}
                      destructive={item.destructive}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(
          'overflow-hidden transition-all duration-200 hover:shadow-md',
          requiresAction && 'border-yellow-500/50',
          className
        )}
      >
        {/* Thumbnail/Preview */}
        <div
          className={cn(
            'relative flex h-32 items-center justify-center bg-muted',
            thumbnailUrl && 'bg-cover bg-center'
          )}
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
        >
          {!thumbnailUrl && (
            <FileIcon className={cn('h-16 w-16', fileInfo.color)} />
          )}
          {requiresAction && (
            <div className="absolute top-2 left-2">
              <Badge variant="warning">Action Required</Badge>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                statusInfo.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium truncate" title={name}>
              {name}
            </h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {size && <span>{formatFileSize(size)}</span>}
                <span className="uppercase">{type}</span>
              </div>
              {date && <span>{formatDate(date)}</span>}
            </div>
            {uploadedBy && (
              <p className="text-xs text-muted-foreground">
                Uploaded by {uploadedBy}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onView && (
                <Button variant="outline" size="sm" onClick={onView}>
                  <Eye className="mr-1 h-4 w-4" />
                  View
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="sm" onClick={onDownload}>
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
            {menuItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuItems.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={item.onClick}
                      destructive={item.destructive}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
DocumentCard.displayName = 'DocumentCard';

export { DocumentCard };
