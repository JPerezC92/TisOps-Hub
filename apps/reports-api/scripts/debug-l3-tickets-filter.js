// ============================================
// Script: Debug L3 Tickets Filtering
// ============================================
// Purpose: Investigate why Somos Belcorp shows 12 instead of 60 records
// Usage: pnpm exec dotenv -e .env -- node scripts/debug-l3-tickets-filter.js
// ============================================

const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { weeklyCorrectives, applicationRegistry, applicationPatterns } = require('@repo/database');
const { sql, eq } = require('drizzle-orm');
const { DateTime } = require('luxon');

// ============================================
// Database Connection
// ============================================
const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl || !dbToken) {
  console.error('Error: DATABASE_URL or DATABASE_AUTH_TOKEN not set');
  process.exit(1);
}

const client = createClient({ url: dbUrl, authToken: dbToken });
const db = drizzle({ client });

// ============================================
// Main Function
// ============================================
async function debugL3TicketsFilter() {
  const targetMonth = '2025-11'; // November 2025

  console.log('=== Step 1: Total records in weekly_correctives ===\n');
  const allRecords = await db.select().from(weeklyCorrectives);
  console.log(`Total records: ${allRecords.length}`);

  console.log('\n=== Step 2: Records with "Somos Belcorp" in aplicativos ===\n');
  const somosBelcorpRecords = allRecords.filter(r =>
    r.aplicativos.toLowerCase().includes('somos belcorp')
  );
  console.log(`Records with "Somos Belcorp": ${somosBelcorpRecords.length}`);

  console.log('\n=== Step 3: Check createdTime format ===\n');
  const sampleRecords = somosBelcorpRecords.slice(0, 5);
  for (const r of sampleRecords) {
    const parsed = DateTime.fromFormat(r.createdTime, 'dd/MM/yyyy HH:mm');
    console.log(`  "${r.createdTime}" -> Valid: ${parsed.isValid}, Month: ${parsed.isValid ? parsed.toFormat('yyyy-MM') : 'N/A'}`);
  }

  console.log('\n=== Step 4: Filter by month (2025-11) ===\n');
  const monthFiltered = somosBelcorpRecords.filter(r => {
    const parsed = DateTime.fromFormat(r.createdTime, 'dd/MM/yyyy HH:mm');
    if (!parsed.isValid) return false;
    return parsed.toFormat('yyyy-MM') === targetMonth;
  });
  console.log(`Records in November 2025: ${monthFiltered.length}`);

  console.log('\n=== Step 5: Check application pattern matching ===\n');
  const patterns = await db.select().from(applicationPatterns);
  const apps = await db.select().from(applicationRegistry);

  const somosBelcorpApp = apps.find(a => a.name.toLowerCase().includes('somos belcorp'));
  if (somosBelcorpApp) {
    console.log(`Found app: ${somosBelcorpApp.name} (code: ${somosBelcorpApp.code})`);
    const appPatterns = patterns.filter(p => p.applicationId === somosBelcorpApp.id);
    console.log(`Patterns: ${appPatterns.map(p => p.pattern).join(', ')}`);
  } else {
    console.log('No "Somos Belcorp" app found in registry!');
  }

  console.log('\n=== Step 6: Query with JOIN (like repository does) ===\n');
  const queryResults = await db
    .select({
      weeklyCorrective: weeklyCorrectives,
      registeredAppName: applicationRegistry.name,
      registeredAppCode: applicationRegistry.code,
    })
    .from(weeklyCorrectives)
    .leftJoin(
      applicationPatterns,
      sql`LOWER(${weeklyCorrectives.aplicativos}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
    )
    .leftJoin(
      applicationRegistry,
      eq(applicationPatterns.applicationId, applicationRegistry.id),
    )
    .all();

  console.log(`Query results (with duplicates): ${queryResults.length}`);

  // Deduplicate
  const seenIds = new Set();
  const uniqueResults = queryResults.filter((r) => {
    if (seenIds.has(r.weeklyCorrective.requestId)) return false;
    seenIds.add(r.weeklyCorrective.requestId);
    return true;
  });
  console.log(`After deduplication: ${uniqueResults.length}`);

  // Filter by app
  const somosBelcorpFiltered = uniqueResults.filter(r =>
    r.registeredAppName && r.registeredAppName.toLowerCase().includes('somos belcorp')
  );
  console.log(`Matched to Somos Belcorp app: ${somosBelcorpFiltered.length}`);

  // Filter by month
  const finalFiltered = somosBelcorpFiltered.filter(r => {
    const parsed = DateTime.fromFormat(r.weeklyCorrective.createdTime, 'dd/MM/yyyy HH:mm');
    if (!parsed.isValid) return false;
    return parsed.toFormat('yyyy-MM') === targetMonth;
  });
  console.log(`After month filter (2025-11): ${finalFiltered.length}`);

  console.log('\n=== Step 7: Show records NOT matching pattern ===\n');
  const unmatchedRecords = somosBelcorpRecords.filter(r => {
    const matched = uniqueResults.find(ur =>
      ur.weeklyCorrective.requestId === r.requestId &&
      ur.registeredAppName?.toLowerCase().includes('somos belcorp')
    );
    return !matched;
  });
  console.log(`Records with "Somos Belcorp" but NOT matched to app: ${unmatchedRecords.length}`);
  if (unmatchedRecords.length > 0) {
    console.log('Sample unmatched aplicativos values:');
    for (const r of unmatchedRecords.slice(0, 5)) {
      console.log(`  "${r.aplicativos}"`);
    }
  }

  console.log('\n=== Step 8: Show all distinct aplicativos for Somos Belcorp ===\n');
  const distinctAplicativos = [...new Set(somosBelcorpRecords.map(r => r.aplicativos))];
  console.log('Distinct aplicativos values:');
  for (const a of distinctAplicativos) {
    const count = somosBelcorpRecords.filter(r => r.aplicativos === a).length;
    console.log(`  "${a}" -> ${count} records`);
  }
}

// ============================================
// Run Script
// ============================================
debugL3TicketsFilter()
  .then(() => {
    console.log('\n✅ Debug complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
