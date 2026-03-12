import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const DB_PATH = path.join(MONOREPO_ROOT, 'e2e-test.db');

export default async function globalTeardown() {
  if (process.env.E2E_KEEP_DB) {
    console.log('[E2E Teardown] Keeping test database (E2E_KEEP_DB is set)');
    return;
  }

  for (const suffix of ['', '-wal', '-shm']) {
    const file = DB_PATH + suffix;
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch {
      // File may be locked by a still-running process — ignore
    }
  }
  console.log('[E2E Teardown] Cleaned up test database');
}
