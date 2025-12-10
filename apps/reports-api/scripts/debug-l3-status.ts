import { db, weeklyCorrectives, monthlyReports, applicationPatterns, applicationRegistry, correctiveStatusRegistry } from '@repo/database';
import { sql, eq } from 'drizzle-orm';
import { DateTime } from 'luxon';

async function debugL3Status() {
  console.log('=== DEBUG: L3 Status Query Analysis ===\n');

  // 1. Query weekly_correctives
  console.log('--- QUERY 1: weekly_correctives ---');
  const weeklyResults = await db
    .select({
      weeklyCorrective: weeklyCorrectives,
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

  console.log(`Total weekly_correctives rows: ${weeklyResults.length}`);

  // Deduplicate weekly
  const seenWeeklyIds = new Set<string>();
  const uniqueWeekly = weeklyResults.filter((r) => {
    if (seenWeeklyIds.has(r.weeklyCorrective.requestId)) return false;
    seenWeeklyIds.add(r.weeklyCorrective.requestId);
    return true;
  });
  console.log(`Unique weekly_correctives (deduplicated): ${uniqueWeekly.length}`);

  // 2. Query monthly_reports with 'Nivel 3'
  console.log('\n--- QUERY 2: monthly_reports with Nivel 3 ---');
  const monthlyResults = await db
    .select({
      monthlyReport: monthlyReports,
      registeredAppCode: applicationRegistry.code,
    })
    .from(monthlyReports)
    .leftJoin(
      applicationPatterns,
      sql`LOWER(${monthlyReports.aplicativos}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
    )
    .leftJoin(
      applicationRegistry,
      eq(applicationPatterns.applicationId, applicationRegistry.id),
    )
    .where(eq(monthlyReports.requestStatus, 'Nivel 3'))
    .all();

  console.log(`Total monthly_reports with 'Nivel 3': ${monthlyResults.length}`);

  // Show monthly_reports details
  if (monthlyResults.length > 0) {
    console.log('\nMonthly Reports "Nivel 3" details:');
    for (const r of monthlyResults) {
      console.log(`  - requestId: ${r.monthlyReport.requestId}`);
      console.log(`    status: ${r.monthlyReport.requestStatus}`);
      console.log(`    createdTime: ${r.monthlyReport.createdTime}`);
      console.log(`    app: ${r.registeredAppCode || 'UNKNOWN'}`);

      // Test DateTime conversion
      const dt = DateTime.fromJSDate(r.monthlyReport.createdTime);
      console.log(`    DateTime valid: ${dt.isValid}`);
      console.log(`    DateTime ISO: ${dt.toISO()}`);
    }
  } else {
    console.log('\n⚠️  NO monthly_reports found with status "Nivel 3"!');

    // Check what statuses exist
    const allStatuses = await db
      .selectDistinct({ status: monthlyReports.requestStatus })
      .from(monthlyReports)
      .all();
    console.log('\nAvailable statuses in monthly_reports:');
    allStatuses.forEach(s => console.log(`  - "${s.status}"`));
  }

  // 3. Check for overlapping requestIds
  console.log('\n--- CHECK: Overlapping requestIds ---');
  const monthlyIds = new Set(monthlyResults.map(r => String(r.monthlyReport.requestId)));
  const weeklyIds = new Set(uniqueWeekly.map(r => r.weeklyCorrective.requestId));

  const overlap = [...monthlyIds].filter(id => weeklyIds.has(id));
  console.log(`Overlapping requestIds: ${overlap.length}`);
  if (overlap.length > 0) {
    console.log('Overlapping IDs:', overlap);
  }

  // 4. Check status mapping
  console.log('\n--- STATUS MAPPING: correctiveStatusRegistry ---');
  const statusMappings = await db
    .select({
      rawStatus: correctiveStatusRegistry.rawStatus,
      displayStatus: correctiveStatusRegistry.displayStatus,
    })
    .from(correctiveStatusRegistry)
    .all();

  console.log('Status mappings:');
  statusMappings.forEach(s => console.log(`  "${s.rawStatus}" → "${s.displayStatus}"`));

  // 5. Apply date filter (Weekly mode: createdTime < startDate)
  const startDate = '2025-11-24';
  const start = DateTime.fromISO(startDate).startOf('day');

  console.log(`\n--- APPLYING DATE FILTER: createdTime < ${startDate} ---`);

  // Filter weekly_correctives
  const filteredWeekly = uniqueWeekly.filter((r) => {
    const dt = DateTime.fromFormat(r.weeklyCorrective.createdTime, 'dd/MM/yyyy HH:mm');
    if (!dt.isValid) return false;
    return dt < start;
  });
  console.log(`weekly_correctives after date filter: ${filteredWeekly.length}`);

  // Filter monthly_reports
  const filteredMonthly = monthlyResults.filter((r) => {
    const dt = DateTime.fromJSDate(r.monthlyReport.createdTime);
    if (!dt.isValid) return false;
    const result = dt < start;
    console.log(`  monthly_reports ${r.monthlyReport.requestId}: ${dt.toISO()} < ${start.toISO()} = ${result}`);
    return result;
  });
  console.log(`monthly_reports after date filter: ${filteredMonthly.length}`);

  // 6. Apply STATUS filter (only count valid CorrectiveStatus values)
  const validStatuses = ['In Backlog', 'Dev in Progress', 'In Testing', 'PRD Deployment'];
  const statusMap = new Map(statusMappings.map((r) => [r.rawStatus, r.displayStatus]));

  console.log(`\n--- APPLYING STATUS FILTER (valid: ${validStatuses.join(', ')}) ---`);

  // Count by status for weekly_correctives
  const weeklyStatusCounts: Record<string, number> = {};
  let weeklyValidCount = 0;
  for (const r of filteredWeekly) {
    const rawStatus = r.weeklyCorrective.requestStatus || 'Unknown';
    const displayStatus = statusMap.get(rawStatus) || rawStatus;
    weeklyStatusCounts[displayStatus] = (weeklyStatusCounts[displayStatus] || 0) + 1;
    if (validStatuses.includes(displayStatus)) {
      weeklyValidCount++;
    }
  }
  console.log(`weekly_correctives status distribution:`);
  Object.entries(weeklyStatusCounts).forEach(([status, count]) => {
    const valid = validStatuses.includes(status) ? '✓' : '✗';
    console.log(`  ${valid} "${status}": ${count}`);
  });
  console.log(`weekly_correctives with valid status: ${weeklyValidCount}`);

  // Count by status for monthly_reports
  const monthlyStatusCounts: Record<string, number> = {};
  let monthlyValidCount = 0;
  for (const r of filteredMonthly) {
    const rawStatus = r.monthlyReport.requestStatus;
    const displayStatus = statusMap.get(rawStatus) || rawStatus;
    monthlyStatusCounts[displayStatus] = (monthlyStatusCounts[displayStatus] || 0) + 1;
    if (validStatuses.includes(displayStatus)) {
      monthlyValidCount++;
    }
  }
  console.log(`\nmonthly_reports status distribution:`);
  Object.entries(monthlyStatusCounts).forEach(([status, count]) => {
    const valid = validStatuses.includes(status) ? '✓' : '✗';
    console.log(`  ${valid} "${status}": ${count}`);
  });
  console.log(`monthly_reports with valid status: ${monthlyValidCount}`);

  // 7. Summary
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`weekly_correctives (unique): ${uniqueWeekly.length}`);
  console.log(`monthly_reports (Nivel 3): ${monthlyResults.length}`);
  console.log(`Overlapping IDs: ${overlap.length}`);
  console.log(`\nAfter date filter (< ${startDate}):`);
  console.log(`weekly_correctives: ${filteredWeekly.length}`);
  console.log(`monthly_reports: ${filteredMonthly.length}`);
  console.log(`\nAfter status filter (valid CorrectiveStatus only):`);
  console.log(`weekly_correctives: ${weeklyValidCount}`);
  console.log(`monthly_reports: ${monthlyValidCount}`);
  console.log(`\n🎯 EXPECTED L3 STATUS TOTAL: ${weeklyValidCount + monthlyValidCount}`);
}

debugL3Status().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
