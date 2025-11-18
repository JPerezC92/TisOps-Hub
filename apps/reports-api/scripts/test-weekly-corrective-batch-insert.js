// ============================================
// Test Script: Test Weekly Corrective Batch Insert
// ============================================
// Purpose: Test different batch sizes for weekly corrective inserts
// Usage: pnpm exec dotenv -e .env -- node scripts/test-weekly-corrective-batch-insert.js
// ============================================

const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { weeklyCorrectives } = require('@repo/database');
const XLSX = require('xlsx');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../files/XD SEMANAL CORRECTIVO.xlsx');
const BATCH_SIZES_TO_TEST = [10, 20, 30, 40, 50];

const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl || !dbToken) {
  console.error('Error: DATABASE_URL or DATABASE_AUTH_TOKEN not set');
  process.exit(1);
}

const client = createClient({ url: dbUrl, authToken: dbToken });
const db = drizzle({ client });

async function parseExcelFile() {
  const workbook = XLSX.readFile(FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  return data.map((row) => ({
    requestId: String(row['Request ID'] || ''),
    technician: String(row['Technician'] || ''),
    aplicativos: String(row['Aplicativos'] || ''),
    categorizacion: String(row['Categorización'] || ''),
    createdTime: String(row['Created Time'] || ''),
    requestStatus: String(row['Request Status'] || ''),
    modulo: String(row['Modulo.'] || ''),
    subject: String(row['Subject'] || ''),
    priority: String(row['Priority'] || ''),
    eta: String(row['ETA'] || ''),
    rca: String(row['RCA'] || ''),
  }));
}

async function testBatchInsert(records, batchSize) {
  console.log(`\n🧪 Testing batch size: ${batchSize}`);
  console.log('='.repeat(60));

  try {
    await db.delete(weeklyCorrectives).execute();

    const startTime = Date.now();
    let imported = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      try {
        const result = await db.insert(weeklyCorrectives).values(batch).execute();
        imported += result.rowsAffected || batch.length;
      } catch (error) {
        console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message.substring(0, 80)}...`);
        for (const record of batch) {
          try {
            await db.insert(weeklyCorrectives).values(record).execute();
            imported++;
          } catch (err) {}
        }
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏱️  Time: ${duration}s`);
    console.log(`   📊 Speed: ${(imported / duration).toFixed(1)} records/sec`);

    return {
      batchSize,
      imported,
      duration: parseFloat(duration),
      speed: parseFloat((imported / duration).toFixed(1)),
    };
  } catch (error) {
    console.error(`   💥 Fatal error: ${error.message}`);
    return { batchSize, imported: 0, duration: 0, speed: 0, error: error.message };
  }
}

async function runTests() {
  console.log('🔬 Weekly Corrective Batch Insert Performance Test');
  console.log('='.repeat(80));

  try {
    console.log('\n📄 Parsing Excel file...');
    const records = await parseExcelFile();
    console.log(`   Found ${records.length} records`);

    const results = [];
    for (const batchSize of BATCH_SIZES_TO_TEST) {
      const result = await testBatchInsert(records, batchSize);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.table(results);

    const successful = results.filter(r => r.imported > 0 && !r.error);
    if (successful.length > 0) {
      const best = successful.reduce((a, b) => a.speed > b.speed ? a : b);
      console.log(`\n🏆 Best performing batch size: ${best.batchSize} (${best.speed} records/sec)`);
    }

    console.log('\n✅ TESTS COMPLETED');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();
