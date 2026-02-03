import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  StorageProvider,
  FileMetadata,
  StorageConfig,
} from '../interfaces/storage.interface';

/**
 * Local filesystem storage provider
 * Used for development and testing
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly basePath: string;
  private readonly jwtSecret: string;
  private readonly apiBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<StorageConfig>('storage');
    this.basePath = path.resolve(config?.localPath || './uploads');
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'dev-secret';
    this.apiBaseUrl =
      this.configService.get<string>('API_BASE_URL') || 'http://localhost:3001';

    this.logger.log(`Local storage provider initialized: ${this.basePath}`);
  }

  /**
   * Resolve a key to a full path, preventing path traversal
   */
  private safePath(key: string): string {
    const fullPath = path.resolve(this.basePath, key);
    if (!fullPath.startsWith(this.basePath)) {
      throw new Error('Invalid storage key: path traversal detected');
    }
    return fullPath;
  }

  async upload(
    key: string,
    buffer: Buffer,
    _contentType: string,
  ): Promise<string> {
    const fullPath = this.safePath(key);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    this.logger.debug(`File uploaded: ${key}`);
    return key;
  }

  async download(key: string): Promise<Readable> {
    const fullPath = this.safePath(key);
    return fsSync.createReadStream(fullPath);
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.safePath(key);

    try {
      await fs.unlink(fullPath);
      this.logger.debug(`File deleted: ${key}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.safePath(key);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getPresignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    // Generate a signed token for local file access
    const token = this.generateSignedToken(key, expiresInSeconds);
    return `${this.apiBaseUrl}/api/v1/storage/download/${token}`;
  }

  async getPresignedUploadUrl(
    key: string,
    _contentType: string,
    expiresInSeconds: number,
  ): Promise<string> {
    // Generate a signed token for local file upload
    const token = this.generateSignedToken(key, expiresInSeconds, true);
    return `${this.apiBaseUrl}/api/v1/storage/upload/${token}`;
  }

  async copy(sourceKey: string, destKey: string): Promise<void> {
    const sourcePath = this.safePath(sourceKey);
    const destPath = this.safePath(destKey);
    const destDir = path.dirname(destPath);

    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(sourcePath, destPath);

    this.logger.debug(`File copied: ${sourceKey} -> ${destKey}`);
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    const fullPath = this.safePath(key);
    const stats = await fs.stat(fullPath);

    return {
      key,
      size: stats.size,
      contentType: this.guessContentType(key),
      lastModified: stats.mtime,
    };
  }

  /**
   * Generate a signed token for secure file access
   */
  private generateSignedToken(
    key: string,
    expiresInSeconds: number,
    isUpload = false,
  ): string {
    const payload = {
      key,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      action: isUpload ? 'upload' : 'download',
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(data)
      .digest('base64url');

    return `${data}.${signature}`;
  }

  /**
   * Verify a signed token and return the payload
   */
  verifySignedToken(token: string): { key: string; action: string } | null {
    const [data, signature] = token.split('.');

    if (!data || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(data)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    try {
      const payload = JSON.parse(Buffer.from(data, 'base64url').toString());

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token expired
      }

      return { key: payload.key, action: payload.action };
    } catch {
      return null;
    }
  }

  /**
   * Guess content type from file extension
   */
  private guessContentType(key: string): string {
    const ext = path.extname(key).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.json': 'application/json',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}
