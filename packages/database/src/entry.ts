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
