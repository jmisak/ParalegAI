import { registerAs } from '@nestjs/config';
import { StorageConfig } from './interfaces/storage.interface';

export const storageConfig = registerAs(
  'storage',
  (): StorageConfig => ({
    type: process.env.STORAGE_TYPE === 's3' ? 's3' : 'local',
    localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT, // MinIO endpoint
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    },
  }),
);
