import { db, monthlyReports } from '@repo/database';
import { DateTime } from 'luxon';

interface CategorizationDetail {
  categorization: string;
  count: number;
  percentage: number;
}

interface ModuleEvolution {
  module: string;
  count: number;
  percentage: number;
  categorizations: CategorizationDetail[];
}

async function testModuleEvolutionQuery() {
  console.log('Testing Module Evolution Query...\n');

  // Get default date range: Last Friday to Last Thursday
  const today = DateTime.now();
  let lastThursday = today.set({ weekday: 4 });
  if (lastThursday >= today) {
    lastThursday = lastThursday.minus({ weeks: 1 });
  }
  const lastFriday = lastThursday.minus({ days: 6 });

  console.log(
    `Date Range: ${lastFriday.toFormat('yyyy-MM-dd')} to ${lastThursday.toFormat('yyyy-MM-dd')}\n`,
  );

  try {
    // Step 1: Fetch all records
    const records = await db.select().from(monthlyReports).all();
    console.log(`Total records in database: ${records.length}`);

    // Step 2: Filter by date range
    const filteredRecords = records.filter((record) => {
      try {
        // createdTime is now a Date object
        const createdDate = DateTime.fromJSDate(record.createdTime);
        if (!createdDate.isValid) return false;
        return (
          createdDate >= lastFriday.startOf('day') &&
          createdDate <= lastThursday.endOf('day')
        );
      } catch {
        return false;
      }
    });
    console.log(`Records in date range: ${filteredRecords.length}\n`);

    if (filteredRecords.length === 0) {
      console.log(
        'No records found in date range. Showing all records instead for testing...\n',
      );
      // Use all records for testing if date range has no results
      return testWithAllRecords(records);
    }

    return processRecords(filteredRecords);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function processRecords(records: any[]) {
  // Step 3: Group by Module, then by Categorization
  const moduleMap = new Map<string, Map<string, number>>();

  for (const record of records) {
    const module = record.modulo || 'Unknown';
    const categorization = record.categorizacion || 'Unknown';

    if (!moduleMap.has(module)) {
      moduleMap.set(module, new Map());
    }
    const catMap = moduleMap.get(module)!;
    catMap.set(categorization, (catMap.get(categorization) || 0) + 1);
  }

  // Step 4: Calculate totals and percentages
  const total = records.length;
  const results: ModuleEvolution[] = [];

  for (const [module, catMap] of moduleMap) {
    const moduleCount = Array.from(catMap.values()).reduce((a, b) => a + b, 0);
    const categorizations: CategorizationDetail[] = [];

    for (const [cat, count] of catMap) {
      categorizations.push({
        categorization: cat,
        count,
        percentage: Math.round((count / total) * 10000) / 100,
      });
    }

    // Sort categorizations by count descending
    categorizations.sort((a, b) => b.count - a.count);

    results.push({
      module,
      count: moduleCount,
      percentage: Math.round((moduleCount / total) * 10000) / 100,
      categorizations,
    });
  }

  // Sort modules by count descending
  results.sort((a, b) => b.count - a.count);

  // Step 5: Display results as table
  console.log('='.repeat(80));
  console.log('Module Evolution Results:');
  console.log('='.repeat(80));

  // Build table data for console.table
  const tableData: Array<{
    'Module / Categorization': string;
    Count: number;
    '%': string;
  }> = [];

  for (const mod of results) {
    // Module row (parent)
    tableData.push({
      'Module / Categorization': `▼ ${mod.module}`,
      Count: mod.count,
      '%': `${mod.percentage}%`,
    });

    // Categorization rows (children)
    for (const cat of mod.categorizations) {
      tableData.push({
        'Module / Categorization': `    └─ ${cat.categorization}`,
        Count: cat.count,
        '%': `${cat.percentage}%`,
      });
    }
  }

  console.table(tableData);

  console.log('='.repeat(80));
  console.log(`Grand Total: ${total} incidents`);
  console.log(`Unique Modules: ${results.length}`);
  console.log('='.repeat(80));
}

function testWithAllRecords(records: any[]) {
  console.log('Processing all records without date filter...\n');
  processRecords(records);
}

testModuleEvolutionQuery()
  .then(() => {
    console.log('\nTest complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
