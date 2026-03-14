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
  ReqCatWithInfo,
  ReqCatCategorySummary,
  ReqCatUploadResult,
  ReqCatDeleteResult,
  RequestIdEntry,
  ReqCatRequestIdsResponse,
} from './request-categorization/frontend';

export {
  reqCatWithInfoSchema,
  reqCatWithInfoArraySchema,
  reqCatCategorySummarySchema,
  reqCatCategorySummaryArraySchema,
  reqCatUploadResultSchema,
  reqCatDeleteResultSchema,
  requestIdEntrySchema,
  reqCatRequestIdsResponseSchema,
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
  RequestTagListResponse,
  RequestTagUploadResult,
  RequestTagDeleteResult,
  RequestTagByAdditionalInfoResponse,
  RequestTagMissingIdsResponse,
} from './request-tags/frontend';

export {
  requestTagSchema,
  requestTagListResponseSchema,
  requestTagUploadResultSchema,
  requestTagDeleteResultSchema,
  requestTagByAdditionalInfoResponseSchema,
  requestTagMissingIdsResponseSchema,
} from './request-tags/frontend';

// Application Registry (frontend-safe barrel, no DTOs)
export type {
  Application as AppRegistryApplication,
  ApplicationPattern as AppRegistryPattern,
  ApplicationWithPatterns as AppRegistryWithPatterns,
  AppRegistryApplicationResponse,
  AppRegistryPatternResponse,
  AppRegistryWithPatternsResponse,
  AppRegistryDeleteResult,
} from './application-registry/frontend';

export {
  appRegistryApplicationSchema,
  appRegistryPatternSchema,
  appRegistryWithPatternsSchema,
  appRegistryApplicationArraySchema,
  appRegistryWithPatternsArraySchema,
  appRegistryDeleteResultSchema,
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
