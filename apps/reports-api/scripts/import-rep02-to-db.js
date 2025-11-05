/**
 * Script to import REP02 padre hijo data into the database
 * 
 * Usage: 
 *   cd apps/reports-api
 *   node -r dotenv/config scripts/import-rep02-to-db.js
 *   node -r dotenv/config scripts/import-rep02-to-db.js --clear  (to clear existing data first)
 */

const XLSX = require('xlsx');
const path = require('path');

// Force load .env from reports-api directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { db, parentChildRequests } = require('@repo/database');

// Check for --clear flag
const shouldClear = process.argv.includes('--clear');

console.log('🔧 Connected to database');

async function importData() {
  try {
    console.log('\n🔍 Reading Excel file...');
    const filePath = path.join(__dirname, '../../../REP02 padre hijo.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${data.length} records\n`);

    // Clear existing data if flag is set
    if (shouldClear) {
      console.log('🗑️  Clearing existing data...');
      await db.delete(parentChildRequests);
      console.log('✅ Data cleared\n');
    }

    console.log('💾 Importing data to database...');
    console.log('This may take a moment...\n');

    // Batch insert for better performance
    const batchSize = 500;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const records = batch.map(row => ({
        requestId: String(row['Request ID']),
        linkedRequestId: String(row['Linked Request Id']),
      }));

      try {
        await db.insert(parentChildRequests).values(records);
        imported += records.length;
        
        // Progress indicator
        const progress = ((i + batch.length) / data.length * 100).toFixed(1);
        process.stdout.write(`\r📊 Progress: ${progress}% (${imported} records imported)`);
      } catch (error) {
        // If batch insert fails due to duplicates, try one by one
        for (const record of records) {
          try {
            await db.insert(parentChildRequests).values(record);
            imported++;
          } catch (err) {
            skipped++;
          }
        }
      }
    }

    console.log('\n\n✅ Import completed!');
    console.log(`   • Imported: ${imported} records`);
    if (skipped > 0) {
      console.log(`   • Skipped (duplicates): ${skipped} records`);
    }

    // Show statistics
    console.log('\n📊 Generating statistics...');
    
    // Get total count
    const totalRecords = await db.select().from(parentChildRequests);
    console.log(`\n✅ Total records in database: ${totalRecords.length}`);

    // Group by parent and count children (using raw SQL for better performance)
    console.log('\n🔍 Top 10 parent requests with most children:');
    
    const grouped = totalRecords.reduce((acc, record) => {
      const parent = record.linkedRequestId;
      if (!acc[parent]) {
        acc[parent] = [];
      }
      acc[parent].push(record.requestId);
      return acc;
    }, {});

    const sorted = Object.entries(grouped)
      .map(([parent, children]) => ({ parent, count: children.length, children }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    sorted.forEach((item, index) => {
      console.log(`\n${index + 1}. Parent Request ID: ${item.parent}`);
      console.log(`   └─ Child count: ${item.count}`);
      console.log(`   └─ Sample children: ${item.children.slice(0, 5).join(', ')}${item.count > 5 ? '...' : ''}`);
    });

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ Data successfully imported to database!');
    console.log('='.repeat(60));
    console.log('\nYou can now query this data using Drizzle ORM in your API');

  } catch (error) {
    console.error('\n❌ Error importing data:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the import
importData();
