// Database configuration
export { db, DATABASE_CONNECTION } from './config';
export type { Database } from './config';

// Task schema and Drizzle types
export { tasks } from './schemas/tasks.schema';
export type { DbTask, NewDbTask } from './schemas/tasks.schema';

