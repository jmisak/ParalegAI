import { Readable } from 'stream';

/**
 * Storage provider interface for file operations
 */
export interface StorageProvider {
  /**
   * Upload a file to storage
   * @param key - Storage key/path for the file
   * @param buffer - File content
   * @param contentType - MIME type of the file
   * @returns Storage key
   */
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>;

  /**
   * Download a file from storage
   * @param key - Storage key/path
   * @returns Readable stream of file content
   */
  download(key: string): Promise<Readable>;

  /**
   * Delete a file from storage
   * @param key - Storage key/path
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a file exists
   * @param key - Storage key/path
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get a presigned URL for temporary access
   * @param key - Storage key/path
   * @param expiresInSeconds - URL expiration time
   * @returns Presigned URL
   */
  getPresignedUrl(key: string, expiresInSeconds: number): Promise<string>;

  /**
   * Get presigned URL for upload
   * @param key - Storage key/path
   * @param contentType - Expected MIME type
   * @param expiresInSeconds - URL expiration time
   * @returns Presigned upload URL
   */
  getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ): Promise<string>;

  /**
   * Copy a file within storage
   * @param sourceKey - Source key
   * @param destKey - Destination key
   */
  copy(sourceKey: string, destKey: string): Promise<void>;

  /**
   * Get file metadata
   * @param key - Storage key/path
   */
  getMetadata(key: string): Promise<FileMetadata>;
}

/**
 * File metadata returned from storage
 */
export interface FileMetadata {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag?: string;
}

/**
 * Upload result with storage details
 */
export interface UploadResult {
  key: string;
  size: number;
  contentType: string;
  checksum: string;
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
  type: 'local' | 's3';
  localPath?: string;
  s3?: {
    bucket: string;
    region: string;
    endpoint?: string; // For MinIO/custom S3
    accessKeyId?: string;
    secretAccessKey?: string;
    forcePathStyle?: boolean; // Required for MinIO
  };
}

/**
 * Token for dependency injection
 */
export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
