// ============================================
// Test Script: Test War Rooms Batch Insert
// ============================================
// Purpose: Test different batch sizes for war rooms inserts to find optimal size
// Usage: pnpm exec dotenv -e .env -- node scripts/test-war-rooms-batch-insert.js
// ============================================

const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { warRooms } = require('@repo/database');
const XLSX = require('xlsx');
const path = require('path');

// ============================================
// Configuration
// ============================================
const FILE_PATH = path.join(__dirname, '../files/EDWarRooms2025.xlsx');
const BATCH_SIZES_TO_TEST = [1, 5, 10, 15, 20];

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
// Test Functions
// ============================================

async function parseExcelFile() {
  const workbook = XLSX.readFile(FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  return data.map((row) => ({
    incidentId: Number(row['Incident ID']) || 0,
    application: String(row['Application'] || ''),
    date: Number(row['Date']) || 0,
    summary: String(row['Summary'] || ''),
    initialPriority: String(row['Initial Priority'] || ''),
    startTime: Number(row['Start Time']) || 0,
    durationMinutes: Number(row['Duration (Minutes)']) || 0,
    endTime: Number(row['End Time']) || 0,
    participants: Number(row['Participants']) || 0,
    status: String(row['Status'] || ''),
    priorityChanged: String(row['Priority Changed'] || ''),
    resolutionTeamChanged: String(row['Resolution team changed'] || ''),
    notes: String(row['Notes'] || ''),
    rcaStatus: String(row['RCA Status'] || ''),
    urlRca: String(row['URL RCA'] || ''),
  }));
}

async function testBatchInsert(records, batchSize) {
  console.log(`\n🧪 Testing batch size: ${batchSize}`);
  console.log('='.repeat(60));

  try {
    // Clear table first
    await db.delete(warRooms).execute();

    const startTime = Date.now();
    let imported = 0;
    let failed = 0;

    // Remove duplicates first
    const uniqueRecords = [];
    const seenIds = new Set();
    for (const record of records) {
      if (!seenIds.has(record.incidentId)) {
        seenIds.add(record.incidentId);
        uniqueRecords.push(record);
      }
    }

    console.log(`   Total unique records: ${uniqueRecords.length}`);

    // Try batch insert
    for (let i = 0; i < uniqueRecords.length; i += batchSize) {
      const batch = uniqueRecords.slice(i, i + batchSize);

      try {
        const result = await db.insert(warRooms).values(batch).execute();
        imported += result.rowsAffected || batch.length;
      } catch (error) {
        failed += batch.length;
        console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message.substring(0, 100)}...`);

        // If batch fails, try inserting one by one
        for (const record of batch) {
          try {
            await db.insert(warRooms).values(record).execute();
            imported++;
            failed--;
          } catch (err) {
            // Skip this record
          }
        }
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Time: ${duration}s`);
    console.log(`   📊 Speed: ${(imported / duration).toFixed(1)} records/sec`);

    return {
      batchSize,
      imported,
      failed,
      duration: parseFloat(duration),
      speed: parseFloat((imported / duration).toFixed(1)),
    };
  } catch (error) {
    console.error(`   💥 Fatal error: ${error.message}`);
    return {
      batchSize,
      imported: 0,
      failed: records.length,
      duration: 0,
      speed: 0,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🔬 War Rooms Batch Insert Performance Test');
  console.log('='.repeat(80));

  try {
    // Parse file
    console.log('\n📄 Parsing Excel file...');
    const records = await parseExcelFile();
    console.log(`   Found ${records.length} records`);

    // Test different batch sizes
    const results = [];
    for (const batchSize of BATCH_SIZES_TO_TEST) {
      const result = await testBatchInsert(records, batchSize);
      results.push(result);

      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📊 RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.table(results);

    // Find best
    const successful = results.filter(r => r.imported > 0 && !r.error);
    if (successful.length > 0) {
      const best = successful.reduce((a, b) => a.speed > b.speed ? a : b);
      console.log(`\n🏆 Best performing batch size: ${best.batchSize} (${best.speed} records/sec)`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TESTS COMPLETED');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// Run Tests
// ============================================
runTests();
