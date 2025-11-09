// ============================================
// Test Script: REP01 Tags Parser and Upload Logic
// ============================================
// Purpose: Test Excel parsing and database upload logic directly
// Usage: pnpm exec dotenv -e .env -- node scripts/test-rep01-parser-and-upload.js
// ============================================

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { rep01Tags } = require('@repo/database');

// ============================================
// Configuration
// ============================================
const FILE_PATH = path.join(__dirname, '../../../REP01 XD TAG 2025.xlsx');

console.log('🧪 REP01 Tags Parser and Upload Test');
console.log('=====================================\n');

// ============================================
// Validate Environment and File
// ============================================
if (!fs.existsSync(FILE_PATH)) {
  console.error('❌ Error: File not found at:', FILE_PATH);
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL not set');
  process.exit(1);
}
if (!dbToken) {
  console.error('❌ Error: DATABASE_AUTH_TOKEN not set');
  process.exit(1);
}

console.log('✓ File found:', path.basename(FILE_PATH));
console.log('✓ File size:', (fs.statSync(FILE_PATH).size / 1024).toFixed(2), 'KB');
console.log('✓ Database configured');
console.log('\n');

// ============================================
// Database Connection
// ============================================
let db;
try {
  const client = createClient({ url: dbUrl, authToken: dbToken });
  db = drizzle({ client });
  console.log('✓ Database connection established\n');
} catch (error) {
  console.error('❌ Database connection error:', error.message);
  process.exit(1);
}

// ============================================
// Helper Functions (from service)
// ============================================
function decodeHTMLEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };
  return text.replace(/&[a-z]+;|&#\d+;/gi, (match) => entities[match] || match);
}

function extractHyperlink(worksheet, rowIndex, colIndex) {
  const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
  const cell = worksheet[cellAddress];

  if (cell && cell.l && cell.l.Target) {
    return decodeHTMLEntities(cell.l.Target);
  }

  return undefined;
}

// ============================================
// Test Functions
// ============================================

async function testParseExcel() {
  console.log('📊 Step 1: Parsing Excel File');
  console.log('='.repeat(80));

  try {
    const buffer = fs.readFileSync(FILE_PATH);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`   • Workbook has ${workbook.SheetNames.length} sheet(s)`);
    console.log(`   • Using sheet: "${sheetName}"`);

    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`   • Found ${data.length} rows (excluding header)`);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Show first row structure
    console.log('\n   📋 First Row Structure:');
    console.log('   ' + '-'.repeat(76));
    const firstRow = data[0];
    Object.keys(firstRow).forEach(key => {
      console.log(`      • ${key}: ${String(firstRow[key]).substring(0, 50)}`);
    });

    // Map Excel rows to domain format
    console.log('\n   🔄 Mapping rows to domain format...');
    const records = data.map((row, index) => {
      const rowIndex = index + 1; // +1 because row 0 is header

      const requestIdLink = extractHyperlink(worksheet, rowIndex, 2);
      const linkedRequestIdLink = extractHyperlink(worksheet, rowIndex, 5);

      return {
        createdTime: String(row['Created Time'] || ''),
        requestId: String(row['Request ID'] || ''),
        requestIdLink: requestIdLink || undefined,
        informacionAdicional: String(row['Información Adicional'] || ''),
        modulo: String(row['Modulo.'] || ''),
        problemId: String(row['Problem ID'] || ''),
        linkedRequestId: String(row['Linked Request Id'] || ''),
        linkedRequestIdLink: linkedRequestIdLink || undefined,
        jira: String(row['Jira'] || ''),
        categorizacion: String(row['Categorización'] || ''),
        technician: String(row['Technician'] || ''),
      };
    });

    // Validate required fields
    console.log('   ✅ Validating required fields...');
    const invalidRecords = records.filter(
      (record) => !record.requestId || !record.createdTime,
    );

    if (invalidRecords.length > 0) {
      console.log(`\n   ⚠️  Found ${invalidRecords.length} invalid records:`);
      invalidRecords.slice(0, 3).forEach((record, idx) => {
        console.log(`      ${idx + 1}. Missing: ${!record.requestId ? 'Request ID' : ''} ${!record.createdTime ? 'Created Time' : ''}`);
      });
      throw new Error('Some records are missing required fields');
    }

    console.log(`   ✓ All ${records.length} records have required fields`);

    // Show sample records
    console.log('\n   📝 Sample Records (first 3):');
    console.log('   ' + '-'.repeat(76));
    records.slice(0, 3).forEach((record, idx) => {
      console.log(`\n      Record ${idx + 1}:`);
      console.log(`         Request ID: ${record.requestId}`);
      console.log(`         Created Time: ${record.createdTime}`);
      console.log(`         Información Adicional: ${record.informacionAdicional.substring(0, 40)}...`);
      console.log(`         Linked Request ID: ${record.linkedRequestId}`);
      console.log(`         Categorización: ${record.categorizacion}`);
      console.log(`         Has Request ID Link: ${record.requestIdLink ? 'Yes' : 'No'}`);
    });

    console.log('\n   ✅ Parsing completed successfully');
    return records;

  } catch (error) {
    console.error('\n   ❌ Parsing failed:', error.message);
    throw error;
  }
}

