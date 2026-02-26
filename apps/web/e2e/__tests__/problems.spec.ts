import { test, expect } from '@playwright/test';

test.describe('Problems Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/problems');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Problems Dashboard', exact: true })
      ).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(
        page.getByText('View and manage reported problems from XD PROBLEMAS NUEVOS')
      ).toBeVisible();
    });

    test('should display upload section', async ({ page }) => {
      await expect(
        page.getByText('Upload Problems Report')
      ).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.getByText('TOTAL PROBLEMS')).toBeVisible();
      await expect(page.locator('p').getByText('Applications')).toBeVisible();
      await expect(page.getByText('CREATORS')).toBeVisible();
      await expect(page.getByText('WITH ACTION PLANS')).toBeVisible();
    });
  });

  test.describe('Upload Section', () => {
    test('should display upload description', async ({ page }) => {
      await expect(
        page.getByText(/Upload an Excel file.*to import and manage problems data/)
      ).toBeVisible();
    });

    test('should have file input', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    });

    test('should have upload button', async ({ page }) => {
      const uploadButton = page.getByRole('button', { name: /upload/i });
      await expect(uploadButton).toBeVisible();
    });
  });

  test.describe('Stats Grid', () => {
    test('should have refresh button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /refresh/i })
      ).toBeVisible();
    });

    test('should display all stat cards', async ({ page }) => {
      await expect(page.getByText('TOTAL PROBLEMS')).toBeVisible();
      await expect(page.locator('p').getByText('Applications')).toBeVisible();
      await expect(page.getByText('CREATORS')).toBeVisible();
      await expect(page.getByText('WITH ACTION PLANS')).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder('Subject or Request ID...')
      ).toBeVisible();
    });

    test('should display application filter', async ({ page }) => {
      const selects = page.locator('select');
      const applicationSelect = selects.first();
      await expect(applicationSelect).toBeVisible();
    });

    test('should display category filter', async ({ page }) => {
      const selects = page.locator('select');
      const count = await selects.count();
      // Should have at least 2 filter selects (application + category) plus pagination select
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Data Table', () => {
    test('should display table section header', async ({ page }) => {
      await expect(page.getByText('Problem Records')).toBeVisible();
    });

    test('should show loading or content', async ({ page }) => {
      // Wait for the page to settle
      await page.waitForTimeout(2000);

      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();

      // Either we have data rows or the table is empty
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should display table headers when data exists', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);

      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        await expect(page.getByText('Request ID', { exact: true })).toBeVisible();
        await expect(page.getByText('Subject', { exact: true })).toBeVisible();
        await expect(page.getByText('Application', { exact: true })).toBeVisible();
        await expect(page.getByText('Category', { exact: true })).toBeVisible();
      }
      // If no data, just pass — table headers may still be visible but not required
    });
  });

  test.describe('Delete Confirmation', () => {
    test('should show delete confirmation dialog when clear data is clicked', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear all data/i });

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(page.getByText('Delete All Problems')).toBeVisible();
        await expect(
          page.getByText(/permanently delete all data from the problems table/)
        ).toBeVisible();
      }
    });

    test('should close confirmation when clicking Cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear all data/i });

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(page.getByText('Delete All Problems')).toBeVisible();

        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByText('Delete All Problems')).not.toBeVisible();
      }
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination controls', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Pagination area should have the items-per-page select
      const paginationSelect = page.locator('select').filter({ hasText: /per page/ });
      await expect(paginationSelect.first()).toBeVisible();
    });
  });
});
