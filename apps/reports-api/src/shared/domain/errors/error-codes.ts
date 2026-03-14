export const ERROR_CODES = {
  // request-tags
  REQUEST_TAG_ALREADY_EXISTS: 'REQUEST_TAG_ALREADY_EXISTS',

  // application-registry
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  APPLICATION_PATTERN_NOT_FOUND: 'APPLICATION_PATTERN_NOT_FOUND',

  // module-registry
  MODULE_NOT_FOUND: 'MODULE_NOT_FOUND',

  // categorization-registry
  CATEGORIZATION_NOT_FOUND: 'CATEGORIZATION_NOT_FOUND',

  // corrective-status-registry
  CORRECTIVE_STATUS_NOT_FOUND: 'CORRECTIVE_STATUS_NOT_FOUND',

  // monthly-report-status-registry
  MONTHLY_REPORT_STATUS_NOT_FOUND: 'MONTHLY_REPORT_STATUS_NOT_FOUND',

  // error-logs
  ERROR_LOG_NOT_FOUND: 'ERROR_LOG_NOT_FOUND',

  // tasks
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
