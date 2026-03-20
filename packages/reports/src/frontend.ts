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
} from './parent-child-requests/entities/parent-child-request.entity';

export type {
  PcReqGetAllResponse,
  PcReqStatsResponse,
  PcReqUploadResult,
  PcReqDeleteResult,
} from './parent-child-requests/schemas/parent-child-requests-response.schema';

export {
  pcReqGetAllResponseSchema,
  pcReqStatsResponseSchema,
  pcReqUploadResultSchema,
  pcReqDeleteResultSchema,
} from './parent-child-requests/schemas/parent-child-requests-response.schema';

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
  ErrorLogListResponse,
} from './error-logs';

export {
  errorLogSchema,
  errorLogListResponseSchema,
} from './error-logs';

// Problems
export type {
  ProbGetAllResponse,
  ProbUploadResult,
  ProbDeleteResult,
} from './problems';

export {
  probGetAllResponseSchema,
  probUploadResultSchema,
  probDeleteResultSchema,
} from './problems';

// Weekly Corrective
export type {
  WkCorrGetAllResponse,
  WkCorrUploadResult,
  WkCorrDeleteResult,
} from './weekly-corrective';

export {
  wkCorrGetAllResponseSchema,
  wkCorrUploadResultSchema,
  wkCorrDeleteResultSchema,
} from './weekly-corrective';

// Monthly Report Status Registry
export type {
  MoRepStatus,
  MoRepStatusDeleteResult,
} from './monthly-report-status-registry';

export {
  moRepStatusSchema,
  moRepStatusArraySchema,
  moRepStatusDeleteResultSchema,
} from './monthly-report-status-registry';

// Corrective Status Registry
export type {
  CorrectiveStatusResponse,
  CorrectiveStatusDeleteResult,
} from './corrective-status-registry';

export {
  correctiveStatusSchema,
  correctiveStatusArraySchema,
  correctiveStatusDeleteResultSchema,
  correctiveStatusDisplayStatusesSchema,
} from './corrective-status-registry';

// Categorization Registry
export type {
  CatRegCategorization,
  CatRegDeleteResult,
} from './categorization-registry';

export {
  catRegCategorizationSchema,
  catRegCategorizationArraySchema,
  catRegDeleteResultSchema,
} from './categorization-registry';

// Module Registry
export type {
  ModRegModule,
  ModRegDeleteResult,
} from './module-registry';

export {
  modRegModuleSchema,
  modRegModuleArraySchema,
  modRegDeleteResultSchema,
} from './module-registry';

// Monthly Report
export type {
  MoRepGetAllResponse,
  MoRepUploadResult,
  MoRepDeleteResult,
} from './monthly-report';

export {
  moRepGetAllResponseSchema,
  moRepUploadResultSchema,
  moRepDeleteResultSchema,
} from './monthly-report';

// Sessions Orders
export type {
  SessOrdGetAllResponse,
  SessOrdUploadResult,
  SessOrdDeleteResult,
} from './sessions-orders';

export {
  sessOrdGetAllResponseSchema,
  sessOrdUploadResultSchema,
  sessOrdDeleteResultSchema,
} from './sessions-orders';

// War Rooms
export type {
  WarRoomGetAllResponse,
  WarRoomUploadResult,
  WarRoomDeleteResult,
} from './war-rooms';

export {
  warRoomGetAllResponseSchema,
  warRoomUploadResultSchema,
  warRoomDeleteResultSchema,
} from './war-rooms';

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
