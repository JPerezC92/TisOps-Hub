import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/database/infrastructure/migrations',
  schema: './src/database/infrastructure/schemas/*.schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
});
