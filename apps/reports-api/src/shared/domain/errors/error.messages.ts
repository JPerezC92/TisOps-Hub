import { ERROR_CODES } from './error-codes';

export const ERROR_MESSAGES = {
  [ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS]: (requestId: string) =>
    `Request tag with ID '${requestId}' already exists`,

  [ERROR_CODES.APPLICATION_NOT_FOUND]: (id: number) =>
    `Application with ID ${id} not found`,
  [ERROR_CODES.APPLICATION_PATTERN_NOT_FOUND]: (id: number) =>
    `Application pattern with ID ${id} not found`,

  [ERROR_CODES.MODULE_NOT_FOUND]: (id: number) =>
    `Module with ID ${id} not found`,

  [ERROR_CODES.CATEGORIZATION_NOT_FOUND]: (id: number) =>
    `Categorization with ID ${id} not found`,

  [ERROR_CODES.CORRECTIVE_STATUS_NOT_FOUND]: (id: number) =>
    `Corrective status with ID ${id} not found`,

  [ERROR_CODES.MONTHLY_REPORT_STATUS_NOT_FOUND]: (id: number) =>
    `Monthly report status with ID ${id} not found`,

  [ERROR_CODES.ERROR_LOG_NOT_FOUND]: (id: number) =>
    `Error log with ID ${id} not found`,

  [ERROR_CODES.TASK_NOT_FOUND]: (id: number) =>
    `Task with ID ${id} not found`,
} as const;
