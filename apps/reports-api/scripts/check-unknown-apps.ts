import { db, monthlyReports, applicationPatterns, applicationRegistry } from '@repo/database';
import { sql, eq } from 'drizzle-orm';

async function checkUnknownApps() {
  const results = await db
    .select({
      aplicativos: monthlyReports.aplicativos,
      registeredAppName: applicationRegistry.name
    })
    .from(monthlyReports)
    .leftJoin(
      applicationPatterns,
      sql`LOWER(${monthlyReports.aplicativos}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`
    )
    .leftJoin(
      applicationRegistry,
      eq(applicationPatterns.applicationId, applicationRegistry.id)
    )
    .all();

  const unknown = results.filter(r => !r.registeredAppName);
  const uniqueApps = [...new Set(unknown.map(r => r.aplicativos))];

  console.log('=== Raw app names grouped as "Unknown" ===');
  uniqueApps.forEach(app => console.log(`  - "${app}"`));
  console.log(`\nTotal: ${uniqueApps.length} unique app names, ${unknown.length} records`);
}

checkUnknownApps().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
