import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';
import { ERROR_MESSAGES } from '@shared/domain/errors/error.messages';

export class CorrectiveStatusNotFoundError extends DomainError {
  readonly code = ERROR_CODES.CORRECTIVE_STATUS_NOT_FOUND;

  constructor(id: number) {
    super(ERROR_MESSAGES[ERROR_CODES.CORRECTIVE_STATUS_NOT_FOUND](id));
  }
}
