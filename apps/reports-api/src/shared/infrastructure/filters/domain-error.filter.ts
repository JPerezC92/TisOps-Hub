import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '@shared/domain/errors/domain.error';
import type { ErrorCode } from '@shared/domain/errors/error-codes';

// Explicit overrides for codes that don't follow suffix conventions
const explicitCodeToHttpStatusMap: Partial<Record<ErrorCode, HttpStatus>> = {} as const;

// Suffix-based convention: auto-maps common error patterns to HTTP statuses
const suffixToHttpStatusMap: Record<string, HttpStatus> = {
  _NOT_FOUND: HttpStatus.NOT_FOUND,
  _ALREADY_EXISTS: HttpStatus.CONFLICT,
};

function resolveHttpStatus(code: string): HttpStatus | undefined {
  // 1. Check explicit overrides first
  if (code in explicitCodeToHttpStatusMap) {
    return explicitCodeToHttpStatusMap[code as ErrorCode];
  }

  // 2. Check suffix conventions
  for (const [suffix, status] of Object.entries(suffixToHttpStatusMap)) {
    if (code.endsWith(suffix)) {
      return status;
    }
  }

  return undefined;
}

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorCode = exception.code;

    const status = resolveHttpStatus(errorCode);

    if (!status) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Domain error not mapped: ${errorCode}`,
      });
      return;
    }

    response.status(status).json({
      status: 'fail',
      data: {
        message: exception.message,
        code: errorCode,
      },
    });
  }
}
