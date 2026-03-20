// Common enums and types
export {
  Priority,
  PrioritySpanish,
  DisplayStatus,
  DEFAULT_DISPLAY_STATUS,
  Recurrency,
  RecurrencySpanish,
  RECURRENCY_MAP,
  mapRecurrency,
  CorrectiveStatus,
  CorrectiveStatusSpanish,
  InBacklogByPriority,
  L3TicketsStatusColumns,
} from './common';

export type {
  PriorityValue,
  PrioritySpanishValue,
  DisplayStatusValue,
  RecurrencyType,
  CorrectiveStatusValue,
  CorrectiveStatusSpanishValue,
  InBacklogByPriorityValue,
} from './common';

// Task validation schemas, DTOs and Types
export {
  insertTaskSchema,
  updateTaskSchema,
  CreateTaskDto,
  UpdateTaskDto,
  taskSchema,
  taskArraySchema,
  taskDeleteResultSchema,
} from './tasks';

export type {
  Task,
  TaskResponse,
  TaskListResponse,
  TaskSchemaResponse,
  TaskDeleteResult,
} from './tasks';

// Request Categorization validation schemas, DTOs and Types
export {
  CreateRequestCategorizationDto,
  UpdateRequestCategorizationDto,
} from './request-categorization';

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
} from './request-categorization';

export {
  reqCatWithInfoSchema,
  reqCatWithInfoArraySchema,
  reqCatCategorySummarySchema,
  reqCatCategorySummaryArraySchema,
  reqCatUploadResultSchema,
  reqCatDeleteResultSchema,
  requestIdEntrySchema,
  reqCatRequestIdsResponseSchema,
} from './request-categorization';

// Parent-Child Requests validation schemas, DTOs and Types
export {
  CreateParentChildRequestDto,
  UpdateParentChildRequestDto,
  pcReqGetAllResponseSchema,
  pcReqStatsResponseSchema,
  pcReqUploadResultSchema,
  pcReqDeleteResultSchema,
} from './parent-child-requests';

export type {
  ParentChildRequest,
  ParentChildRequestStats,
  ParentChildRequestResponse,
  PcReqGetAllResponse,
  PcReqStatsResponse,
  PcReqUploadResult,
  PcReqDeleteResult,
} from './parent-child-requests';

// Request Tags validation schemas, DTOs and Types
export {
  insertRequestTagSchema,
  updateRequestTagSchema,
  CreateRequestTagDto,
  UpdateRequestTagDto,
  requestTagSchema,
  requestTagListResponseSchema,
  requestTagUploadResultSchema,
  requestTagDeleteResultSchema,
  requestTagByAdditionalInfoResponseSchema,
  requestTagMissingIdsResponseSchema,
} from './request-tags';

export type {
  RequestTag,
  RequestTagResponse,
  RequestTagListResponse,
  RequestTagUploadResult,
  RequestTagDeleteResult,
  RequestTagByAdditionalInfoResponse,
  RequestTagMissingIdsResponse,
} from './request-tags';

// Application Registry Types and Schemas
export type {
  Application as AppRegistryApplication,
  ApplicationPattern as AppRegistryPattern,
  ApplicationWithPatterns as AppRegistryWithPatterns,
  AppRegistryApplicationResponse,
  AppRegistryPatternResponse,
  AppRegistryWithPatternsResponse,
  AppRegistryDeleteResult,
} from './application-registry';

export {
  appRegistryApplicationSchema,
  appRegistryPatternSchema,
  appRegistryWithPatternsSchema,
  appRegistryApplicationArraySchema,
  appRegistryWithPatternsArraySchema,
  appRegistryDeleteResultSchema,
} from './application-registry';

// Corrective Status Registry Types and Schemas
export type {
  CorrectiveStatusResponse,
  CorrectiveStatusDeleteResult,
} from './corrective-status-registry';

export {
  correctiveStatusSchema,
  correctiveStatusArraySchema,
  correctiveStatusDeleteResultSchema,
} from './corrective-status-registry';

// Monthly Report Status Registry Types and Schemas
export type {
  MoRepStatus,
  MoRepStatusDeleteResult,
} from './monthly-report-status-registry';

export {
  moRepStatusSchema,
  moRepStatusArraySchema,
  moRepStatusDeleteResultSchema,
} from './monthly-report-status-registry';

// Categorization Registry Types and Schemas
export type {
  CatRegCategorization,
  CatRegDeleteResult,
} from './categorization-registry';

export {
  catRegCategorizationSchema,
  catRegCategorizationArraySchema,
  catRegDeleteResultSchema,
} from './categorization-registry';

// Module Registry Types and Schemas
export type {
  ModRegModule,
  ModRegDeleteResult,
} from './module-registry';

export {
  modRegModuleSchema,
  modRegModuleArraySchema,
  modRegDeleteResultSchema,
} from './module-registry';

// Error Logs Types and Schemas
export type {
  ErrorLog,
  ErrorLogResponse,
  ErrorLogSchemaResponse,
  ErrorLogListResponse,
} from './error-logs';

export {
  errorLogSchema,
  errorLogListResponseSchema,
} from './error-logs';

// War Rooms Types and Schemas
export type { WarRoom, InsertWarRoom } from '@repo/database';

export {
  warRoomGetAllResponseSchema,
  warRoomUploadResultSchema,
  warRoomDeleteResultSchema,
  warRoomAnalyticsResponseSchema,
} from './war-rooms';

export type {
  WarRoomGetAllResponse,
  WarRoomUploadResult,
  WarRoomDeleteResult,
  WarRoomAnalyticsResponse,
} from './war-rooms';

// Sessions Orders Types and Schemas
export type {
  SessionsOrder,
  InsertSessionsOrder,
  SessionsOrdersRelease,
  InsertSessionsOrdersRelease
} from '@repo/database';

export {
  sessOrdSessionsOrderSchema,
  sessOrdReleaseSchema,
  sessOrdGetAllResponseSchema,
  sessOrdUploadResultSchema,
  sessOrdDeleteResultSchema,
  sessOrdLast30DaysResponseSchema,
  sessOrdIncidentsVsOrdersResponseSchema,
} from './sessions-orders';

export type {
  SessOrdGetAllResponse,
  SessOrdUploadResult,
  SessOrdDeleteResult,
  SessOrdLast30DaysResponse,
  SessOrdIncidentsVsOrdersResponse,
} from './sessions-orders';

// Monthly Report Types and Schemas
export type { MonthlyReport, InsertMonthlyReport } from '@repo/database';

export {
  moRepGetAllResponseSchema,
  moRepUploadResultSchema,
  moRepDeleteResultSchema,
} from './monthly-report';

export type {
  MoRepGetAllResponse,
  MoRepUploadResult,
  MoRepDeleteResult,
} from './monthly-report';

// Weekly Corrective Types and Schemas
export {
  wkCorrGetAllResponseSchema,
  wkCorrUploadResultSchema,
  wkCorrDeleteResultSchema,
  wkCorrL3TicketsByStatusResponseSchema,
} from './weekly-corrective';

export type {
  WkCorrGetAllResponse,
  WkCorrUploadResult,
  WkCorrDeleteResult,
} from './weekly-corrective';

// Weekly Corrective Types (re-export from database)
export type { WeeklyCorrective, InsertWeeklyCorrective } from '@repo/database';

// Problems Types and Schemas
export type { Problem, InsertProblem } from '@repo/database';

export {
  probGetAllResponseSchema,
  probUploadResultSchema,
  probDeleteResultSchema,
} from './problems';

export type {
  ProbGetAllResponse,
  ProbUploadResult,
  ProbDeleteResult,
} from './problems';
