#!/usr/bin/env node

const { db } = require('@repo/database');
const { sql } = require('drizzle-orm');

async function main() {
  console.log('📋 Checking database tables...\n');

  try {
    const tables = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);

    console.log('Tables found:');
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.name}`);
    });

    console.log(`\nTotal: ${tables.length} tables`);

    // Check war_rooms table structure if it exists
    const warRoomsTable = tables.find(t => t.name === 'war_rooms');
    if (warRoomsTable) {
      console.log('\n📊 war_rooms table structure:');
      const columns = await db.all(sql`PRAGMA table_info(war_rooms)`);
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    } else {
      console.log('\n❌ war_rooms table does NOT exist');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
