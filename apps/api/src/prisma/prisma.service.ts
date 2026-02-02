import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const logLevels: Prisma.LogLevel[] =
      configService.get<string>('NODE_ENV') === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'];

    super({
      log: logLevels,
      errorFormat: 'pretty',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Execute operations within a transaction with tenant context
   * SECURITY: RLS context is set with LOCAL scope to ensure it propagates
   * to all async operations within the transaction boundary (LG-3 fix)
   */
  async executeInTenantContext<T>(
    organizationId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    // Validate organizationId to prevent injection
    if (!organizationId || typeof organizationId !== 'string') {
      throw new Error('Invalid organization ID');
    }

    return this.$transaction(
      async (tx) => {
        // Set RLS context with LOCAL scope (true = local to transaction)
        // This ensures the setting persists for all operations within this transaction
        await tx.$executeRaw`SELECT set_config('app.current_organization_id', ${organizationId}, true)`;

        // Verify the context was set correctly before proceeding
        const result = await tx.$queryRaw<Array<{ current_setting: string }>>`
          SELECT current_setting('app.current_organization_id', true) as current_setting
        `;

        if (!result[0] || result[0].current_setting !== organizationId) {
          throw new Error('Failed to set tenant context');
        }

        return fn(tx);
      },
      {
        // Use serializable isolation to prevent race conditions
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        // Set a reasonable timeout
        timeout: 30000,
      },
    );
  }

  /**
   * Soft delete helper - sets deleted_at timestamp
   */
  softDelete<T extends { deleted_at?: Date | null }>(
    model: T,
  ): T & { deleted_at: Date } {
    return {
      ...model,
      deleted_at: new Date(),
    };
  }

  /**
   * Clean database for testing (only in test environment)
   * SECURITY: Uses whitelist approach to prevent SQL injection (LG-2 fix)
   */
  async cleanDatabase(): Promise<void> {
    if (this.configService.get<string>('NODE_ENV') !== 'test') {
      throw new Error('cleanDatabase can only be called in test environment');
    }

    // Whitelist of tables that can be truncated in tests
    const allowedTables = new Set([
      'users',
      'organizations',
      'matters',
      'documents',
      'workflows',
      'tasks',
      'comments',
      'audit_logs',
      'sessions',
      'refresh_tokens',
      'api_keys',
      'invitations',
      'notifications',
      'templates',
      'clauses',
      'signatures',
      'deadlines',
      'calendar_events',
    ]);

    const tableNames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'`;

    for (const { tablename } of tableNames) {
      // Validate table name against whitelist to prevent SQL injection
      if (!allowedTables.has(tablename)) {
        this.logger.warn(
          `Skipping unknown table during cleanup: ${tablename}`,
        );
        continue;
      }
      // Use parameterized query via Prisma's tagged template
      await this.$executeRaw`TRUNCATE TABLE "public".${Prisma.raw(`"${tablename}"`)} CASCADE`;
    }
  }
}
