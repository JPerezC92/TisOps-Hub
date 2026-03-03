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
} from './tasks';

export type {
  Task,
  TaskResponse,
  TaskListResponse,
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
  RequestCategorizationWithInfo,
  CategorySummaryResponse,
  UploadResult as RequestCategorizationUploadResult,
  DeleteResult as RequestCategorizationDeleteResult,
  RequestIdEntry,
  RequestIdsByCategorization,
} from './request-categorization';

export {
  requestCategorizationWithInfoSchema,
  categorySummarySchema,
  uploadResultSchema as requestCategorizationUploadResultSchema,
  deleteResultSchema as requestCategorizationDeleteResultSchema,
  requestIdEntrySchema,
  requestIdsByCategorizationResponseSchema,
} from './request-categorization';

// Parent-Child Requests validation schemas, DTOs and Types
export {
  CreateParentChildRequestDto,
  UpdateParentChildRequestDto,
} from './parent-child-requests';

export type {
  ParentChildRequest,
  ParentChildRequestStats,
  ParentChildRequestResponse,
} from './parent-child-requests';

// Request Tags validation schemas, DTOs and Types
export {
  insertRequestTagSchema,
  updateRequestTagSchema,
  CreateRequestTagDto,
  UpdateRequestTagDto,
} from './request-tags';

export type {
  RequestTag,
  RequestTagResponse,
} from './request-tags';

// Application Registry Types and Schemas
export type {
  Application as AppRegistryApplication,
  ApplicationPattern as AppRegistryPattern,
  ApplicationWithPatterns as AppRegistryWithPatterns,
  ApplicationResponse,
  ApplicationPatternResponse,
  ApplicationWithPatternsResponse,
  AppRegistryDeleteMessage,
} from './application-registry';

export {
  applicationSchema,
  applicationPatternSchema,
  applicationWithPatternsSchema,
  applicationArraySchema,
  applicationWithPatternsArraySchema,
  appRegistryDeleteMessageSchema,
} from './application-registry';

// Error Logs Types
export type {
  ErrorLog,
  ErrorLogResponse,
} from './error-logs';

// War Rooms Types (re-export from database)
export type { WarRoom, InsertWarRoom } from '@repo/database';

// Sessions Orders Types (re-export from database)
export type {
  SessionsOrder,
  InsertSessionsOrder,
  SessionsOrdersRelease,
  InsertSessionsOrdersRelease
} from '@repo/database';

// Monthly Report Types (re-export from database)
export type { MonthlyReport, InsertMonthlyReport } from '@repo/database';

// Weekly Corrective Types (re-export from database)
export type { WeeklyCorrective, InsertWeeklyCorrective } from '@repo/database';

// Problems Types (re-export from database)
export type { Problem, InsertProblem } from '@repo/database';
