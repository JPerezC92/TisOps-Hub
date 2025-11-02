import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schemas';

// For local development, you can use a local SQLite file
// For production, use Turso connection URL
console.log('Database URL:', process.env.DATABASE_URL);
const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
