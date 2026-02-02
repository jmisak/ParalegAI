import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'ok' | 'error';
    memory: 'ok' | 'warning' | 'error';
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check(): Promise<HealthStatus> {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
    };

    const status = Object.values(checks).every((c) => c === 'ok')
      ? 'ok'
      : Object.values(checks).some((c) => c === 'error')
        ? 'unhealthy'
        : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '0.1.0',
      uptime: process.uptime(),
      checks,
    };
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch (error) {
      // SECURITY: Log database health check failures for monitoring (LG-7 fix)
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : String(error),
      );
      return 'error';
    }
  }

  private checkMemory(): 'ok' | 'warning' | 'error' {
    const used = process.memoryUsage();
    const heapUsedMB = used.heapUsed / 1024 / 1024;
    const heapTotalMB = used.heapTotal / 1024 / 1024;
    const ratio = heapUsedMB / heapTotalMB;

    if (ratio > 0.9) return 'error';
    if (ratio > 0.7) return 'warning';
    return 'ok';
  }
}
