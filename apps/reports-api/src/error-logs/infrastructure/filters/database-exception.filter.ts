import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LibsqlError } from '@libsql/client';
import { LogErrorUseCase } from '../../application/use-cases/log-error.use-case';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  constructor(private readonly logErrorUseCase: LogErrorUseCase) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default status and message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'UnknownError';

    // Extract error details
    if (exception instanceof LibsqlError) {
      errorType = 'DatabaseError';
      status = HttpStatus.BAD_REQUEST;

      // Map common database errors to user-friendly messages
      if (exception.message.includes('UNIQUE constraint failed')) {
        message = 'A record with this information already exists';
        status = HttpStatus.CONFLICT;
      } else if (exception.message.includes('NOT NULL constraint failed')) {
        message = 'Required field is missing';
        status = HttpStatus.BAD_REQUEST;
      } else if (exception.message.includes('FOREIGN KEY constraint failed')) {
        message = 'Referenced record does not exist';
        status = HttpStatus.BAD_REQUEST;
      } else {
        message = 'Database operation failed';
      }
    } else if (exception instanceof Error) {
      errorType = exception.constructor.name;
      message = exception.message;

      // Check for HTTP exceptions from NestJS
      if ('getStatus' in exception && typeof exception.getStatus === 'function') {
        status = (exception as any).getStatus();
      }
    }

    // Log error to database asynchronously (don't block response)
    this.logErrorToDatabase(exception, request, errorType).catch((err) => {
      this.logger.error('Failed to log error to database', err);
    });

    // Log to console for immediate visibility
    this.logger.error(
      `${request.method} ${request.url} - ${errorType}: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Send user-friendly response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  private async logErrorToDatabase(
    exception: unknown,
    request: Request,
    errorType: string,
  ) {
    try {
      await this.logErrorUseCase.execute({
        errorType,
        errorMessage:
          exception instanceof Error ? exception.message : String(exception),
        stackTrace: exception instanceof Error ? exception.stack : undefined,
        endpoint: request.url,
        method: request.method,
        userId: (request as any).user?.id, // If you have auth, extract user ID
        metadata: {
          body: request.body,
          query: request.query,
          params: request.params,
          headers: {
            'user-agent': request.headers['user-agent'],
            'content-type': request.headers['content-type'],
          },
        },
      });
    } catch (error) {
      // Don't throw - we don't want error logging to crash the app
      this.logger.error('Failed to log error to database', error);
    }
  }
}
