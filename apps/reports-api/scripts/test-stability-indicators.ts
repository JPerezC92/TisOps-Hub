import { db, monthlyReports, applicationPatterns, applicationRegistry, monthlyReportStatusRegistry } from '@repo/database';
import { sql, eq } from 'drizzle-orm';
import { DisplayStatus } from '@repo/reports';

async function testStabilityIndicators() {
  console.log('=== Testing Stability Indicators Logic ===\n');

  // Step 1: Get total records
  const allRecords = await db.select().from(monthlyReports).all();
  console.log(`Total monthly reports: ${allRecords.length}\n`);

  // Step 2: Query with JOIN (same as repository)
  const queryResults = await db
    .select({
      monthlyReport: monthlyReports,
      registeredAppName: applicationRegistry.name,
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
    .all();

  console.log(`Query results (with JOIN): ${queryResults.length}`);

  // Step 3: Deduplicate
  const seenIds = new Set<number>();
  const uniqueResults = queryResults.filter((r) => {
    if (seenIds.has(r.monthlyReport.requestId)) return false;
    seenIds.add(r.monthlyReport.requestId);
    return true;
  });
  console.log(`After deduplication: ${uniqueResults.length}\n`);

  // Step 4: Get status mappings
  const statusMappings = await db.select().from(monthlyReportStatusRegistry).all();
  const statusMap = new Map(statusMappings.map((r) => [r.rawStatus, r.displayStatus]));
  console.log('Status mappings:', Object.fromEntries(statusMap));

  // Step 5: Count by application and level
  const appMap = new Map<string, { l2: number; l3: number; unmapped: number; closed: number }>();

  for (const result of uniqueResults) {
    const record = result.monthlyReport;
    const app = result.registeredAppName || 'Unknown';

    if (!appMap.has(app)) {
      appMap.set(app, { l2: 0, l3: 0, unmapped: 0, closed: 0 });
    }

    const data = appMap.get(app)!;
    const status = statusMap.get(record.requestStatus);

    if (!status) {
      data.unmapped++;
      console.log(`  Unmapped: ${record.requestId} - "${record.requestStatus}"`);
    } else if (status === DisplayStatus.OnGoingL2) {
      data.l2++;
    } else if (status === DisplayStatus.OnGoingL3 || status === DisplayStatus.InL3Backlog) {
      data.l3++;
    } else if (status === DisplayStatus.Closed) {
      data.closed++;
    }
  }

  console.log('\n=== Results by Application ===');
  for (const [app, counts] of appMap) {
    const total = counts.l2 + counts.l3 + counts.unmapped;
    console.log(`${app}: L2=${counts.l2}, L3=${counts.l3}, Unmapped=${counts.unmapped}, Closed=${counts.closed}, Total(excl.Closed)=${total}`);
  }
}

testStabilityIndicators().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
