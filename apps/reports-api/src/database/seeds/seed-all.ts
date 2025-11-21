import { db, applicationRegistry, applicationPatterns } from '@repo/database';
import { seed } from 'drizzle-seed';

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
        { pattern: 'Force de Vente', priority: 30 },
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
      patterns: [{ pattern: 'Unete Belcorp 3.0', priority: 10 }],
    },
    {
      code: 'UN-2',
      name: 'Unete Belcorp 2.0',
      description: 'Unete Belcorp versión 2.0',
      patterns: [{ pattern: 'Unete Belcorp 2.0', priority: 10 }],
    },
    {
      code: 'CD',
      name: 'Catalogo Digital',
      description: 'Plataforma Catalogo Digital',
      patterns: [{ pattern: 'Catalogo Digital', priority: 10 }],
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

    // Insert application
    const [insertedApp] = await db
      .insert(applicationRegistry)
      .values({
        code: app.code,
        name: app.name,
        description: app.description,
        isActive: true,
      })
      .returning();

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
