import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Transform Interceptor
 * Wraps all successful responses in a standard API response format
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = response.getHeader('x-request-id') as string | undefined;

    return next.handle().pipe(
      map((data) => {
        // If data already has our response structure, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Check if response is paginated
        const isPaginated =
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data &&
          data.meta?.total !== undefined;

        if (isPaginated) {
          return {
            success: true,
            data: data.data,
            meta: {
              timestamp: new Date().toISOString(),
              requestId,
              pagination: data.meta,
            },
          };
        }

        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        };
      }),
    );
  }
}
