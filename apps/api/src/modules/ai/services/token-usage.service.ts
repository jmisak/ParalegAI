import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface UsageRecord {
  organizationId: string;
  userId: string;
  provider: string;
  requestType: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  durationMs: number;
}

interface UsageQuery {
  startDate?: Date;
  endDate?: Date;
  provider?: string;
  userId?: string;
}

interface UsageStats {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  byProvider: Record<string, { tokens: number; cost: number; count: number }>;
  byRequestType: Record<string, { tokens: number; cost: number; count: number }>;
  byUser: Record<string, { tokens: number; cost: number; count: number }>;
  dailyUsage: Array<{ date: string; tokens: number; cost: number }>;
}

/**
 * Token Usage Service
 * Tracks and reports on AI token usage per organization
 */
@Injectable()
export class TokenUsageService {
  private readonly logger = new Logger(TokenUsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track token usage for an AI request
   */
  async trackUsage(record: UsageRecord): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        INSERT INTO ai_token_usage (
          id, organization_id, user_id, provider, request_type,
          input_tokens, output_tokens, total_tokens, cost, duration_ms, created_at
        )
        VALUES (
          gen_random_uuid(),
          ${record.organizationId}::uuid,
          ${record.userId}::uuid,
          ${record.provider},
          ${record.requestType},
          ${record.inputTokens},
          ${record.outputTokens},
          ${record.totalTokens},
          ${record.cost},
          ${record.durationMs},
          NOW()
        )
      `;
    } catch (error) {
      // Log but don't fail the request if tracking fails
      this.logger.error('Failed to track token usage', error);
    }
  }

  /**
   * Get usage statistics for an organization
   */
  async getUsage(organizationId: string, query: UsageQuery): Promise<UsageStats> {
    const startDate = query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate || new Date();

    try {
      // Get aggregate stats
      const aggregateResult = await this.prisma.$queryRaw<
        Array<{
          total_tokens: bigint;
          total_cost: number;
          request_count: bigint;
        }>
      >`
        SELECT
          COALESCE(SUM(total_tokens), 0) as total_tokens,
          COALESCE(SUM(cost), 0) as total_cost,
          COUNT(*) as request_count
        FROM ai_token_usage
        WHERE organization_id = ${organizationId}::uuid
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
      `;

      // Get breakdown by provider
      const byProviderResult = await this.prisma.$queryRaw<
        Array<{
          provider: string;
          tokens: bigint;
          cost: number;
          count: bigint;
        }>
      >`
        SELECT
          provider,
          COALESCE(SUM(total_tokens), 0) as tokens,
          COALESCE(SUM(cost), 0) as cost,
          COUNT(*) as count
        FROM ai_token_usage
        WHERE organization_id = ${organizationId}::uuid
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        GROUP BY provider
      `;

      // Get breakdown by request type
      const byTypeResult = await this.prisma.$queryRaw<
        Array<{
          request_type: string;
          tokens: bigint;
          cost: number;
          count: bigint;
        }>
      >`
        SELECT
          request_type,
          COALESCE(SUM(total_tokens), 0) as tokens,
          COALESCE(SUM(cost), 0) as cost,
          COUNT(*) as count
        FROM ai_token_usage
        WHERE organization_id = ${organizationId}::uuid
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        GROUP BY request_type
      `;

      // Get breakdown by user
      const byUserResult = await this.prisma.$queryRaw<
        Array<{
          user_id: string;
          tokens: bigint;
          cost: number;
          count: bigint;
        }>
      >`
        SELECT
          user_id::text,
          COALESCE(SUM(total_tokens), 0) as tokens,
          COALESCE(SUM(cost), 0) as cost,
          COUNT(*) as count
        FROM ai_token_usage
        WHERE organization_id = ${organizationId}::uuid
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        GROUP BY user_id
      `;

      // Get daily usage
      const dailyResult = await this.prisma.$queryRaw<
        Array<{
          date: Date;
          tokens: bigint;
          cost: number;
        }>
      >`
        SELECT
          DATE(created_at) as date,
          COALESCE(SUM(total_tokens), 0) as tokens,
          COALESCE(SUM(cost), 0) as cost
        FROM ai_token_usage
        WHERE organization_id = ${organizationId}::uuid
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      const aggregate = aggregateResult[0];

      return {
        totalTokens: Number(aggregate?.total_tokens || 0),
        totalCost: Number(aggregate?.total_cost || 0),
        requestCount: Number(aggregate?.request_count || 0),
        byProvider: this.mapBreakdown(byProviderResult, 'provider'),
        byRequestType: this.mapBreakdown(byTypeResult, 'request_type'),
        byUser: this.mapBreakdown(byUserResult, 'user_id'),
        dailyUsage: dailyResult.map((r) => ({
          date: r.date.toISOString().split('T')[0] || '',
          tokens: Number(r.tokens),
          cost: Number(r.cost),
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get usage stats', error);

      // Return empty stats if query fails
      return {
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0,
        byProvider: {},
        byRequestType: {},
        byUser: {},
        dailyUsage: [],
      };
    }
  }

  private mapBreakdown(
    results: Array<{ tokens: bigint; cost: number; count: bigint; [key: string]: unknown }>,
    keyField: string,
  ): Record<string, { tokens: number; cost: number; count: number }> {
    const breakdown: Record<string, { tokens: number; cost: number; count: number }> = {};

    for (const row of results) {
      const key = row[keyField] as string;
      breakdown[key] = {
        tokens: Number(row.tokens),
        cost: Number(row.cost),
        count: Number(row.count),
      };
    }

    return breakdown;
  }
}
