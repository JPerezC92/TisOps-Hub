// Frontend-safe exports only (no NestJS/backend dependencies)

// Common enums and types - these are safe for frontend
export {
  Priority,
  PrioritySpanish,
  DisplayStatus,
  DEFAULT_DISPLAY_STATUS,
} from './common';

export type {
  PriorityValue,
  PrioritySpanishValue,
  DisplayStatusValue,
} from './common';

// Type-only exports (interfaces and types are safe for frontend)
export type {
  Task,
  TaskResponse,
  TaskListResponse,
} from './tasks';

export type {
  RequestCategorization,
  RequestCategorizationResponse,
  CategorySummary,
} from './request-categorization';

export type {
  ParentChildRequest,
  ParentChildRequestStats,
  ParentChildRequestResponse,
} from './parent-child-requests';

export type {
  RequestTag,
  RequestTagResponse,
} from './request-tags';

export type {
  ErrorLog,
  ErrorLogResponse,
} from './error-logs';

// Re-export database types (these are just type definitions, safe for frontend)
export type {
  WarRoom,
  InsertWarRoom,
  SessionsOrder,
  InsertSessionsOrder,
  SessionsOrdersRelease,
  InsertSessionsOrdersRelease,
  MonthlyReport,
  InsertMonthlyReport,
  WeeklyCorrective,
  InsertWeeklyCorrective,
  Problem,
  InsertProblem
} from '@repo/database';