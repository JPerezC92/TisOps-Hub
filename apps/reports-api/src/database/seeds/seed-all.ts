import { db, applicationRegistry, applicationPatterns, monthlyReportStatusRegistry, correctiveStatusRegistry, categorizationRegistry, moduleRegistry } from '@repo/database';
import { seed } from 'drizzle-seed';
import { DisplayStatus, CorrectiveStatus, CorrectiveStatusSpanish } from '@repo/reports';
import { categorizationMappings } from './data/categorization-registry.data';
import { moduleMappings } from './data/module-registry.data';

/**
 * Seed script for all database tables
 * This script populates the database with initial data for all modules
 */
async function seedAll() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed Application Registry
    console.log('📋 Seeding Application Registry...');
    await seedApplicationRegistry();
    console.log('✅ Application Registry seeded successfully\n');

    // Seed Monthly Report Status Registry
    console.log('📋 Seeding Monthly Report Status Registry...');
    await seedMonthlyReportStatusRegistry();
    console.log('✅ Monthly Report Status Registry seeded successfully\n');

    // Seed Corrective Status Registry
    console.log('📋 Seeding Corrective Status Registry...');
    await seedCorrectiveStatusRegistry();
    console.log('✅ Corrective Status Registry seeded successfully\n');

    // Seed Categorization Registry
    console.log('📋 Seeding Categorization Registry...');
    await seedCategorizationRegistry();
    console.log('✅ Categorization Registry seeded successfully\n');

    // Seed Module Registry
    console.log('📋 Seeding Module Registry...');
    await seedModuleRegistry();
    console.log('✅ Module Registry seeded successfully\n');

    console.log('🎉 All seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    
    throw error;
  }
}

/**
 * Seeds the application registry with common applications and their patterns
 */
