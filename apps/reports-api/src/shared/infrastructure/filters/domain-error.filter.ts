import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES, ErrorCode } from '@shared/domain/errors/error-codes';

const errorCodeToHttpStatusMap: Record<ErrorCode, HttpStatus> = {
  [ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS]: HttpStatus.CONFLICT,
} as const;

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorCode = exception.code;

    const status = errorCodeToHttpStatusMap[errorCode as ErrorCode];

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
