/**
 * Database Reset Script
 * Drops all tables and recreates them from schema
 * ⚠️ WARNING: This will delete ALL data in the database!
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

async function resetDatabase() {
  try {
    console.log('🗑️  Starting database reset...');
    console.log('⚠️  This will delete ALL tables and data!');
    
    // Get all tables
    const tables = await db.all(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);
    
    console.log(`\n📋 Found ${tables.length} table(s):`);
    tables.forEach(table => console.log(`   - ${table.name}`));
    
    // Drop all tables
    console.log('\n🔥 Dropping tables...');
    for (const table of tables) {
      await db.run(sql.raw(`DROP TABLE IF EXISTS ${table.name}`));
      console.log(`   ✓ Dropped ${table.name}`);
    }
    
    console.log('\n✅ Database reset complete!');
    console.log('💡 Run "pnpm db:push" or "pnpm db:migrate" to recreate tables');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

resetDatabase();
