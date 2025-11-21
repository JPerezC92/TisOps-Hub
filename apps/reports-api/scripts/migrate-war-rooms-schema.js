// ============================================
// Migration Script: Update War Rooms Schema
// ============================================
// Purpose: Drop and recreate war_rooms table with new schema
// Usage: pnpm exec dotenv -e .env -- node scripts/migrate-war-rooms-schema.js
// ============================================

const { createClient } = require('@libsql/client');

// ============================================
// Database Connection
// ============================================
const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl || !dbToken) {
  console.error('❌ Error: DATABASE_URL or DATABASE_AUTH_TOKEN not set in .env file');
  process.exit(1);
}

let client;
try {
  client = createClient({ url: dbUrl, authToken: dbToken });
} catch (error) {
  console.error('❌ Error initializing database connection:', error);
  process.exit(1);
}

// ============================================
// Migration
// ============================================

async function migrateSchema() {
  console.log('🔄 Migrating War Rooms Schema');
  console.log('='.repeat(80));

  try {
    // Step 1: Drop existing table
    console.log('\n1️⃣ Dropping existing war_rooms table...');
    await client.execute('DROP TABLE IF EXISTS war_rooms');
    console.log('   ✅ Table dropped successfully');

    // Step 2: Create new table with updated schema
    console.log('\n2️⃣ Creating new war_rooms table with updated schema...');
    await client.execute(`
      CREATE TABLE war_rooms (
        request_id INTEGER PRIMARY KEY,
        request_id_link TEXT NOT NULL,
        application TEXT NOT NULL,
        date INTEGER NOT NULL,
        summary TEXT NOT NULL,
        initial_priority TEXT NOT NULL,
        start_time REAL NOT NULL,
        duration_minutes INTEGER NOT NULL,
        end_time REAL NOT NULL,
        participants INTEGER NOT NULL,
        status TEXT NOT NULL,
        priority_changed TEXT NOT NULL,
        resolution_team_changed TEXT NOT NULL,
        notes TEXT NOT NULL,
        rca_status TEXT NOT NULL,
        url_rca TEXT NOT NULL
      )
    `);
    console.log('   ✅ Table created successfully');

    // Step 3: Create indexes
    console.log('\n3️⃣ Creating indexes...');
    await client.execute('CREATE INDEX war_rooms_application_idx ON war_rooms(application)');
    await client.execute('CREATE INDEX war_rooms_status_idx ON war_rooms(status)');
    await client.execute('CREATE INDEX war_rooms_priority_idx ON war_rooms(initial_priority)');
    await client.execute('CREATE INDEX war_rooms_date_idx ON war_rooms(date)');
    console.log('   ✅ Indexes created successfully');

    console.log('\n' + '='.repeat(80));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('\nNext steps:');
    console.log('1. Re-upload the war rooms Excel file');
    console.log('2. Verify the data includes request_id_link field');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// Run Migration
// ============================================
migrateSchema();
