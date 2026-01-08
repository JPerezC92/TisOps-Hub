import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to TisOps Hub' })).toBeVisible();
});

test('analytics-dashboard page loads', async ({ page }) => {
  await page.goto('/analytics-dashboard');
  await expect(page.getByRole('heading', { name: 'Analytics Dashboard' })).toBeVisible();
});

test('monthly-report page loads', async ({ page }) => {
  await page.goto('/monthly-report');
  await expect(page.getByRole('heading', { name: 'Monthly Report', exact: true })).toBeVisible();
});

test('error-logs page loads', async ({ page }) => {
  await page.goto('/error-logs');
  await expect(page.getByRole('heading', { name: 'Error Logs' })).toBeVisible();
});

test('problems page loads', async ({ page }) => {
  await page.goto('/problems');
  await expect(page.getByRole('heading', { name: 'Problems Dashboard' })).toBeVisible();
});

test('war-rooms page loads', async ({ page }) => {
  await page.goto('/war-rooms');
  await expect(page.getByRole('heading', { name: 'War Rooms', exact: true })).toBeVisible();
});

test('tasks page loads', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page.getByRole('heading', { name: 'Tasks Manager' })).toBeVisible();
});

test('sessions-orders page loads', async ({ page }) => {
  await page.goto('/sessions-orders');
  await expect(page.getByRole('heading', { name: 'Sessions & Orders', exact: true })).toBeVisible();
});

test('request-tags page loads', async ({ page }) => {
  await page.goto('/request-tags');
  await expect(page.getByRole('heading', { name: 'Request Tags', exact: true })).toBeVisible();
});

test('request-relationships page loads', async ({ page }) => {
  await page.goto('/request-relationships');
  await expect(page.getByRole('heading', { name: 'Request Relationships', exact: true })).toBeVisible();
});

test('application-registry page loads', async ({ page }) => {
  await page.goto('/application-registry');
  await expect(page.getByRole('heading', { name: 'Application Registry' })).toBeVisible();
});

test('module-registry page loads', async ({ page }) => {
  await page.goto('/module-registry');
  await expect(page.getByRole('heading', { name: 'Module Registry' })).toBeVisible();
});

test('categorization-registry page loads', async ({ page }) => {
  await page.goto('/categorization-registry');
  await expect(page.getByRole('heading', { name: 'Categorization Registry' })).toBeVisible();
});

test('corrective-status-registry page loads', async ({ page }) => {
  await page.goto('/corrective-status-registry');
  await expect(page.getByRole('heading', { name: 'Corrective Status Registry' })).toBeVisible();
});

test('monthly-report-status-registry page loads', async ({ page }) => {
  await page.goto('/monthly-report-status-registry');
  await expect(page.getByRole('heading', { name: 'Monthly Report Status Registry' })).toBeVisible();
});

test('weekly-corrective page loads', async ({ page }) => {
  await page.goto('/weekly-corrective');
  await expect(page.getByRole('heading', { name: 'Weekly Corrective', exact: true })).toBeVisible();
});

test('imports page loads', async ({ page }) => {
  await page.goto('/imports');
  await expect(page.getByRole('heading', { name: 'Import History' })).toBeVisible();
});
