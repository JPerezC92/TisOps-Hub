# E2E Test Problems

## Problem 1: Tests Run Against the Dev Database

E2E tests use the same Turso database as development (`apps/reports-api/.env` → `tisops-hub-dev`). There is no separate test database.

Consequences:
- **Destructive tests delete real data** — e.g., request-tags "should delete all records when confirmed" wipes the dev database
- **Test results depend on dev database state** — tests pass or fail depending on what data happens to exist
- **Tests are not isolated** — one test's side effects affect other tests and manual development

### Fix Required

Create a dedicated test database (e.g., `tisops-hub-test`) and configure E2E tests to use it via a separate `.env.test` or environment variable override.

---

## Problem 2: Conditional Assertions Hide Real Failures

## Problem

Several E2E tests use `if` guards that check whether data exists before running assertions. When the database is empty, the `if` condition is false and the assertions never execute. The test passes having tested nothing.

```ts
// BAD: This test passes even if selectors are completely wrong
if (rowCount > 0) {
  await expect(page.locator('th').getByText('Status')).toBeVisible();
}
```

This pattern hid 6 broken selectors (strict mode violations) that were only discovered after configuring the backend to run during E2E tests.

## Root Cause

These pages conditionally render the table. When there's no data, the table doesn't exist in the DOM at all:

```tsx
{isLoading ? (
  <Spinner />
) : filteredRecords.length === 0 ? (
  <div>No monthly reports found</div>  // table doesn't exist
) : (
  <table>...</table>  // table only exists with data
)}
```

So you can't assert table headers when the database is empty — they literally aren't rendered.

## Affected Tests

| File | Test | Empty State Message |
|------|------|---------------------|
| monthly-report.spec.ts:81 | should display table headers | "No monthly reports found" |
| monthly-report.spec.ts:130 | should display pagination controls | "No monthly reports found" |
| corrective-status-registry.spec.ts:55 | should display table headers | "No status mappings found" |
| monthly-report-status-registry.spec.ts:58 | should display table headers | "No status mappings found" |
| problems.spec.ts:105 | should display table headers | (always renders table) |
| request-relationships.spec.ts:70 | should display table columns | (always renders table) |

Note: `problems` and `request-relationships` always render the table even with 0 rows, so those can be asserted directly (already fixed).

## Current State (Temporary)

The selector bugs (strict mode violations) have been fixed. The conditional `if` guards remain for pages that hide the table when empty. This means:
- With data: assertions run and verify correct behavior
- Without data: assertions are skipped (silent pass)

## Proposed Solution: Database Seeding

Add a test setup step that seeds the database with known test data before E2E tests run. This ensures:
1. Tables always have data, so assertions always execute
2. Tests are deterministic — same data every run
3. No `if` guards needed — assert directly

### Implementation Options

**Option A: Global setup script**
- Create a Playwright `globalSetup` that inserts seed data via API calls or direct DB access
- Add a `globalTeardown` that cleans up
- All tests can assume data exists

**Option B: Per-test API seeding**
- Use `test.beforeAll` or `test.beforeEach` to call backend endpoints that create test data
- Clean up in `test.afterAll`
- More isolated but slower

**Option C: Shared test database snapshot**
- Maintain a SQL dump with test data
- Restore it before the test suite runs
- Fast but requires DB access from test runner

### Recommended: Option A (Global Setup)

```ts
// playwright.config.ts
export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  // ...
});

// e2e/global-setup.ts
export default async function globalSetup() {
  // Seed test data via API
  await fetch('http://localhost:3000/monthly-report/seed-test-data', { method: 'POST' });
  await fetch('http://localhost:3000/corrective-status-registry/seed-test-data', { method: 'POST' });
  // etc.
}
```

## Related Fix: Backend Now Runs During E2E Tests

The Playwright config was updated to start the backend automatically:

```ts
// apps/web/playwright.config.ts
webServer: [
  {
    command: 'pnpm --filter reports-api dev',
    url: 'http://localhost:3000',
    cwd: '../..',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'pnpm dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
],
```

This was necessary because the analytics-dashboard E2E test needs to verify that the application dropdown loads data from the backend — the exact scenario that broke when migrating to JSend response format.
