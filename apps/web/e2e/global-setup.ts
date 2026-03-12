import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '..', '..', '..');

export default async function globalSetup() {
  console.log('[E2E Setup] Starting database setup...');

  execSync('pnpm --filter reports-api db:reset:e2e', {
    cwd: MONOREPO_ROOT,
    stdio: 'inherit',
  });

  console.log('[E2E Setup] Database ready');
}
