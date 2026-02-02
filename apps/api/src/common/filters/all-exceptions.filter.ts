import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Error response structure
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    path: string;
    requestId?: string;
  };
}

/**
 * All Exceptions Filter
 * Catches all exceptions and formats them consistently
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } =
      this.extractExceptionDetails(exception);
    const requestId = response.getHeader('x-request-id') as string | undefined;

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details: process.env['NODE_ENV'] !== 'production' ? details : undefined,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      },
    };

    // Log the error
    this.logException(exception, request, status);

    response.status(status).json(errorResponse);
  }

  private extractExceptionDetails(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    // NestJS HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && 'message' in response
          ? Array.isArray(response.message)
            ? response.message.join(', ')
            : (response.message as string)
          : exception.message;

      return {
        status,
        code: this.getErrorCode(status),
        message,
        details: typeof response === 'object' ? response : undefined,
      };
    }

    // Prisma exceptions
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided',
        details: exception.message,
      };
    }

    // Generic errors
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR',
        message:
          process.env['NODE_ENV'] === 'production'
            ? 'An unexpected error occurred'
            : exception.message,
        details: exception.stack,
      };
    }

    // Unknown errors
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this value already exists',
          details: { fields: exception.meta?.['target'] },
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: 'Record not found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: 'Related record not found',
          details: { field: exception.meta?.['field_name'] },
        };
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'REQUIRED_RELATION_VIOLATION',
          message: 'Required relation would be violated',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: `DATABASE_ERROR_${exception.code}`,
          message: 'Database operation failed',
          details: exception.meta,
        };
    }
  }

  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[status] || 'ERROR';
  }

  private logException(
    exception: unknown,
    request: Request,
    status: number,
  ): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    const logContext = {
      method: request.method,
      url: request.url,
      status,
      userAgent: request.headers['user-agent'],
    };

    if (status >= 500) {
      this.logger.error(message, stack, JSON.stringify(logContext));
    } else if (status >= 400) {
      this.logger.warn(`${message} - ${JSON.stringify(logContext)}`);
    }
  }
}