async function seedApplicationRegistry() {
  // Define applications with their patterns
  const applications = [
    {
      code: 'FFVV',
      name: 'Fuerza de Venta',
      description: 'Sistema de Fuerza de Venta',
      patterns: [
        { pattern: 'FFVV', priority: 10 },
        { pattern: 'APP - Crecer es Ganar (FFVV)', priority: 20 },
        { pattern: 'Gestiona tu Negocio', priority: 30 },
      ],
    },
    {
      code: 'SB',
      name: 'Somos Belcorp',
      description: 'Plataforma Somos Belcorp',
      patterns: [
        { pattern: 'Somos Belcorp', priority: 10 },
        { pattern: 'APP - SOMOS BELCORP', priority: 20 },
      ],
    },
    {
      code: 'UB-3',
      name: 'Unete Belcorp 3.0',
      description: 'Unete Belcorp versión 3.0',
      patterns: [
        { pattern: 'Unete Belcorp 3.0', priority: 10 },
        { pattern: 'Unete 3.0', priority: 20 },
      ],
    },
    {
      code: 'UN-2',
      name: 'Unete Belcorp 2.0',
      description: 'Unete Belcorp versión 2.0',
      patterns: [
        { pattern: 'Unete Belcorp 2.0', priority: 10 },
        { pattern: 'Unete 2.0', priority: 20 },
      ],
    },
    {
      code: 'CD',
      name: 'Catalogo Digital',
      description: 'Plataforma Catalogo Digital',
      patterns: [
        { pattern: 'Catalogo Digital', priority: 10 },
        { pattern: 'Catálogo Digital', priority: 20 },
      ],
    },
    {
      code: 'PROL',
      name: 'PROL',
      description: 'PROL',
      patterns: [{ pattern: 'PROL', priority: 10 }],
    },
  ];

  // Insert applications and their patterns
  for (const app of applications) {
    console.log(`  → Creating application: ${app.name} (${app.code})`);

    // Insert application (skip if already exists)
    const result = await db
      .insert(applicationRegistry)
      .values({
        code: app.code,
        name: app.name,
        description: app.description,
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    // Skip if application already exists
    if (result.length === 0) {
      console.log(`     Already exists, skipping...`);
      continue;
    }

    const insertedApp = result[0];

    // Insert patterns for this application
    for (const pattern of app.patterns) {
      await db.insert(applicationPatterns).values({
        applicationId: insertedApp.id,
        pattern: pattern.pattern,
        priority: pattern.priority,
        matchType: 'contains',
        isActive: true,
      });
    }

    console.log(`     Added ${app.patterns.length} pattern(s)`);
  }

  console.log(`  ✓ Created ${applications.length} applications with patterns`);
}

/**
 * Seeds the monthly report status registry with default status mappings
 */
async function seedMonthlyReportStatusRegistry() {
  const statusMappings = [
    { rawStatus: 'Closed', displayStatus: DisplayStatus.Closed },
    { rawStatus: 'Validado', displayStatus: DisplayStatus.Closed },
    { rawStatus: 'Nivel 2', displayStatus: DisplayStatus.OnGoingL2 },
    { rawStatus: 'Nivel 3', displayStatus: DisplayStatus.OnGoingL3 },
    { rawStatus: 'En Mantenimiento Correctivo', displayStatus: DisplayStatus.InL3Backlog },
    { rawStatus: 'En Pruebas', displayStatus: DisplayStatus.InL3Backlog },
    { rawStatus: 'Dev in Progress', displayStatus: DisplayStatus.InL3Backlog },
  ];

  for (const mapping of statusMappings) {
    console.log(`  → Creating mapping: ${mapping.rawStatus} → ${mapping.displayStatus}`);

    await db
      .insert(monthlyReportStatusRegistry)
      .values({
        rawStatus: mapping.rawStatus,
        displayStatus: mapping.displayStatus,
        isActive: true,
      })
      .onConflictDoNothing();
  }

  console.log(`  ✓ Created ${statusMappings.length} status mappings`);
}

/**
 * Seeds the corrective status registry with L3 status mappings (Spanish → English)
 */
async function seedCorrectiveStatusRegistry() {
  const statusMappings = [
    { rawStatus: CorrectiveStatusSpanish.PrdDeployment, displayStatus: CorrectiveStatus.PrdDeployment },
    { rawStatus: CorrectiveStatusSpanish.EnPruebas, displayStatus: CorrectiveStatus.InTesting },
    { rawStatus: CorrectiveStatusSpanish.EnMantenimientoCorrectivo, displayStatus: CorrectiveStatus.InBacklog },
    { rawStatus: CorrectiveStatusSpanish.DevInProgress, displayStatus: CorrectiveStatus.DevInProgress },
    { rawStatus: CorrectiveStatusSpanish.Nivel3, displayStatus: CorrectiveStatus.InBacklog },
  ];

  for (const mapping of statusMappings) {
    console.log(`  → Creating mapping: ${mapping.rawStatus} → ${mapping.displayStatus}`);

    await db
      .insert(correctiveStatusRegistry)
      .values({
        rawStatus: mapping.rawStatus,
        displayStatus: mapping.displayStatus,
        isActive: true,
      })
      .onConflictDoNothing();
  }

  console.log(`  ✓ Created ${statusMappings.length} corrective status mappings`);
}

/**
 * Seeds the categorization registry with source value to display value mappings
 */
async function seedCategorizationRegistry() {
  for (const mapping of categorizationMappings) {
    console.log(`  → Creating mapping: ${mapping.sourceValue} → ${mapping.displayValue}`);

    await db
      .insert(categorizationRegistry)
      .values({
        sourceValue: mapping.sourceValue,
        displayValue: mapping.displayValue,
        isActive: true,
      })
      .onConflictDoNothing();
  }

  console.log(`  ✓ Created ${categorizationMappings.length} categorization mappings`);
}

/**
 * Seeds the module registry with source value to display value mappings and application indicator
 */
async function seedModuleRegistry() {
  for (const mapping of moduleMappings) {
    console.log(`  → Creating mapping: ${mapping.sourceValue} → ${mapping.displayValue} (${mapping.application})`);

    await db
      .insert(moduleRegistry)
      .values({
        sourceValue: mapping.sourceValue,
        displayValue: mapping.displayValue,
        application: mapping.application,
        isActive: true,
      })
      .onConflictDoNothing();
  }

  console.log(`  ✓ Created ${moduleMappings.length} module mappings`);
}

// Execute seeding
seedAll()
  .then(() => {
    console.log('\n✨ Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database seeding failed:', error);
    process.exit(1);
  });
