import { db, applicationRegistry, applicationPatterns } from '@repo/database';
import { eq } from 'drizzle-orm';

async function addMissingPatterns() {
  console.log('=== Adding Missing Patterns ===\n');

  const patternsToAdd = [
    { appCode: 'FFVV', pattern: 'Gestiona tu Negocio', priority: 30 },
    { appCode: 'UB-3', pattern: 'Unete 3.0', priority: 20 },
    { appCode: 'UN-2', pattern: 'Unete 2.0', priority: 20 },
    { appCode: 'CD', pattern: 'Catálogo Digital', priority: 20 },
  ];

  for (const { appCode, pattern, priority } of patternsToAdd) {
    // Get app ID
    const app = await db
      .select({ id: applicationRegistry.id })
      .from(applicationRegistry)
      .where(eq(applicationRegistry.code, appCode))
      .get();

    if (!app) {
      console.log(`❌ App ${appCode} not found`);
      continue;
    }

    // Insert pattern
    await db
      .insert(applicationPatterns)
      .values({
        applicationId: app.id,
        pattern,
        priority,
        matchType: 'contains',
        isActive: true,
      })
      .onConflictDoNothing();

    console.log(`✅ Added pattern "${pattern}" to ${appCode}`);
  }

  console.log('\nDone!');
}

addMissingPatterns().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
