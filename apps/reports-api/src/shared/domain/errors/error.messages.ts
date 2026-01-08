import { ERROR_CODES } from './error-codes';

export const ERROR_MESSAGES = {
  [ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS]: (requestId: string) =>
    `Request tag with ID '${requestId}' already exists`,
} as const;
