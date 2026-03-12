import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '..', '..');
const DB_PATH = path.join(MONOREPO_ROOT, 'e2e-test.db');
const DB_URL = `file:${DB_PATH}`;

export default defineConfig({
  testDir: './e2e/__tests__',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: process.env.E2E_KEEP_DB
    ? undefined
    : './e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'smoke',
      testMatch: 'smoke.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'seeded-data',
      testMatch: [
        'analytics-dashboard.spec.ts',
        'corrective-status-registry.spec.ts',
        'monthly-report-status-registry.spec.ts',
        'monthly-report.spec.ts',
        'problems.spec.ts',
        'request-relationships.spec.ts',
        'categorization-registry.spec.ts',
        'module-registry.spec.ts',
        'error-logs.spec.ts',
        'war-rooms.spec.ts',
        'sessions-orders.spec.ts',
        'weekly-corrective.spec.ts',
      ],
      dependencies: ['smoke'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'data-mutation',
      testMatch: ['request-tags.spec.ts'],
      dependencies: ['seeded-data'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `cross-env "DATABASE_URL=${DB_URL}" DATABASE_AUTH_TOKEN= pnpm --filter reports-api dev`,
      url: 'http://localhost:3000',
      cwd: '../..',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
      timeout: 30000,
    },
    {
      command: 'pnpm dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
