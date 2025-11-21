import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schemas';

export function createTestDatabase() {
  // Create in-memory database
  const client = createClient({
    url: ':memory:',
  });

  const db = drizzle(client, { schema });

  return { db, client };
}

export async function migrateTestDatabase(
  db: ReturnType<typeof drizzle>,
  migrationsFolder: string = './src/database/infrastructure/migrations'
) {
  try {
    // Disable foreign key enforcement temporarily for migrations
    await db.run('PRAGMA foreign_keys = OFF;');

    await migrate(db, { migrationsFolder });

    // Re-enable foreign key enforcement
    await db.run('PRAGMA foreign_keys = ON;');
  } catch (error) {
    console.error('Migration error:', error);
    // Don't continue - this is a critical error
    throw error;
  }
}
