import { db, monthlyReportStatusRegistry } from '@repo/database';
import { DisplayStatus } from '@repo/reports';
import { eq } from 'drizzle-orm';

async function fixStatusRegistry() {
  console.log('=== Fixing Status Registry Display Values ===\n');

  // Update to use enum values (which now have "in")
  const updates = [
    { rawStatus: 'Nivel 2', correctDisplay: DisplayStatus.OnGoingL2 },  // 'On going in L2'
    { rawStatus: 'Nivel 3', correctDisplay: DisplayStatus.OnGoingL3 },  // 'On going in L3'
  ];

  for (const { rawStatus, correctDisplay } of updates) {
    console.log(`Updating "${rawStatus}" → "${correctDisplay}"`);
    await db
      .update(monthlyReportStatusRegistry)
      .set({ displayStatus: correctDisplay })
      .where(eq(monthlyReportStatusRegistry.rawStatus, rawStatus));
  }

  // Verify the updates
  console.log('\n=== Current Status Mappings ===');
  const all = await db.select().from(monthlyReportStatusRegistry).all();
  for (const s of all) {
    console.log(`"${s.rawStatus}" → "${s.displayStatus}"`);
  }
}

fixStatusRegistry().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
