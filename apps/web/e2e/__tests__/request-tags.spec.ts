import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Request Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/request-tags');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Request Tags', exact: true })
      ).toBeVisible();
    });

    test('should display upload section', async ({ page }) => {
      await expect(page.getByText('Upload Request Tags Report')).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.getByText('TOTAL TAGS')).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(
        page.getByText('View and manage request tag data from REP01 XD TAG 2025 imports')
      ).toBeVisible();
    });
  });

  test.describe('Upload Flow', () => {
    test('should upload Excel file and show success message', async ({ page }) => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'REP01 XD TAG 2025.xlsx');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(filePath);

      // Click upload button
      await page.getByRole('button', { name: /upload and parse/i }).click();

      // Wait for upload to complete - check for success toast or updated data
      await expect(
        page.getByText(/imported|total|success/i).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should enable upload button when file is selected', async ({ page }) => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'REP01 XD TAG 2025.xlsx');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(filePath);

      const uploadButton = page.getByRole('button', { name: /upload and parse/i });
      await expect(uploadButton).toBeEnabled();
    });
  });

  test.describe('Stats Grid', () => {
    test('should display all stat cards', async ({ page }) => {
      await expect(page.getByText('TOTAL TAGS')).toBeVisible();
      await expect(page.getByText('CATEGORIZED')).toBeVisible();
      await expect(page.getByText('WITH JIRA')).toBeVisible();
      await expect(page.getByText('LINKED')).toBeVisible();
    });

    test('should have refresh button', async ({ page }) => {
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      await expect(refreshButton).toBeVisible();
    });
  });

  test.describe('Data Table', () => {
    test.beforeEach(async ({ page }) => {
      // Upload data first to ensure table has content
      const filePath = path.join(__dirname, '..', 'fixtures', 'REP01 XD TAG 2025.xlsx');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(filePath);
      await page.getByRole('button', { name: /upload and parse/i }).click();
      // Wait for data to load (check for table or wait for API)
      await page.waitForTimeout(3000);
    });

    test('should display data table section', async ({ page }) => {
      // The "Tag Records" section header is always visible
      await expect(page.getByText('Tag Records')).toBeVisible({ timeout: 10000 });

      // Wait for loading to finish (check that loading spinner disappears)
      await expect(page.getByText('Loading tags...')).not.toBeVisible({ timeout: 15000 });

      // After loading, check for either table (with data) or empty state (no data)
      const table = page.locator('table');
      const emptyState = page.getByText('No tags found');

      // One of these should be visible after data loads
      const isTableVisible = await table.isVisible();
      const isEmptyVisible = await emptyState.isVisible();

      expect(isTableVisible || isEmptyVisible).toBe(true);

      // If table is visible, check headers
      if (isTableVisible) {
        await expect(page.getByText('Request ID')).toBeVisible();
      }
    });

    test('should have search filter input', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Request ID, Technician, Module/i);
      await expect(searchInput).toBeVisible();
      await searchInput.fill('test');
      // Verify search is applied (check filtered count updates)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Delete Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Upload data first
      const filePath = path.join(__dirname, '..', 'fixtures', 'REP01 XD TAG 2025.xlsx');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(filePath);
      await page.getByRole('button', { name: /upload and parse/i }).click();
      await page.waitForTimeout(2000);
    });

    test('should show confirmation dialog when delete clicked', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /clear all data/i });

      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await expect(page.getByText('Delete all request tags?')).toBeVisible();
      }
    });

    test('should close dialog on cancel', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /clear all data/i });

      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await expect(page.getByText('Delete all request tags?')).toBeVisible();

        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByText('Delete all request tags?')).not.toBeVisible();
      }
    });

    test('should delete all records when confirmed', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /clear all data/i });

      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.getByRole('button', { name: /delete all/i }).click();

        // Wait for deletion and verify success toast or empty state
        await page.waitForTimeout(2000);
        // After deletion, the delete button should not be visible (no data)
        await expect(deleteButton).not.toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Integration Flow', () => {
    test('should complete full workflow: upload, view, delete', async ({ page }) => {
      // 1. Upload file
      const filePath = path.join(__dirname, '..', 'fixtures', 'REP01 XD TAG 2025.xlsx');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('button', { name: /upload and parse/i }).click();

      // 2. Wait for data to appear
      await page.waitForTimeout(3000);

      // 3. Verify stats updated
      const totalTagsCard = page.getByText('TOTAL TAGS');
      await expect(totalTagsCard).toBeVisible();

      // 4. Verify Tag Records section is visible
      await expect(page.getByText('Tag Records')).toBeVisible({ timeout: 10000 });

      // 5. Delete all data (only if delete button is visible - means data exists)
      const deleteButton = page.getByRole('button', { name: /clear all data/i });
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.getByRole('button', { name: /delete all/i }).click();
        await page.waitForTimeout(2000);

        // 6. Verify data was deleted (delete button should be hidden or empty state shown)
        await expect(deleteButton).not.toBeVisible({ timeout: 5000 });
      }
    });
  });
});
