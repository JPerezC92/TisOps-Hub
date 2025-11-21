#!/usr/bin/env node

/**
 * Re-import War Rooms Script
 *
 * This script:
 * 1. Deletes all existing war rooms data
 * 2. Reads the Excel file
 * 3. Parses and imports the data with corrected date formats
 */

const XLSX = require('xlsx');
const { db, warRooms } = require('@repo/database');
const path = require('path');

// Helper to convert Excel serial number to JavaScript Date
function excelSerialToDate(serial) {
  const daysOffset = 25569; // Days between 1900-01-01 and 1970-01-01
  const millisecondsPerDay = 86400000;
  return new Date((serial - daysOffset) * millisecondsPerDay);
}

// Helper to convert Excel date + time serial to Date with time
function excelDateTimeToDate(dateSerial, timeSerial) {
  const date = excelSerialToDate(dateSerial);
  const totalMinutes = Math.round(timeSerial * 1440); // 1440 minutes in a day
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function main() {
  console.log('📊 Reading Excel file...');
  const filePath = path.join(__dirname, '../files/EDWarRooms2025.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`   📋 Found ${data.length} records`);

  console.log('\n🔄 Parsing and importing data...');
  const records = data.map((row, index) => {
    const requestId = Number(row['Incident ID']) || 0;

    // Extract hyperlink from Incident ID cell (column C)
    const rowNumber = index + 2; // +2 because Excel is 1-indexed and has a header row
    const cellAddress = `C${rowNumber}`;
    const cell = worksheet[cellAddress];
    const requestIdLink = cell?.l?.Target ? String(cell.l.Target) : '';

    const dateSerial = Number(row['Date']) || 0;
    const startTimeSerial = Number(row['Start Time']) || 0;
    const endTimeSerial = Number(row['End Time']) || 0;

    return {
      requestId,
      requestIdLink,
      application: String(row['Application'] || ''),
      date: excelSerialToDate(dateSerial),
      summary: String(row['Summary'] || ''),
      initialPriority: String(row['Initial Priority'] || ''),
      startTime: excelDateTimeToDate(dateSerial, startTimeSerial),
      durationMinutes: Number(row['Duration (Minutes)']) || 0,
      endTime: excelDateTimeToDate(dateSerial, endTimeSerial),
      participants: Number(row['Participants']) || 0,
      status: String(row['Status'] || ''),
      priorityChanged: String(row['Priority Changed'] || ''),
      resolutionTeamChanged: String(row['Resolution team changed'] || ''),
      notes: String(row['Notes'] || ''),
      rcaStatus: String(row['RCA Status'] || ''),
      urlRca: String(row['URL RCA'] || ''),
    };
  });

  // Batch insert for performance
  const batchSize = 20;
  let imported = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db.insert(warRooms).values(batch).execute();
    imported += batch.length;
    process.stdout.write(`\r   📥 Imported ${imported}/${records.length} records`);
  }

  console.log('\n\n✅ Re-import completed successfully!');
  console.log(`   Total records: ${records.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
