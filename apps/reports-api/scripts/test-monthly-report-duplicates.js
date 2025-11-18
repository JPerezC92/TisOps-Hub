// ============================================
// Test Script: Analyze and Merge Monthly Report Duplicates
// ============================================
// Purpose: Find duplicate Request IDs and merge them intelligently
// Strategy: Keep non-empty values, drop "No asignado" / "No Validado" values
// Usage: pnpm exec dotenv -e .env -- node scripts/test-monthly-report-duplicates.js
// ============================================

const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { monthlyReports } = require('@repo/database');
const XLSX = require('xlsx');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../files/XD 2025 DATA INFORME MENSUAL - Current Month.xlsx');

const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl || !dbToken) {
  console.error('Error: DATABASE_URL or DATABASE_AUTH_TOKEN not set');
  process.exit(1);
}

const client = createClient({ url: dbUrl, authToken: dbToken });
const db = drizzle({ client });

// Values to consider as "empty" or "not assigned"
const EMPTY_VALUES = ['No asignado', 'No Validado', '', null, undefined];

function isEmptyValue(value) {
  return EMPTY_VALUES.includes(value) || (typeof value === 'string' && value.trim() === '');
}

function mergeRecords(existing, incoming) {
  const merged = { ...existing };

  // For each field in incoming, use it if:
  // 1. Existing field is empty AND incoming has a value
  // 2. Both have values: keep existing (first occurrence priority)
  for (const key in incoming) {
    if (key === 'requestId') continue; // Skip primary key

    const existingValue = existing[key];
    const incomingValue = incoming[key];

    if (isEmptyValue(existingValue) && !isEmptyValue(incomingValue)) {
      merged[key] = incomingValue;
      console.log(`    ↳ Merged field "${key}": "${incomingValue}"`);
    }
  }

  return merged;
}

async function parseAndAnalyzeDuplicates() {
  console.log('📊 Monthly Report Duplicate Analysis & Merge Test');
  console.log('='.repeat(80));

  const workbook = XLSX.readFile(FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`\n📄 Total rows in Excel: ${data.length}`);

  // Parse all records
  const allRecords = data.map((row) => ({
    requestId: Number(row['Request ID']) || 0,
    aplicativos: String(row['Aplicativos'] || ''),
    categorizacion: String(row['Categorización'] || ''),
    createdTime: String(row['Created Time'] || ''),
    requestStatus: String(row['Request Status'] || ''),
    modulo: String(row['Modulo.'] || ''),
    subject: String(row['Subject'] || ''),
    priority: String(row['Priority'] || ''),
    eta: String(row['ETA'] || ''),
    informacionAdicional: String(row['Información Adicional'] || ''),
    resolvedTime: String(row['Resolved Time'] || ''),
    paisesAfectados: String(row['Países Afectados'] || ''),
    recurrencia: String(row['Recurrencia'] || ''),
    technician: String(row['Technician'] || ''),
    jira: String(row['Jira'] || ''),
    problemId: String(row['Problem ID'] || ''),
    linkedRequestId: String(row['Linked Request Id'] || ''),
    requestOlaStatus: String(row['Request OLA Status'] || ''),
    grupoEscalamiento: String(row['Grupo Escalamiento'] || ''),
    aplicactivosAfectados: String(row['Aplicactivos Afectados'] || ''),
    nivelUno: String(row['¿Este Incidente se debió Resolver en Nivel 1?'] || ''),
    campana: String(row['Campaña'] || ''),
    cuv: String(row['CUV_1'] || ''),
    release: String(row['Release'] || ''),
    rca: String(row['RCA'] || ''),
  }));

  // Find duplicates
  const requestIdMap = new Map();
  const duplicateIds = new Set();

  for (const record of allRecords) {
    if (requestIdMap.has(record.requestId)) {
      duplicateIds.add(record.requestId);
      requestIdMap.get(record.requestId).push(record);
    } else {
      requestIdMap.set(record.requestId, [record]);
    }
  }

  console.log(`\n🔍 Duplicate Analysis:`);
  console.log(`   Unique Request IDs: ${requestIdMap.size}`);
  console.log(`   Duplicate Request IDs: ${duplicateIds.size}`);

  if (duplicateIds.size > 0) {
    console.log('\n📋 Duplicate Details:');
    for (const requestId of duplicateIds) {
      const records = requestIdMap.get(requestId);
      console.log(`\n   Request ID ${requestId}: ${records.length} occurrences`);
      records.forEach((record, idx) => {
        console.log(`     [${idx + 1}] Status: ${record.requestStatus}, Technician: ${record.technician}`);
      });
    }
  }

  // Merge duplicates
  console.log('\n🔧 Merging Duplicates...');
  const mergedRecords = [];
  let mergeCount = 0;

  for (const [requestId, records] of requestIdMap.entries()) {
    if (records.length === 1) {
      mergedRecords.push(records[0]);
    } else {
      // Merge multiple records
      console.log(`\n   Merging Request ID ${requestId} (${records.length} records):`);
      let merged = records[0];
      for (let i = 1; i < records.length; i++) {
        merged = mergeRecords(merged, records[i]);
      }
      mergedRecords.push(merged);
      mergeCount++;
    }
  }

  console.log(`\n✅ Merge Summary:`);
  console.log(`   Original records: ${allRecords.length}`);
  console.log(`   Merged records: ${mergedRecords.length}`);
  console.log(`   Duplicates merged: ${mergeCount}`);

  return mergedRecords;
}

async function testUpload() {
  try {
    const mergedRecords = await parseAndAnalyzeDuplicates();

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await db.delete(monthlyReports).execute();

    // Upload with batch insert
    console.log('\n📤 Uploading merged records...');
    const batchSize = 5;
    let imported = 0;
    const startTime = Date.now();

    for (let i = 0; i < mergedRecords.length; i += batchSize) {
      const batch = mergedRecords.slice(i, i + batchSize);
      try {
        const result = await db.insert(monthlyReports).values(batch).execute();
        imported += result.rowsAffected || batch.length;
      } catch (error) {
        console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message.substring(0, 80)}`);
        // Try one by one
        for (const record of batch) {
          try {
            await db.insert(monthlyReports).values(record).execute();
            imported++;
          } catch (err) {
            console.log(`      ❌ Record ${record.requestId} failed: ${err.message.substring(0, 60)}`);
          }
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Upload Complete:`);
    console.log(`   Imported: ${imported} / ${mergedRecords.length}`);
    console.log(`   Time: ${duration}s`);
    console.log(`   Speed: ${(imported / duration).toFixed(1)} records/sec`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testUpload();
