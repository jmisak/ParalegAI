// Storage module exports
export { StorageModule } from './storage.module';
export { StorageService } from './storage.service';
export { storageConfig } from './storage.config';

// Interfaces
export {
  StorageProvider,
  StorageConfig,
  FileMetadata,
  UploadResult,
  STORAGE_PROVIDER,
} from './interfaces/storage.interface';

// Providers (for testing/custom usage)
export { S3StorageProvider } from './providers/s3.provider';
export { LocalStorageProvider } from './providers/local.provider';
