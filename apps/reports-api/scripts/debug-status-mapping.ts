import { db, monthlyReports, monthlyReportStatusRegistry } from '@repo/database';

async function debugStatusMapping() {
  // 1. Load status registry into Map (same as findStabilityIndicators)
  const statuses = await db.select().from(monthlyReportStatusRegistry).all();
  const statusMap = new Map(statuses.map(s => [s.rawStatus, s.displayStatus]));

  console.log('=== Status Registry Map ===\n');
  for (const [raw, display] of statusMap) {
    console.log(`"${raw}" (len=${raw.length}) → ${display}`);
    console.log(`  Chars: [${[...raw].map(c => c.charCodeAt(0)).join(', ')}]\n`);
  }

  // 2. Test lookup for "Dev" records
  console.log('=== Testing Map Lookup for "Dev" Records ===\n');
  const records = await db.select().from(monthlyReports).all();
  const devRecords = records.filter(r => r.requestStatus?.includes('Dev'));

  let unmappedCount = 0;
  for (const r of devRecords) {
    const status = r.requestStatus || '';
    const mapped = statusMap.get(status);
    const mappedTrimmed = statusMap.get(status.trim());

    console.log(`Request ${r.requestId}: "${status}" (len=${status.length})`);
    console.log(`  Chars: [${[...status].map(c => c.charCodeAt(0)).join(', ')}]`);
    console.log(`  Map.get(status): ${mapped ?? 'UNMAPPED ❌'}`);
    console.log(`  Map.get(status.trim()): ${mappedTrimmed ?? 'UNMAPPED'}`);

    if (!mapped) unmappedCount++;
  }

  console.log(`\n=== Result: ${unmappedCount} unmapped "Dev" records ===`);
}

debugStatusMapping().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
