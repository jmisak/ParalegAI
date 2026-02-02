import { z } from 'zod';

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Session
  SESSION_SECRET: z.string().min(32),
  SESSION_TIMEOUT_MINUTES: z.coerce.number().default(15),
  SESSION_ABSOLUTE_TIMEOUT_HOURS: z.coerce.number().default(8),

  // AI Providers
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_DEFAULT_PROVIDER: z.enum(['anthropic', 'openai']).default('anthropic'),

  // Storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Encryption
  ENCRYPTION_KEY: z.string().min(32).optional(),

  // External integrations
  DOCUSIGN_INTEGRATION_KEY: z.string().optional(),
  DOCUSIGN_USER_ID: z.string().optional(),
  DOCUSIGN_ACCOUNT_ID: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate environment variables at startup
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `  ${field}: ${messages?.join(', ')}`)
      .join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return result.data;
}

/**
 * Application configuration factory
 */
export const appConfig = () => ({
  app: {
    env: process.env['NODE_ENV'] || 'development',
    port: parseInt(process.env['PORT'] || '3001', 10),
    corsOrigins: process.env['CORS_ORIGINS']?.split(',') || [
      'http://localhost:3000',
    ],
  },
  database: {
    url: process.env['DATABASE_URL'],
  },
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'],
  },
  jwt: {
    secret: process.env['JWT_SECRET'],
    expiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
    refreshSecret: process.env['JWT_REFRESH_SECRET'],
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  },
  session: {
    secret: process.env['SESSION_SECRET'],
    timeoutMinutes: parseInt(
      process.env['SESSION_TIMEOUT_MINUTES'] || '15',
      10,
    ),
    absoluteTimeoutHours: parseInt(
      process.env['SESSION_ABSOLUTE_TIMEOUT_HOURS'] || '8',
      10,
    ),
  },
  ai: {
    anthropicApiKey: process.env['ANTHROPIC_API_KEY'],
    openaiApiKey: process.env['OPENAI_API_KEY'],
    defaultProvider:
      (process.env['AI_DEFAULT_PROVIDER'] as 'anthropic' | 'openai') ||
      'anthropic',
  },
  storage: {
    bucket: process.env['S3_BUCKET'],
    region: process.env['S3_REGION'] || 'us-east-1',
    accessKeyId: process.env['S3_ACCESS_KEY_ID'],
    secretAccessKey: process.env['S3_SECRET_ACCESS_KEY'],
  },
  encryption: {
    key: process.env['ENCRYPTION_KEY'],
  },
  integrations: {
    docusign: {
      integrationKey: process.env['DOCUSIGN_INTEGRATION_KEY'],
      userId: process.env['DOCUSIGN_USER_ID'],
      accountId: process.env['DOCUSIGN_ACCOUNT_ID'],
    },
  },
});

export type AppConfig = ReturnType<typeof appConfig>;
