import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schemas';

console.log('Database URL:', process.env.DATABASE_URL);

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;

// Symbol token for dependency injection
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
