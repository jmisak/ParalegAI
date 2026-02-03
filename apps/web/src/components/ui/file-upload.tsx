'use client';

import * as React from 'react';
import { Upload, X, FileText, File, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { Button } from './button';

/** Represents a file selected for upload along with its client-side metadata. */
export interface UploadFile {
  /** Client-generated unique id for list keying and removal. */
  id: string;
  file: File;
  /** Upload progress percentage (0-100). Managed externally via `onFilesChange`. */
  progress: number;
  /** Optional error message surfaced per-file (e.g. size exceeded). */
  error?: string;
}

export interface FileUploadProps {
  /** Called whenever the internal file list changes (add / remove). */
  onFilesChange: (files: UploadFile[]) => void;
  /** MIME types or extensions accepted by the native file picker and drop validation. */
  accept?: string;
  /** Maximum allowed file size in bytes. Files exceeding this are flagged with an error. */
  maxFileSize?: number;
  /** Allow selecting more than one file at a time. @default true */
  multiple?: boolean;
  /** Externally-controlled file list. When provided the component becomes controlled. */
  files?: UploadFile[];
  /** Label rendered inside the drop zone. */
  label?: string;
  /** Additional description rendered below the label. */
  description?: string;
  /** Disable the entire component. */
  disabled?: boolean;
  className?: string;
}

/** Returns a file-type icon component based on MIME type. */
function getFileIcon(type: string) {
  if (type.startsWith('application/pdf') || type.startsWith('text/')) {
    return FileText;
  }
  return File;
}

let fileIdCounter = 0;
function generateFileId(): string {
  fileIdCounter += 1;
  return `upload-${fileIdCounter}-${Date.now()}`;
}

/**
 * Drag-and-drop file upload component with progress display and file previews.
 * Designed for the IRONCLAD legal document management system.
 */
export function FileUpload({
  onFilesChange,
  accept,
  maxFileSize,
  multiple = true,
  files: controlledFiles,
  label = 'Drag and drop files here, or click to browse',
  description,
  disabled = false,
  className,
}: FileUploadProps) {
  const [internalFiles, setInternalFiles] = React.useState<UploadFile[]>([]);
  const files = controlledFiles ?? internalFiles;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const setFiles = React.useCallback(
    (next: UploadFile[]) => {
      if (!controlledFiles) {
        setInternalFiles(next);
      }
      onFilesChange(next);
    },
    [controlledFiles, onFilesChange],
  );

  /** Validate and append new native Files to the list. */
  const addFiles = React.useCallback(
    (incoming: FileList | File[]) => {
      const newFiles: UploadFile[] = Array.from(incoming).map((file) => {
        const entry: UploadFile = {
          id: generateFileId(),
          file,
          progress: 0,
        };
        if (maxFileSize && file.size > maxFileSize) {
          entry.error = `File exceeds maximum size of ${formatFileSize(maxFileSize)}`;
        }
        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim());
          const matches = acceptedTypes.some((t) => {
            if (t.startsWith('.')) {
              return file.name.toLowerCase().endsWith(t.toLowerCase());
            }
            if (t.endsWith('/*')) {
              return file.type.startsWith(t.replace('/*', '/'));
            }
            return file.type === t;
          });
          if (!matches) {
            entry.error = 'File type not accepted';
          }
        }
        return entry;
      });

      const next = multiple ? [...files, ...newFiles] : newFiles.slice(0, 1);
      setFiles(next);
    },
    [accept, files, maxFileSize, multiple, setFiles],
  );

  const removeFile = React.useCallback(
    (id: string) => {
      setFiles(files.filter((f) => f.id !== id));
    },
    [files, setFiles],
  );

  // --- Drag handlers ---

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles, disabled],
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset value so the same file can be re-selected.
      e.target.value = '';
    },
    [addFiles],
  );

  const openFilePicker = React.useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFilePicker();
      }
    },
    [openFilePicker],
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="file-input"
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload drop zone"
        aria-disabled={disabled}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          'border-input bg-background hover:bg-muted/50',
          isDragOver && 'border-primary bg-primary/5',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full bg-muted',
            isDragOver && 'bg-primary/10',
          )}
        >
          <Upload
            className={cn(
              'h-6 w-6 text-muted-foreground',
              isDragOver && 'text-primary',
            )}
          />
        </div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {accept && (
          <p className="text-xs text-muted-foreground">
            Accepted: {accept}
          </p>
        )}
        {maxFileSize && (
          <p className="text-xs text-muted-foreground">
            Max size: {formatFileSize(maxFileSize)}
          </p>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Selected files">
          {files.map((uploadFile) => {
            const Icon = getFileIcon(uploadFile.file.type);
            const hasError = !!uploadFile.error;

            return (
              <li
                key={uploadFile.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-3',
                  hasError
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'border-input bg-background',
                )}
              >
                <Icon
                  className={cn(
                    'h-8 w-8 shrink-0',
                    hasError ? 'text-destructive' : 'text-muted-foreground',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.file.size)}
                  </p>

                  {hasError ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{uploadFile.error}</span>
                    </div>
                  ) : (
                    uploadFile.progress > 0 &&
                    uploadFile.progress < 100 && (
                      <div className="mt-1.5">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                            role="progressbar"
                            aria-valuenow={uploadFile.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Upload progress for ${uploadFile.file.name}`}
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {uploadFile.progress}%
                        </p>
                      </div>
                    )
                  )}

                  {uploadFile.progress === 100 && !hasError && (
                    <p className="mt-0.5 text-xs text-emerald-600">
                      Upload complete
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(uploadFile.id);
                  }}
                  aria-label={`Remove ${uploadFile.file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
