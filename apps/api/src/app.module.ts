import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigModule } from '@config/config.module';
import { appConfig, validateEnv } from '@config/app.config';
import { AuthModule } from '@modules/auth/auth.module';
import { MatterModule } from '@modules/matter/matter.module';
import { DocumentModule } from '@modules/document/document.module';
import { AIModule } from '@modules/ai/ai.module';
import { WorkflowModule } from '@modules/workflow/workflow.module';
import { SearchModule } from '@modules/search/search.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),

    // BullMQ for job processing
    BullModule.forRoot({
      connection: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
        password: process.env['REDIS_PASSWORD'],
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    }),

    // Infrastructure
    AppConfigModule,
    PrismaModule,

    // Feature modules
    AuthModule,
    MatterModule,
    DocumentModule,
    AIModule,
    WorkflowModule,
    SearchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
