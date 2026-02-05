import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedRequest } from '@common/interfaces';

/**
 * Audit log entry structure
 */
interface AuditLogEntry {
  timestamp: string;
  userId: string | null;
  organizationId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  ip: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

/**
 * Audit Log Interceptor
 * Logs all API requests for compliance and security auditing
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Extract request details
    const { method, url, ip: _ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const user = request.user;

    // Determine resource from controller/handler
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const resource = controller.replace('Controller', '').toLowerCase();

    // Extract resource ID from params if available
    const resourceId = (request.params['id'] as string) || null;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const entry = this.buildAuditEntry({
            userId: user?.sub || null,
            organizationId: user?.organizationId || null,
            action: handler,
            resource,
            resourceId,
            method,
            path: url,
            statusCode: response.statusCode,
            duration,
            ip: this.extractClientIp(request),
            userAgent: typeof userAgent === 'string' ? userAgent : 'unknown',
          });

          this.logAuditEntry(entry);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const entry = this.buildAuditEntry({
            userId: user?.sub || null,
            organizationId: user?.organizationId || null,
            action: handler,
            resource,
            resourceId,
            method,
            path: url,
            statusCode: error.status || 500,
            duration,
            ip: this.extractClientIp(request),
            userAgent: typeof userAgent === 'string' ? userAgent : 'unknown',
            metadata: { error: error.message },
          });

          this.logAuditEntry(entry);
        },
      }),
    );
  }

  private buildAuditEntry(
    data: Omit<AuditLogEntry, 'timestamp'>,
  ): AuditLogEntry {
    return {
      timestamp: new Date().toISOString(),
      ...data,
    };
  }

  private extractClientIp(request: AuthenticatedRequest): string {
    // Handle proxied requests
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips?.trim() || request.ip || 'unknown';
    }
    return request.ip || 'unknown';
  }

  private logAuditEntry(entry: AuditLogEntry): void {
    // In production, this would write to a dedicated audit log store
    // For now, log as structured JSON
    const logMessage = JSON.stringify(entry);

    if (entry.statusCode >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }

    // TODO: Implement async write to audit log table
    // this.auditService.create(entry);
  }
}
