import * as React from 'react';
import { useDropzone, type DropzoneOptions, type FileRejection } from 'react-dropzone';
import { Upload, X, File, FileText, FileImage, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from '../base/Button.js';

export interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
}

export interface FileUploadProps {
  /** Accepted file types */
  accept?: DropzoneOptions['accept'];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Allow multiple files */
  multiple?: boolean;
  /** Callback when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Callback when files are rejected */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Callback when a file is removed */
  onFileRemove?: (file: File) => void;
  /** Current files (controlled) */
  files?: UploadedFile[];
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Show file previews */
  showPreviews?: boolean;
  /** Compact mode (single file, inline) */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string): React.ReactNode => {
  if (type.startsWith('image/')) {
    return <FileImage className="h-8 w-8 text-purple-500" />;
  }
  if (type === 'application/pdf') {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <File className="h-8 w-8 text-gray-500" />;
};

/**
 * FileUpload component with drag and drop support.
 *
 * @example
 * ```tsx
 * <FileUpload
 *   accept={{ 'application/pdf': ['.pdf'] }}
 *   maxSize={5 * 1024 * 1024}
 *   onFilesSelected={(files) => console.log(files)}
 * />
 * ```
 */
const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      maxSize = 10 * 1024 * 1024, // 10MB default
      maxFiles = 10,
      multiple = true,
      onFilesSelected,
      onFilesRejected,
      onFileRemove,
      files = [],
      label,
      error,
      helperText,
      disabled = false,
      showPreviews = true,
      compact = false,
      className,
    },
    ref
  ) => {
    const [internalFiles, setInternalFiles] = React.useState<UploadedFile[]>([]);

    const displayFiles = files.length > 0 ? files : internalFiles;

    const onDrop = React.useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        if (acceptedFiles.length > 0) {
          const newFiles = acceptedFiles.map((file) => ({
            file,
            preview: file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : undefined,
          }));

          if (files.length === 0) {
            setInternalFiles((prev) =>
              multiple ? [...prev, ...newFiles] : newFiles
            );
          }
          onFilesSelected?.(acceptedFiles);
        }

        if (rejectedFiles.length > 0) {
          onFilesRejected?.(rejectedFiles);
        }
      },
      [files.length, multiple, onFilesSelected, onFilesRejected]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } =
      useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles: multiple ? maxFiles : 1,
        multiple,
        disabled,
      });

    const handleRemove = (fileToRemove: UploadedFile) => {
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      if (files.length === 0) {
        setInternalFiles((prev) =>
          prev.filter((f) => f.file !== fileToRemove.file)
        );
      }
      onFileRemove?.(fileToRemove.file);
    };

    // Cleanup previews on unmount
    React.useEffect(() => {
      return () => {
        internalFiles.forEach((f) => {
          if (f.preview) {
            URL.revokeObjectURL(f.preview);
          }
        });
      };
    }, []);

    const id = React.useId();
    const errorId = error ? `${id}-error` : undefined;
    const helperId = helperText ? `${id}-helper` : undefined;

    if (compact) {
      return (
        <div ref={ref} className={cn('space-y-1.5', className)}>
          {label && (
            <label className="text-sm font-medium leading-none">
              {label}
            </label>
          )}
          <div
            {...getRootProps()}
            className={cn(
              'flex items-center gap-2 rounded-md border bg-background px-3 py-2 transition-colors',
              isDragActive && 'border-primary bg-primary/5',
              isDragReject && 'border-destructive bg-destructive/5',
              error && 'border-destructive',
              disabled && 'cursor-not-allowed opacity-50',
              !disabled && 'cursor-pointer hover:border-primary'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-4 w-4 text-muted-foreground" />
            {displayFiles.length > 0 ? (
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm truncate">
                  {displayFiles[0]?.file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(displayFiles[0]!);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Choose file or drag here
              </span>
            )}
          </div>
          {error && (
            <p id={errorId} className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {label && (
          <label className="text-sm font-medium leading-none">{label}</label>
        )}

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragActive && 'border-primary bg-primary/5',
            isDragReject && 'border-destructive bg-destructive/5',
            error && 'border-destructive',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'cursor-pointer hover:border-primary hover:bg-muted/50'
          )}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        >
          <input {...getInputProps()} />
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              isDragActive ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <Upload
              className={cn(
                'h-6 w-6',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {accept
                ? `Accepted: ${Object.values(accept).flat().join(', ')}`
                : 'All file types accepted'}
              {maxSize && ` - Max ${formatFileSize(maxSize)}`}
            </p>
          </div>
        </div>

        {/* File list */}
        {showPreviews && displayFiles.length > 0 && (
          <ul className="space-y-2" role="list">
            {displayFiles.map((uploadedFile, index) => (
              <li
                key={`${uploadedFile.file.name}-${index}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  uploadedFile.error && 'border-destructive bg-destructive/5'
                )}
              >
                {/* Preview or icon */}
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                    {getFileIcon(uploadedFile.file.type)}
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.error && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {uploadedFile.error}
                    </p>
                  )}
                  {uploadedFile.progress !== undefined &&
                    uploadedFile.progress < 100 && (
                      <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                    )}
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleRemove(uploadedFile)}
                  aria-label={`Remove ${uploadedFile.file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
FileUpload.displayName = 'FileUpload';

export { FileUpload };
