// ============================================
// Script: Get Distinct Corrective Statuses
// ============================================
// Purpose: Query all unique request_status values from weekly_correctives table
// Usage: pnpm exec dotenv -e .env -- node scripts/get-corrective-statuses.js
// ============================================

const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { weeklyCorrectives } = require('@repo/database');

// ============================================
// Database Connection
// ============================================
const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl) {
  console.error('Error: DATABASE_URL not set in .env file');
  process.exit(1);
}
if (!dbToken) {
  console.error('Error: DATABASE_AUTH_TOKEN not set in .env file');
  process.exit(1);
}

let db;
try {
  const client = createClient({ url: dbUrl, authToken: dbToken });
  db = drizzle({ client });
} catch (error) {
  console.error('Error initializing database connection:', error);
  process.exit(1);
}

// ============================================
// Main Function
// ============================================
async function getCorrectiveStatuses() {
  console.log('🔍 Querying distinct request statuses from weekly_correctives...\n');

  try {
    const records = await db.select().from(weeklyCorrectives);

    // Get distinct statuses with count
    const statusCounts = new Map();
    for (const r of records) {
      const status = r.requestStatus || '';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    }

    console.log('=== Distinct Request Statuses in weekly_correctives ===\n');
    for (const [status, count] of [...statusCounts.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`"${status}" → ${count} records`);
    }

    console.log(`\n=== Total: ${statusCounts.size} distinct statuses ===`);
    console.log(`=== Total records: ${records.length} ===`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// Run Script
// ============================================
getCorrectiveStatuses()
  .then(() => {
    console.log('\n✅ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
