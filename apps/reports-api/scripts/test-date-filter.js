#!/usr/bin/env node

const { db, warRooms } = require('@repo/database');
const { sql } = require('drizzle-orm');

async function testDateFilter() {
  console.log('Testing date filter SQL...\n');

  // Get a sample date value from the database
  const sample = await db.select({
    requestId: warRooms.requestId,
    date: warRooms.date
  }).from(warRooms).limit(1).all();

  if (sample.length > 0) {
    console.log('Sample record:');
    console.log(`  Request ID: ${sample[0].requestId}`);
    console.log(`  Date object: ${sample[0].date}`);
    console.log(`  Date ISO: ${new Date(sample[0].date).toISOString()}`);
    console.log(`  Date value (ms): ${sample[0].date.getTime ? sample[0].date.getTime() : sample[0].date}`);
  }

  // Test the strftime query
  console.log('\nTesting strftime with division by 1000:');
  const test1 = await db.select({
    requestId: warRooms.requestId,
    rawDate: warRooms.date,
    formatted: sql`strftime('%Y-%m', ${warRooms.date} / 1000, 'unixepoch')`
  }).from(warRooms).limit(5).all();

  test1.forEach(row => {
    console.log(`  ${row.requestId}: raw=${row.rawDate}, formatted=${row.formatted}`);
  });

  // Test without division
  console.log('\nTesting strftime without division (expecting wrong results):');
  const test2 = await db.select({
    requestId: warRooms.requestId,
    formatted: sql`strftime('%Y-%m', ${warRooms.date}, 'unixepoch')`
  }).from(warRooms).limit(5).all();

  test2.forEach(row => {
    console.log(`  ${row.requestId}: formatted=${row.formatted}`);
  });

  // Test the actual filter query for November
  console.log('\nTesting filter for 2025-11:');
  const filtered = await db.select({
    requestId: warRooms.requestId,
    date: warRooms.date
  })
  .from(warRooms)
  .where(sql`strftime('%Y-%m', ${warRooms.date} / 1000, 'unixepoch') = '2025-11'`)
  .all();

  console.log(`  Found ${filtered.length} records`);
  if (filtered.length > 0) {
    filtered.forEach(row => {
      console.log(`    ${row.requestId}: ${new Date(row.date).toISOString()}`);
    });
  }
}

testDateFilter()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
