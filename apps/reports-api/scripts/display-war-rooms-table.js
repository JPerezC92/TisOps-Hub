// ============================================
// Test Script: Display War Rooms Data Table
// ============================================
// Purpose: Fetch war rooms data and display formatted table
// Usage: pnpm exec dotenv -e .env -- node scripts/display-war-rooms-table.js
// ============================================

const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { warRooms } = require('@repo/database');
const { desc } = require('drizzle-orm');

// ============================================
// Configuration
// ============================================
const LIMIT = 20; // Number of records to display

// ============================================
// Database Connection
// ============================================
const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl || !dbToken) {
  console.error('❌ Error: DATABASE_URL or DATABASE_AUTH_TOKEN not set in .env file');
  process.exit(1);
}

let db;
try {
  const client = createClient({ url: dbUrl, authToken: dbToken });
  db = drizzle({ client });
} catch (error) {
  console.error('❌ Error initializing database connection:', error);
  process.exit(1);
}

// ============================================
// Date/Time Formatting Utilities
// ============================================

function excelDateToJsDate(excelDate) {
  // Excel dates are days since 1900-01-01 (with 1900 leap year bug)
  const daysOffset = 25569; // Days between 1900-01-01 and 1970-01-01
  const millisecondsPerDay = 86400000;
  return new Date((excelDate - daysOffset) * millisecondsPerDay);
}

function formatDate(excelDate) {
  if (!excelDate) return 'N/A';
  const date = excelDateToJsDate(excelDate);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short'
  }).format(date);
}

function excelTimeToHHMM(timeSerial) {
  if (timeSerial === null || timeSerial === undefined) return 'N/A';
  const totalMinutes = Math.round(timeSerial * 1440); // 1440 minutes in a day
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}`;
}

function formatDateTimeRange(date, startTime, endTime) {
  const dateStr = formatDate(date);
  const startStr = excelTimeToHHMM(startTime);
  const endStr = excelTimeToHHMM(endTime);
  return `${dateStr} from ${startStr} to ${endStr}`;
}

// ============================================
// Fetch and Display Data
// ============================================

async function displayWarRoomsTable() {
  console.log('🔍 Fetching War Rooms Data');
  console.log('='.repeat(100));

  try {
    // Fetch data from database
    console.log('\n📊 Querying war rooms...');
    const results = await db
      .select()
      .from(warRooms)
      .orderBy(desc(warRooms.date), desc(warRooms.startTime))
      .limit(LIMIT);

    console.log(`✅ Retrieved ${results.length} records\n`);

    if (results.length === 0) {
      console.log('⚠️  No war rooms data found in database');
      return;
    }

    // Format data for table display
    const formattedData = results.map((row, index) => ({
      '#': index + 1,
      'Assistants': row.participants || 0,
      'Date/Time Range': formatDateTimeRange(row.date, row.startTime, row.endTime),
      'Duration': `${row.durationMinutes || 0} min`,
      'Request ID': row.requestId,
      'Request Link': (row.requestIdLink || 'N/A').substring(0, 60) + (row.requestIdLink?.length > 60 ? '...' : ''),
      'Summary': (row.summary || '').substring(0, 60) + (row.summary?.length > 60 ? '...' : ''),
      'Priority': row.initialPriority || 'N/A',
      'Notes': (row.notes || 'N/A').substring(0, 40) + (row.notes?.length > 40 ? '...' : ''),
      'Status': row.status || 'N/A',
      'RCA Status': row.rcaStatus || 'N/A',
      'RCA Link': (row.urlRca || 'N/A').substring(0, 60) + (row.urlRca?.length > 60 ? '...' : '')
    }));

    // Display formatted table
    console.log('📋 War Rooms Data Table:');
    console.log('='.repeat(100));
    console.table(formattedData);

    // Display statistics
    console.log('\n📈 Statistics:');
    console.log(`   Total Records Displayed: ${results.length}`);
    console.log(`   Average Duration: ${Math.round(results.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) / results.length)} min`);
    console.log(`   Average Participants: ${Math.round(results.reduce((sum, r) => sum + (r.participants || 0), 0) / results.length)}`);

    // Status breakdown
    const statusCounts = results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    console.log('\n📊 Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // RCA Status breakdown
    const rcaCounts = results.reduce((acc, r) => {
      acc[r.rcaStatus || 'N/A'] = (acc[r.rcaStatus || 'N/A'] || 0) + 1;
      return acc;
    }, {});
    console.log('\n📋 RCA Status Breakdown:');
    Object.entries(rcaCounts).forEach(([rca, count]) => {
      console.log(`   ${rca}: ${count}`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('✅ DATA DISPLAY COMPLETED');
    console.log('='.repeat(100));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// Run Script
// ============================================
displayWarRoomsTable();
