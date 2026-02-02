import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Storage service for document file management
 * Supports local filesystem and S3 (extensible)
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storageType: 'local' | 's3';
  private readonly localPath: string;

  constructor(private readonly configService: ConfigService) {
    // Determine storage type based on config
    this.storageType = configService.get<string>('S3_BUCKET') ? 's3' : 'local';
    this.localPath = configService.get<string>('LOCAL_STORAGE_PATH') || './uploads';
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    organizationId: string,
  ): Promise<string> {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const fileName = `${timestamp}-${hash}${ext}`;
    const storagePath = `${organizationId}/${fileName}`;

    if (this.storageType === 'local') {
      return this.uploadToLocal(buffer, storagePath);
    }

    return this.uploadToS3(buffer, storagePath);
  }

  /**
   * Download a file from storage
   */
  async downloadFile(storagePath: string): Promise<Readable> {
    if (this.storageType === 'local') {
      return this.downloadFromLocal(storagePath);
    }

    return this.downloadFromS3(storagePath);
  }

  /**
   * Get a presigned URL for temporary access
   */
  async getPresignedUrl(storagePath: string, expiresInSeconds: number): Promise<string> {
    if (this.storageType === 'local') {
      // For local storage, return a signed token-based URL
      const token = this.generateAccessToken(storagePath, expiresInSeconds);
      const baseUrl = this.configService.get<string>('API_BASE_URL') || 'http://localhost:3001';
      return `${baseUrl}/api/v1/documents/shared/${token}`;
    }

    return this.getS3PresignedUrl(storagePath, expiresInSeconds);
  }

  /**
   * Calculate SHA-256 hash of file content
   */
  async calculateHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    if (this.storageType === 'local') {
      await this.deleteFromLocal(storagePath);
    } else {
      await this.deleteFromS3(storagePath);
    }
  }

  // Local storage implementation
  private async uploadToLocal(buffer: Buffer, storagePath: string): Promise<string> {
    const fullPath = path.join(this.localPath, storagePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    this.logger.log(`File uploaded to local storage: ${storagePath}`);
    return storagePath;
  }

  private async downloadFromLocal(storagePath: string): Promise<Readable> {
    const fullPath = path.join(this.localPath, storagePath);
    const buffer = await fs.readFile(fullPath);
    return Readable.from(buffer);
  }

  private async deleteFromLocal(storagePath: string): Promise<void> {
    const fullPath = path.join(this.localPath, storagePath);
    await fs.unlink(fullPath);
    this.logger.log(`File deleted from local storage: ${storagePath}`);
  }

  // S3 storage implementation (placeholder - would use AWS SDK)
  private async uploadToS3(buffer: Buffer, storagePath: string): Promise<string> {
    // TODO: Implement S3 upload using @aws-sdk/client-s3
    this.logger.warn('S3 upload not implemented, using local fallback');
    return this.uploadToLocal(buffer, storagePath);
  }

  private async downloadFromS3(storagePath: string): Promise<Readable> {
    // TODO: Implement S3 download using @aws-sdk/client-s3
    this.logger.warn('S3 download not implemented, using local fallback');
    return this.downloadFromLocal(storagePath);
  }

  private async deleteFromS3(storagePath: string): Promise<void> {
    // TODO: Implement S3 delete using @aws-sdk/client-s3
    this.logger.warn('S3 delete not implemented, using local fallback');
    await this.deleteFromLocal(storagePath);
  }

  private async getS3PresignedUrl(
    storagePath: string,
    expiresInSeconds: number,
  ): Promise<string> {
    // TODO: Implement S3 presigned URL using @aws-sdk/s3-request-presigner
    this.logger.warn('S3 presigned URL not implemented');
    const token = this.generateAccessToken(storagePath, expiresInSeconds);
    const baseUrl = this.configService.get<string>('API_BASE_URL') || 'http://localhost:3001';
    return `${baseUrl}/api/v1/documents/shared/${token}`;
  }

  private generateAccessToken(storagePath: string, expiresInSeconds: number): string {
    const payload = {
      path: storagePath,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    };
    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64url');
    return `${data}.${signature}`;
  }
}
