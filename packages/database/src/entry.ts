// Database configuration
export { db, DATABASE_CONNECTION } from './config';
export type { Database } from './config';

// Task schema and Drizzle types
export { tasks } from './schemas/tasks.schema';
export type { DbTask, NewDbTask } from './schemas/tasks.schema';

// Parent-Child Requests schema and types
export { parentChildRequests } from './schemas/parent-child-requests.schema';
export type {
  ParentChildRequest,
  InsertParentChildRequest,
} from './schemas/parent-child-requests.schema';

// Request Categorization schema and types
export { requestCategorization } from './schemas/request-categorization.schema';
export type {
  RequestCategorization as DbRequestCategorization,
  InsertRequestCategorization,
} from './schemas/request-categorization.schema';

// Request Tags schema and types
export { requestTags } from './schemas/request-tags.schema';
export type {
  RequestTag as DbRequestTag,
  InsertRequestTag,
} from './schemas/request-tags.schema';

// Error Logs schema and types
export { errorLogs } from './schemas/error-logs.schema';
export type { ErrorLog, InsertErrorLog } from './schemas/error-logs.schema';



