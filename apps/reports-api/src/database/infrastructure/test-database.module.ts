import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import {
  createTestDatabase,
  migrateTestDatabase,
  DATABASE_CONNECTION,
} from '@repo/database';

let testDbInstance: any = null;
let testClientInstance: any = null;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async () => {
        // Create in-memory database
        const { db, client } = createTestDatabase();
        testDbInstance = db;
        testClientInstance = client;

        // Run migrations to ensure schema is up to date
        // Using relative path from cwd (apps/reports-api when running tests)
        await migrateTestDatabase(db, './src/database/infrastructure/migrations');

        return db;
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class TestDatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    // Cleanup client connection if needed
    if (testClientInstance) {
      testClientInstance.close?.();
    }
  }
}
