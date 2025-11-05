import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/database/infrastructure/migrations',
  schema: '../../packages/database/src/schemas/*.schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
});
