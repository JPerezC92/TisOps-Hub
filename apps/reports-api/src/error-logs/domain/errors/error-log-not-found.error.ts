import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';
import { ERROR_MESSAGES } from '@shared/domain/errors/error.messages';

export class ErrorLogNotFoundError extends DomainError {
  readonly code = ERROR_CODES.ERROR_LOG_NOT_FOUND;

  constructor(id: number) {
    super(ERROR_MESSAGES[ERROR_CODES.ERROR_LOG_NOT_FOUND](id));
  }
}
