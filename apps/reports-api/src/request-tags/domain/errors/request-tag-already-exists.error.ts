import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';
import { ERROR_MESSAGES } from '@shared/domain/errors/error.messages';

export class RequestTagAlreadyExistsError extends DomainError {
  readonly code = ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS;
  readonly requestId: string;

  constructor(requestId: string) {
    super(ERROR_MESSAGES[ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS](requestId));
    this.requestId = requestId;
  }
}
