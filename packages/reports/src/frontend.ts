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

// Request Categorization (frontend-safe barrel, no DTOs)
export type {
  RequestCategorization,
  RequestCategorizationResponse,
  CategorySummary,
  RequestCategorizationWithInfo,
  CategorySummaryResponse,
  UploadResult,
  DeleteResult,
  RequestIdEntry,
  RequestIdsByCategorization,
} from './request-categorization/frontend';

export {
  requestCategorizationWithInfoSchema,
  requestCategorizationWithInfoArraySchema,
  categorySummarySchema,
  categorySummaryArraySchema,
  uploadResultSchema,
  deleteResultSchema,
  requestIdEntrySchema,
  requestIdsByCategorizationResponseSchema,
} from './request-categorization/frontend';

// Parent-Child Requests
export type {
  ParentChildRequest,
  ParentChildRequestStats,
  ParentChildRequestResponse,
} from './parent-child-requests';

// Request Tags (frontend-safe barrel, no DTOs)
export type {
  RequestTag,
  RequestTagResponse,
  ByAdditionalInfoResponse,
  MissingIdsResponse,
} from './request-tags/frontend';

export {
  byAdditionalInfoResponseSchema,
  missingIdsResponseSchema,
} from './request-tags/frontend';

// Application Registry (frontend-safe barrel, no DTOs)
export type {
  Application as AppRegistryApplication,
  ApplicationPattern as AppRegistryPattern,
  ApplicationWithPatterns as AppRegistryWithPatterns,
  ApplicationResponse,
  ApplicationPatternResponse,
  ApplicationWithPatternsResponse,
  AppRegistryDeleteMessage,
} from './application-registry/frontend';

export {
  applicationSchema,
  applicationPatternSchema,
  applicationWithPatternsSchema,
  applicationArraySchema,
  applicationWithPatternsArraySchema,
  appRegistryDeleteMessageSchema,
} from './application-registry/frontend';

// Error Logs
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