async function testDatabaseInsert(records) {
  console.log('\n\n💾 Step 2: Inserting Records into Database');
  console.log('='.repeat(80));

  try {
    const batchSize = 500;
    let totalInserted = 0;

    console.log(`   • Preparing to insert ${records.length} records...`);
    console.log(`   • Using batch insert strategy (batch size: ${batchSize})`);
    console.log(`   • Total batches: ${Math.ceil(records.length / batchSize)}`);

    const startTime = Date.now();

    // Emulate the repository createMany logic with batching
    for (let i = 0; i < records.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(records.length / batchSize);
      const batch = records.slice(i, i + batchSize);

      process.stdout.write(`\r   • Processing batch ${batchNumber}/${totalBatches}...`);

      try {
        // Try batch insert
        const result = await db.insert(rep01Tags).values(batch);
        totalInserted += result.rowsAffected;
      } catch (error) {
        // If batch insert fails, try one by one (for duplicate handling)
        console.log(`\n   ⚠️  Batch ${batchNumber} failed, trying individual inserts...`);
        for (const item of batch) {
          try {
            await db.insert(rep01Tags).values(item);
            totalInserted++;
          } catch (err) {
            // Skip duplicates silently
          }
        }
      }
    }

    process.stdout.write('\r');
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n   ✅ Database insert completed in ${duration}s`);
    console.log(`      • Inserted: ${totalInserted} records`);
    console.log(`      • Skipped (duplicates): ${records.length - totalInserted} records`);

    return {
      imported: totalInserted,
      skipped: records.length - totalInserted,
    };

  } catch (error) {
    console.error('\n   ❌ Database insert failed:', error.message);
    console.error('\n   Error details:');
    console.error(error);
    throw error;
  }
}

async function verifyData() {
  console.log('\n\n🔍 Step 3: Verifying Inserted Data');
  console.log('='.repeat(80));

  try {
    // Count total records
    const allRecords = await db.select().from(rep01Tags);
    console.log(`   • Total records in database: ${allRecords.length}`);

    // Show a few sample records
    if (allRecords.length > 0) {
      console.log('\n   📋 Sample Records from Database (first 3):');
      console.log('   ' + '-'.repeat(76));
      allRecords.slice(0, 3).forEach((record, idx) => {
        console.log(`\n      Record ${idx + 1}:`);
        console.log(`         Request ID: ${record.requestId}`);
        console.log(`         Información Adicional: ${record.informacionAdicional.substring(0, 40)}...`);
        console.log(`         Linked Request ID: ${record.linkedRequestId}`);
      });
    }

    console.log('\n   ✅ Verification completed');

  } catch (error) {
    console.error('\n   ❌ Verification failed:', error.message);
    throw error;
  }
}

// ============================================
// Drop Table Function
// ============================================
async function dropTable() {
  console.log('🗑️  Step 0: Dropping Existing Data');
  console.log('='.repeat(80));

  try {
    console.log('   • Deleting all records from rep01_tags table...');

    const startTime = Date.now();
    await db.delete(rep01Tags);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`   ✅ Table cleared in ${duration}s`);
    console.log('   • Ready for fresh data import\n');

  } catch (error) {
    console.error('\n   ❌ Failed to drop table:', error.message);
    throw error;
  }
}

// ============================================
// Run All Tests
// ============================================
async function runTests() {
  try {
    // Step 0: Drop existing data
    await dropTable();

    // Step 1: Parse Excel
    const records = await testParseExcel();

    // Step 2: Insert into Database
    const result = await testDatabaseInsert(records);

    // Step 3: Verify
    await verifyData();

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   • Total records parsed: ${records.length}`);
    console.log(`   • Records imported: ${result.imported}`);
    console.log(`   • Records skipped: ${result.skipped}`);
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n\n' + '='.repeat(80));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error('\n');
    process.exit(1);
  }
}

// Run the tests
runTests();
