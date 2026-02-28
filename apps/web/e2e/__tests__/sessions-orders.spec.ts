import { test, expect } from '@playwright/test';

test.describe('Sessions & Orders Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sessions-orders');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Sessions & Orders', exact: true })).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(page.locator('p').getByText('View incidents, sessions, orders, and release data')).toBeVisible();
    });

    test('should display upload section', async ({ page }) => {
      await expect(page.getByText('Upload Sessions & Orders Report')).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.getByText('TOTAL RECORDS')).toBeVisible();
    });
  });

  test.describe('Upload Section', () => {
    test('should display upload description', async ({ page }) => {
      await expect(page.getByText(/Upload an Excel file.*SB INCIDENTES ORDENES SESIONES/)).toBeVisible();
    });

    test('should have file input', async ({ page }) => {
      await expect(page.locator('input[type="file"]')).toBeAttached();
    });

    test('should have upload button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /upload/i })).toBeVisible();
    });
  });

  test.describe('Tabs', () => {
    test('should display Sessions & Orders tab', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Sessions & Orders' })).toBeVisible();
    });

    test('should display Releases tab', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Releases' })).toBeVisible();
    });

    test('should switch to releases tab', async ({ page }) => {
      await page.getByRole('tab', { name: 'Releases' }).click();
      await expect(page.getByText('TOTAL RELEASES')).toBeVisible();
    });
  });

  test.describe('Stats Grid', () => {
    test('should have refresh button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
    });

    test('should display sessions stats', async ({ page }) => {
      await expect(page.getByText('TOTAL RECORDS')).toBeVisible();
      await expect(page.getByText('TOTAL INCIDENTS')).toBeVisible();
      await expect(page.getByText('TOTAL PLACED ORDERS')).toBeVisible();
      await expect(page.getByText('TOTAL BILLED ORDERS')).toBeVisible();
    });

    test('should display releases stats on releases tab', async ({ page }) => {
      await page.getByRole('tab', { name: 'Releases' }).click();
      await expect(page.getByText('TOTAL RELEASES')).toBeVisible();
      await expect(page.getByText('SB RELEASES')).toBeVisible();
      await expect(page.getByText('FFVV RELEASES')).toBeVisible();
      await expect(page.getByText('AVG TICKETS/RELEASE')).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('should display search input', async ({ page }) => {
      await expect(page.getByPlaceholder('Year, Month, Day...')).toBeVisible();
    });

    test('should display year filter', async ({ page }) => {
      const yearSelect = page.locator('select').filter({ hasText: /All Years/ });
      await expect(yearSelect.first()).toBeVisible();
    });

    test('should display month filter', async ({ page }) => {
      const monthSelect = page.locator('select').filter({ hasText: /All Months/ });
      await expect(monthSelect.first()).toBeVisible();
    });
  });

  test.describe('Data Table', () => {
    test('should display table section header', async ({ page }) => {
      await expect(page.getByText('Sessions & Orders Records')).toBeVisible();
    });

    test('should show loading or content', async ({ page }) => {
      const loadingOrContent = page.locator('text=Loading sessions & orders').or(
        page.locator('text=No sessions & orders found').or(page.locator('table'))
      );
      await expect(loadingOrContent.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display table headers when data exists', async ({ page }) => {
      await page.waitForTimeout(3000);

      const table = page.locator('table');
      const tableExists = await table.count();

      if (tableExists > 0) {
        await expect(page.locator('th').getByText('Year')).toBeVisible();
        await expect(page.locator('th').getByText('Month')).toBeVisible();
        await expect(page.locator('th').getByText('Day')).toBeVisible();
        await expect(page.locator('th').getByText('Incidents')).toBeVisible();
        await expect(page.locator('th').getByText('Placed Orders')).toBeVisible();
        await expect(page.locator('th').getByText('Billed Orders')).toBeVisible();
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
        await expect(page.getByText('Delete All Sessions & Orders Records')).toBeVisible();
      }
    });

    test('should close confirmation when clicking Cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear data/i });
      const hasClearButton = await clearButton.count();

      if (hasClearButton > 0) {
        await clearButton.click();
        await expect(page.getByText('Delete All Sessions & Orders Records')).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByText('Delete All Sessions & Orders Records')).not.toBeVisible();
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
