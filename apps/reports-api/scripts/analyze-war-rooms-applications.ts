import { db, warRooms } from '@repo/database';
import { sql } from 'drizzle-orm';

interface ApplicationStat {
  application: string;
  count: number;
}

async function analyzeWarRoomsApplications() {
  console.log('Analyzing War Rooms application names...\n');

  try {
    // Get unique application names with their counts
    const results = await db
      .select({
        application: warRooms.application,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(warRooms)
      .groupBy(warRooms.application)
      .orderBy(sql`count DESC`)
      .all();

    if (results.length === 0) {
      console.log('No war rooms data found. Please upload war rooms data first.');
      return;
    }

    const stats = results as ApplicationStat[];
    const totalRecords = stats.reduce((sum, stat) => sum + stat.count, 0);

    console.log(`Total War Rooms Records: ${totalRecords}`);
    console.log(`Unique Application Names: ${stats.length}\n`);
    console.log('Application Name Variations:');
    console.log('=' .repeat(80));

    // Display each unique application name with its count
    stats.forEach((stat, index) => {
      const percentage = ((stat.count / totalRecords) * 100).toFixed(2);
      console.log(
        `${index + 1}. "${stat.application}" - ${stat.count} records (${percentage}%)`,
      );
    });

    console.log('=' .repeat(80));
    console.log(
      '\nUse this information to create application registry entries and patterns.',
    );
    console.log(
      'Group similar names (e.g., "Somos Belcorp 2.0", "APP - SOMOS BELCORP") under one registry entry.',
    );
    console.log(
      '\nExample: Create "SB" application with patterns for all Somos Belcorp variations.\n',
    );
  } catch (error) {
    console.error('Error analyzing applications:', error);
    throw error;
  }
}

analyzeWarRoomsApplications()
  .then(() => {
    console.log('Analysis complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Analysis failed:', error);
    process.exit(1);
  });
