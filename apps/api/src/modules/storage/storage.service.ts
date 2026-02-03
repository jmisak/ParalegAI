import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import * as crypto from 'crypto';
import * as path from 'path';
import {
  StorageProvider,
  STORAGE_PROVIDER,
  UploadResult,
  FileMetadata,
} from './interfaces/storage.interface';

/**
 * Allowed file extensions for document uploads
 */
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.txt',
  '.rtf',
  '.odt',
  '.ods',
]);

/**
 * Maximum file size: 50MB
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * MIME type mapping
 */
const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
  '.rtf': 'application/rtf',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
};

/**
 * Storage Service
 *
 * Provides a high-level API for file storage operations.
 * Handles tenant-scoped key generation, validation, and checksum calculation.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly provider: StorageProvider,
  ) {}

  /**
   * Upload a file with tenant isolation
   *
   * @param buffer - File content
   * @param originalName - Original filename
   * @param organizationId - Tenant organization ID
   * @param matterId - Optional matter ID for organization
   * @returns Upload result with key and checksum
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    organizationId: string,
    matterId?: string,
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(buffer, originalName);

    // Generate tenant-scoped storage key
    const key = this.generateStorageKey(organizationId, originalName, matterId);
    const contentType = this.getContentType(originalName);

    // Calculate checksum before upload
    const checksum = this.calculateChecksum(buffer);

    // Upload to storage provider
    await this.provider.upload(key, buffer, contentType);

    this.logger.log(
      `File uploaded: org=${organizationId}, key=${key}, size=${buffer.length}`,
    );

    return {
      key,
      size: buffer.length,
      contentType,
      checksum,
    };
  }

  /**
   * Download a file with tenant scope validation
   */
  async downloadFile(key: string, organizationId: string): Promise<Readable> {
    if (!key.startsWith(`${organizationId}/`)) {
      throw new BadRequestException('Access denied to requested file');
    }
    return this.provider.download(key);
  }

  /**
   * Delete a file with tenant scope validation
   */
  async deleteFile(key: string, organizationId: string): Promise<void> {
    if (!key.startsWith(`${organizationId}/`)) {
      throw new BadRequestException('Access denied to requested file');
    }
    await this.provider.delete(key);
    this.logger.log(`File deleted: ${key}`);
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    return this.provider.exists(key);
  }

  /**
   * Get a presigned download URL
   *
   * @param key - Storage key
   * @param expiresInSeconds - URL expiration (default: 1 hour)
   */
  async getDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return this.provider.getPresignedUrl(key, expiresInSeconds);
  }

  /**
   * Get a presigned upload URL for direct browser uploads
   *
   * @param organizationId - Tenant organization ID
   * @param originalName - Original filename
   * @param matterId - Optional matter ID
   * @param expiresInSeconds - URL expiration (default: 5 minutes)
   */
  async getUploadUrl(
    organizationId: string,
    originalName: string,
    matterId?: string,
    expiresInSeconds = 300,
  ): Promise<{ uploadUrl: string; key: string }> {
    this.validateFilename(originalName);

    const key = this.generateStorageKey(organizationId, originalName, matterId);
    const contentType = this.getContentType(originalName);

    const uploadUrl = await this.provider.getPresignedUploadUrl(
      key,
      contentType,
      expiresInSeconds,
    );

    return { uploadUrl, key };
  }

  /**
   * Copy a file to a new location
   */
  async copyFile(sourceKey: string, destKey: string): Promise<void> {
    await this.provider.copy(sourceKey, destKey);
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<FileMetadata> {
    return this.provider.getMetadata(key);
  }

  /**
   * Generate a tenant-scoped storage key
   *
   * Format: {organizationId}/{matterId?}/{timestamp}-{random}-{sanitizedName}
   */
  private generateStorageKey(
    organizationId: string,
    originalName: string,
    matterId?: string,
  ): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);

    const fileName = `${timestamp}-${random}-${baseName}${ext}`;

    if (matterId) {
      return `${organizationId}/matters/${matterId}/${fileName}`;
    }

    return `${organizationId}/general/${fileName}`;
  }

  /**
   * Validate file before upload
   */
  private validateFile(buffer: Buffer, originalName: string): void {
    this.validateFilename(originalName);

    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      );
    }

    if (buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  /**
   * Validate filename and extension
   */
  private validateFilename(originalName: string): void {
    const ext = path.extname(originalName).toLowerCase();

    if (!ext) {
      throw new BadRequestException('File must have an extension');
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(
        `File type not allowed: ${ext}. Allowed types: ${[...ALLOWED_EXTENSIONS].join(', ')}`,
      );
    }
  }

  /**
   * Get MIME type from filename
   */
  private getContentType(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
  }

  /**
   * Calculate SHA-256 checksum
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
