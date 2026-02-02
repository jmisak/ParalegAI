import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface SessionData {
  userId: string;
  organizationId: string;
  roles: string[];
  createdAt: string;
  lastActivity: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Session management service using Redis
 * Handles session creation, validation, and revocation
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly redis: Redis;
  private readonly sessionTimeoutMinutes: number;
  private readonly absoluteTimeoutHours: number;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get<string>('REDIS_HOST') || 'localhost',
      port: configService.get<number>('REDIS_PORT') || 6379,
      password: configService.get<string>('REDIS_PASSWORD'),
      keyPrefix: 'ironclad:session:',
    });

    this.sessionTimeoutMinutes =
      configService.get<number>('SESSION_TIMEOUT_MINUTES') || 15;
    this.absoluteTimeoutHours =
      configService.get<number>('SESSION_ABSOLUTE_TIMEOUT_HOURS') || 8;

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    sessionId: string,
    data: {
      organizationId: string;
      roles: string[];
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<void> {
    const sessionData: SessionData = {
      userId,
      organizationId: data.organizationId,
      roles: data.roles,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    };

    // Store session with absolute timeout
    const ttlSeconds = this.absoluteTimeoutHours * 3600;
    await this.redis.setex(sessionId, ttlSeconds, JSON.stringify(sessionData));

    // Add to user's session set
    await this.redis.sadd(`user:${userId}:sessions`, sessionId);
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.redis.get(sessionId);
    if (!data) {
      return null;
    }

    const session = JSON.parse(data) as SessionData;

    // Check inactivity timeout
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const inactiveMinutes =
      (now.getTime() - lastActivity.getTime()) / 1000 / 60;

    if (inactiveMinutes > this.sessionTimeoutMinutes) {
      await this.deleteSession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Update session last activity timestamp
   */
  async touchSession(sessionId: string): Promise<void> {
    const data = await this.redis.get(sessionId);
    if (!data) {
      return;
    }

    const session = JSON.parse(data) as SessionData;
    session.lastActivity = new Date().toISOString();

    // Keep existing TTL
    const ttl = await this.redis.ttl(sessionId);
    if (ttl > 0) {
      await this.redis.setex(sessionId, ttl, JSON.stringify(session));
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const data = await this.redis.get(sessionId);
    if (data) {
      const session = JSON.parse(data) as SessionData;
      await this.redis.srem(`user:${session.userId}:sessions`, sessionId);
    }
    await this.redis.del(sessionId);
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const sessionIds = await this.redis.smembers(`user:${userId}:sessions`);
    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      } else {
        // Clean up stale reference
        await this.redis.srem(`user:${userId}:sessions`, sessionId);
      }
    }

    return sessions;
  }

  /**
   * Revoke all sessions except the specified one
   */
  async revokeAllExcept(
    userId: string,
    keepSessionId: string,
  ): Promise<number> {
    const sessionIds = await this.redis.smembers(`user:${userId}:sessions`);
    let revokedCount = 0;

    for (const sessionId of sessionIds) {
      if (sessionId !== keepSessionId) {
        await this.deleteSession(sessionId);
        revokedCount++;
      }
    }

    return revokedCount;
  }

  /**
   * Check if session is valid
   */
  async isValidSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return session !== null;
  }
}
