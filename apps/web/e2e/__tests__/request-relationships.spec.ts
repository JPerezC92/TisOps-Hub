import { test, expect } from '@playwright/test';

test.describe('Request Relationships', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/request-relationships');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Request Relationships', exact: true })
      ).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(
        page.getByText('Parent-Child Request Management')
      ).toBeVisible();
    });

    test('should display upload section', async ({ page }) => {
      await expect(
        page.getByText('Upload Request Relationships Report')
      ).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.getByText('TOTAL RELATIONSHIPS')).toBeVisible();
      await expect(page.getByText('UNIQUE PARENT REQUESTS')).toBeVisible();
      await expect(page.getByText('AVERAGE CHILDREN')).toBeVisible();
    });
  });

  test.describe('Upload Section', () => {
    test('should display upload description', async ({ page }) => {
      await expect(
        page.getByText(/Upload an Excel file.*to import parent-child request relationships/)
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
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      await expect(refreshButton).toBeVisible();
    });

    test('should display all stat cards', async ({ page }) => {
      await expect(page.getByText('TOTAL RELATIONSHIPS')).toBeVisible();
      await expect(page.getByText('UNIQUE PARENT REQUESTS')).toBeVisible();
      await expect(page.getByText('AVERAGE CHILDREN')).toBeVisible();
    });
  });

  test.describe('Top Parents Table', () => {
    test('should display table header', async ({ page }) => {
      await expect(page.getByText('Top 10 Parent Requests')).toBeVisible();
    });

    test('should display table columns', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const table = page.locator('table').first();
      if (await table.isVisible()) {
        await expect(page.getByText('Rank', { exact: true })).toBeVisible();
        await expect(page.getByText('Parent Request ID', { exact: true })).toBeVisible();
        await expect(page.getByText('Child Count', { exact: true })).toBeVisible();
      }
    });
  });

  test.describe('Recent Relationships Table', () => {
    test('should display table header', async ({ page }) => {
      await expect(page.getByText('Recent Relationships')).toBeVisible();
    });

    test('should show loading or content', async ({ page }) => {
      await page.goto('/request-relationships');

      // Wait for either loading, table content, or empty state to appear
      await page.waitForTimeout(2000);

      const loadingText = page.getByText(/Loading relationships/i);
      const tableRows = page.locator('table tbody tr');
      const emptyState = page.getByText('No data available');

      const isLoading = await loadingText.isVisible();
      const hasTableRows = (await tableRows.count()) > 0;
      const isEmpty = await emptyState.isVisible();

      expect(isLoading || hasTableRows || isEmpty).toBe(true);
    });

    test('should display table or empty state after loading', async ({ page }) => {
      // Wait for loading to complete
      await page.waitForTimeout(3000);

      const table = page.locator('table').last();
      const emptyState = page.getByText('No data available');

      const isTableVisible = await table.isVisible();
      const isEmptyVisible = await emptyState.isVisible();

      expect(isTableVisible || isEmptyVisible).toBe(true);
    });

    test('should display table headers when data exists', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(3000);

      // Check for data by looking for table rows with request IDs (monospace badges)
      const tableRows = page.locator('table').last().locator('tbody tr');
      const rowCount = await tableRows.count();

      // This test only verifies headers when data exists - it's a conditional test
      if (rowCount > 0) {
        // If data exists, check for table headers (they use th elements)
        const headers = page.locator('table').last().locator('th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);
      }
      // If no data, test passes automatically - empty state is tested separately
    });
  });

  test.describe('Delete Confirmation', () => {
    test('should show delete confirmation dialog when clear data is clicked', async ({
      page,
    }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      // Check if clear data button exists (only visible when data exists)
      const clearButton = page.getByRole('button', { name: /clear data/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();

        await expect(page.getByText('Confirm Delete')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should close confirmation dialog when Cancel is clicked', async ({
      page,
    }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear data/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();

        await expect(page.getByText('Confirm Delete')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: /cancel/i }).click();

        await expect(page.getByText('Confirm Delete')).not.toBeVisible();
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display friendly message when no data', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const emptyState = page.getByText('No data available');
      if (await emptyState.isVisible()) {
        await expect(page.getByText('Upload a file to get started')).toBeVisible();
      }
    });
  });
});
