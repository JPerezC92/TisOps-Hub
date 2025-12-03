// Database configuration
export { db, DATABASE_CONNECTION } from './config';
export type { Database } from './config';

// Test utilities
export { createTestDatabase, migrateTestDatabase } from './test-utils';

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

// War Rooms schema and types
export { warRooms } from './schemas/war-rooms.schema';
export type { WarRoom, InsertWarRoom } from './schemas/war-rooms.schema';

// Sessions Orders schema and types
export { sessionsOrders, sessionsOrdersReleases } from './schemas/sessions-orders.schema';
export type {
  SessionsOrder,
  InsertSessionsOrder,
  SessionsOrdersRelease,
  InsertSessionsOrdersRelease,
} from './schemas/sessions-orders.schema';

// Monthly Report schema and types
export { monthlyReports } from './schemas/monthly-report.schema';
export type { MonthlyReport, InsertMonthlyReport } from './schemas/monthly-report.schema';

// Weekly Corrective schema and types
export { weeklyCorrectives } from './schemas/weekly-corrective.schema';
export type { WeeklyCorrective, InsertWeeklyCorrective } from './schemas/weekly-corrective.schema';

// Problems schema and types
export { problems } from './schemas/problems.schema';
export type { Problem, InsertProblem } from './schemas/problems.schema';

// Application Registry schema and types
export { applicationRegistry } from './schemas/application-registry.schema';
export type {
  ApplicationRegistry,
  InsertApplicationRegistry,
} from './schemas/application-registry.schema';

// Application Patterns schema and types
export { applicationPatterns } from './schemas/application-patterns.schema';
export type {
  ApplicationPattern,
  InsertApplicationPattern,
} from './schemas/application-patterns.schema';

// Monthly Report Status Registry schema and types
export { monthlyReportStatusRegistry } from './schemas/monthly-report-status-registry.schema';
export type {
  MonthlyReportStatusRegistry,
  InsertMonthlyReportStatusRegistry,
} from './schemas/monthly-report-status-registry.schema';

// Corrective Status Registry schema and types
export { correctiveStatusRegistry } from './schemas/corrective-status-registry.schema';
export type {
  CorrectiveStatusRegistry,
  InsertCorrectiveStatusRegistry,
} from './schemas/corrective-status-registry.schema';

// Categorization Registry schema and types
export { categorizationRegistry } from './schemas/categorization-registry.schema';
export type {
  CategorizationRegistry,
  InsertCategorizationRegistry,
} from './schemas/categorization-registry.schema';

// Module Registry schema and types
export { moduleRegistry } from './schemas/module-registry.schema';
export type {
  ModuleRegistry,
  InsertModuleRegistry,
} from './schemas/module-registry.schema';
