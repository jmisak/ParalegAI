import { Module, DynamicModule, Provider, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { S3StorageProvider } from './providers/s3.provider';
import { LocalStorageProvider } from './providers/local.provider';
import { storageConfig } from './storage.config';
import { STORAGE_PROVIDER, StorageConfig } from './interfaces/storage.interface';

/**
 * Storage Module
 *
 * Provides file storage capabilities with support for:
 * - Local filesystem (development/testing)
 * - S3/MinIO (production)
 *
 * @example
 * ```typescript
 * // In your app module
 * @Module({
 *   imports: [StorageModule.forRoot()],
 * })
 * export class AppModule {}
 *
 * // In a service
 * constructor(private readonly storageService: StorageService) {}
 *
 * async uploadDocument(file: Buffer, name: string, orgId: string) {
 *   return this.storageService.uploadFile(file, name, orgId);
 * }
 * ```
 */
@Module({})
export class StorageModule {
  private static readonly logger = new Logger(StorageModule.name);

  /**
   * Register storage module with automatic provider detection
   */
  static forRoot(): DynamicModule {
    const storageProviderFactory: Provider = {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const config = configService.get<StorageConfig>('storage');
        const storageType = config?.type || 'local';

        this.logger.log(`Initializing storage provider: ${storageType}`);

        if (storageType === 's3' && config?.s3?.bucket) {
          return new S3StorageProvider(configService);
        }

        return new LocalStorageProvider(configService);
      },
      inject: [ConfigService],
    };

    return {
      module: StorageModule,
      imports: [ConfigModule.forFeature(storageConfig)],
      providers: [storageProviderFactory, StorageService],
      exports: [StorageService, STORAGE_PROVIDER],
      global: true,
    };
  }

  /**
   * Register storage module with explicit provider
   */
  static forRootAsync(options: {
    useFactory: (
      ...args: unknown[]
    ) => Promise<'local' | 's3'> | 'local' | 's3';
    inject?: unknown[];
  }): DynamicModule {
    const storageProviderFactory: Provider = {
      provide: STORAGE_PROVIDER,
      useFactory: async (configService: ConfigService, ...args: unknown[]) => {
        const storageType = await options.useFactory(...args);

        this.logger.log(`Initializing storage provider: ${storageType}`);

        if (storageType === 's3') {
          return new S3StorageProvider(configService);
        }

        return new LocalStorageProvider(configService);
      },
      inject: [ConfigService, ...(options.inject || [])],
    };

    return {
      module: StorageModule,
      imports: [ConfigModule.forFeature(storageConfig)],
      providers: [storageProviderFactory, StorageService],
      exports: [StorageService, STORAGE_PROVIDER],
      global: true,
    };
  }
}
