// ============================================
// Test Script: Test Sessions Orders Batch Insert
// ============================================
// Purpose: Test different batch sizes for sessions orders inserts
// Usage: pnpm exec dotenv -e .env -- node scripts/test-sessions-orders-batch-insert.js
// ============================================

const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { sessionsOrders, sessionsOrdersReleases } = require('@repo/database');
const XLSX = require('xlsx');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../files/SB INCIDENTES ORDENES SESIONES.xlsx');
const BATCH_SIZES_TO_TEST = [10, 25, 50, 100, 150];

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

  // Parse Hoja1 (main data)
  const hoja1 = workbook.Sheets['Hoja1'];
  const hoja1Data = XLSX.utils.sheet_to_json(hoja1);

  const mainRecords = hoja1Data.map((row) => ({
    ano: Number(row['año']) || 0,
    mes: Number(row['mes']) || 0,
    peak: Number(row['peak']) || 0,
    dia: Number(row['dia']) || 0,
    incidentes: Number(row['incidentes']) || 0,
    placedOrders: Number(row['placed orders']) || 0,
    billedOrders: Number(row['billed orders']) || 0,
  }));

  // Parse Hoja3 (releases)
  const hoja3 = workbook.Sheets['Hoja3'];
  const hoja3Data = XLSX.utils.sheet_to_json(hoja3);

  const releaseRecords = hoja3Data.map((row) => {
    const ticketsArray = [];
    if (row['# TICKETS']) ticketsArray.push(row['# TICKETS']);
    for (let i = 0; i < 12; i++) {
      const key = i === 0 ? '__EMPTY' : `__EMPTY_${i}`;
      if (row[key] && row[key] !== '') ticketsArray.push(row[key]);
    }

    return {
      semana: String(row['SEMANA'] || ''),
      aplicacion: String(row['APLICACIÓN'] || ''),
      fecha: Number(row['FECHA']) || 0,
      release: String(row['RELEASE'] || ''),
      ticketsCount: Number(row['tickets ']) || 0,
      ticketsData: JSON.stringify(ticketsArray),
    };
  });

  return { mainRecords, releaseRecords };
}

async function testBatchInsert(mainRecords, releaseRecords, batchSize) {
  console.log(`\n🧪 Testing batch size: ${batchSize}`);
  console.log('='.repeat(60));

  try {
    await db.delete(sessionsOrders).execute();
    await db.delete(sessionsOrdersReleases).execute();

    const startTime = Date.now();
    let importedMain = 0;
    let importedReleases = 0;

    // Insert main records
    for (let i = 0; i < mainRecords.length; i += batchSize) {
      const batch = mainRecords.slice(i, i + batchSize);
      try {
        const result = await db.insert(sessionsOrders).values(batch).execute();
        importedMain += result.rowsAffected || batch.length;
      } catch (error) {
        console.log(`   ❌ Main batch ${Math.floor(i / batchSize) + 1} failed`);
        for (const record of batch) {
          try {
            await db.insert(sessionsOrders).values(record).execute();
            importedMain++;
          } catch (err) {}
        }
      }
    }

    // Insert release records
    for (let i = 0; i < releaseRecords.length; i += batchSize) {
      const batch = releaseRecords.slice(i, i + batchSize);
      try {
        const result = await db.insert(sessionsOrdersReleases).values(batch).execute();
        importedReleases += result.rowsAffected || batch.length;
      } catch (error) {
        console.log(`   ❌ Release batch ${Math.floor(i / batchSize) + 1} failed`);
        for (const record of batch) {
          try {
            await db.insert(sessionsOrdersReleases).values(record).execute();
            importedReleases++;
          } catch (err) {}
        }
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const total = importedMain + importedReleases;

    console.log(`   ✅ Main: ${importedMain}, Releases: ${importedReleases}`);
    console.log(`   ⏱️  Time: ${duration}s`);
    console.log(`   📊 Speed: ${(total / duration).toFixed(1)} records/sec`);

    return {
      batchSize,
      importedMain,
      importedReleases,
      total,
      duration: parseFloat(duration),
      speed: parseFloat((total / duration).toFixed(1)),
    };
  } catch (error) {
    console.error(`   💥 Fatal error: ${error.message}`);
    return { batchSize, total: 0, duration: 0, speed: 0, error: error.message };
  }
}

async function runTests() {
  console.log('🔬 Sessions Orders Batch Insert Performance Test');
  console.log('='.repeat(80));

  try {
    console.log('\n📄 Parsing Excel file...');
    const { mainRecords, releaseRecords } = await parseExcelFile();
    console.log(`   Main records: ${mainRecords.length}`);
    console.log(`   Release records: ${releaseRecords.length}`);

    const results = [];
    for (const batchSize of BATCH_SIZES_TO_TEST) {
      const result = await testBatchInsert(mainRecords, releaseRecords, batchSize);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.table(results);

    const successful = results.filter(r => r.total > 0 && !r.error);
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
