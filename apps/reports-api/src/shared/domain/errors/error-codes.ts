export const ERROR_CODES = {
  REQUEST_TAG_ALREADY_EXISTS: 'REQUEST_TAG_ALREADY_EXISTS',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
