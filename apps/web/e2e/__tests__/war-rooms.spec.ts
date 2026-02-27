import { test, expect } from '@playwright/test';

test.describe('War Rooms Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/war-rooms');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'War Rooms', exact: true })).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(page.locator('p').getByText('View and manage war room incident records')).toBeVisible();
    });

    test('should display upload section', async ({ page }) => {
      await expect(page.getByText('Upload War Rooms Report')).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.getByText('TOTAL RECORDS')).toBeVisible();
    });
  });

  test.describe('Upload Section', () => {
    test('should display upload description', async ({ page }) => {
      await expect(page.getByText(/Upload an Excel file.*EDWarRooms2025/)).toBeVisible();
    });

    test('should have file input', async ({ page }) => {
      await expect(page.locator('input[type="file"]')).toBeAttached();
    });

    test('should have upload button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /upload/i })).toBeVisible();
    });
  });

  test.describe('Stats Grid', () => {
    test('should have refresh button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
    });

    test('should display all stat cards', async ({ page }) => {
      await expect(page.getByText('TOTAL RECORDS')).toBeVisible();
      await expect(page.getByText('CRITICAL PRIORITY')).toBeVisible();
      await expect(page.getByText('HIGH PRIORITY')).toBeVisible();
      await expect(page.getByText('CLOSED STATUS')).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('should display search input', async ({ page }) => {
      await expect(page.getByPlaceholder(/Request ID, Application, Summary/)).toBeVisible();
    });

    test('should display application filter', async ({ page }) => {
      const appSelect = page.locator('select').filter({ hasText: /All Applications/ });
      await expect(appSelect.first()).toBeVisible();
    });

    test('should display status filter', async ({ page }) => {
      const statusSelect = page.locator('select').filter({ hasText: /All Statuses/ });
      await expect(statusSelect.first()).toBeVisible();
    });
  });

  test.describe('Data Table', () => {
    test('should display table section header', async ({ page }) => {
      await expect(page.getByText('War Room Records')).toBeVisible();
    });

    test('should show loading or content', async ({ page }) => {
      const loadingOrContent = page.locator('text=Loading war rooms').or(
        page.locator('text=No war rooms found').or(page.locator('table'))
      );
      await expect(loadingOrContent.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display table headers when data exists', async ({ page }) => {
      await page.waitForTimeout(3000);

      const table = page.locator('table');
      const tableExists = await table.count();

      if (tableExists > 0) {
        await expect(page.locator('th').getByText('Request ID')).toBeVisible();
        await expect(page.locator('th').getByText('Application')).toBeVisible();
        await expect(page.locator('th').getByText('Date')).toBeVisible();
        await expect(page.locator('th').getByText('Summary')).toBeVisible();
        await expect(page.locator('th').getByText('Initial Priority')).toBeVisible();
        await expect(page.locator('th').getByText('Status')).toBeVisible();
        await expect(page.locator('th').getByText('Participants')).toBeVisible();
        await expect(page.locator('th').getByText('Duration (Min)')).toBeVisible();
      }
    });
  });

  test.describe('Delete Confirmation', () => {
    test('should show delete confirmation dialog when clear data is clicked', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear data/i });
      const hasClearButton = await clearButton.count();

      if (hasClearButton > 0) {
        await clearButton.click();
        await expect(page.getByText('Delete All War Room Records')).toBeVisible();
      }
    });

    test('should close confirmation when clicking Cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear data/i });
      const hasClearButton = await clearButton.count();

      if (hasClearButton > 0) {
        await clearButton.click();
        await expect(page.getByText('Delete All War Room Records')).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByText('Delete All War Room Records')).not.toBeVisible();
      }
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination controls when data exists', async ({ page }) => {
      await page.waitForTimeout(3000);

      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        const paginationSelect = page.locator('select').filter({ hasText: /per page/ });
        await expect(paginationSelect.first()).toBeVisible();
      }
    });
  });
});
