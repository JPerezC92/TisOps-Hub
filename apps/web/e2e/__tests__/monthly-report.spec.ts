import { test, expect } from '@playwright/test';

test.describe('Monthly Report Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/monthly-report');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Monthly Report', exact: true })).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(page.locator('p').getByText('Monthly incident reports and tracking')).toBeVisible();
    });

    test('should display upload section', async ({ page }) => {
      await expect(page.getByText('Upload Monthly Report')).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.getByText('TOTAL RECORDS')).toBeVisible();
    });
  });

  test.describe('Upload Section', () => {
    test('should display upload description', async ({ page }) => {
      await expect(page.getByText(/Upload an Excel file.*XD 2025 DATA INFORME MENSUAL/)).toBeVisible();
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
      await expect(page.getByText('ALTA PRIORITY')).toBeVisible();
      await expect(page.getByText('TOP CATEGORIZATION')).toBeVisible();
      await expect(page.getByText('UNIQUE CATEGORIES')).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('should display search input', async ({ page }) => {
      await expect(page.getByPlaceholder(/Request ID, Application, Technician/)).toBeVisible();
    });

    test('should display categorization filter', async ({ page }) => {
      const catSelect = page.locator('select').filter({ hasText: /All Categories/ });
      await expect(catSelect.first()).toBeVisible();
    });

    test('should display priority filter', async ({ page }) => {
      const prioritySelect = page.locator('select').filter({ hasText: /All Priorities/ });
      await expect(prioritySelect.first()).toBeVisible();
    });
  });

  test.describe('Data Table', () => {
    test('should display table section header', async ({ page }) => {
      await expect(page.getByText('Monthly Report Records')).toBeVisible();
    });

    test('should show loading or content', async ({ page }) => {
      const loadingOrContent = page.locator('text=Loading monthly reports').or(
        page.locator('text=No monthly reports found').or(page.locator('table'))
      );
      await expect(loadingOrContent.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display table headers when data exists', async ({ page }) => {
      await page.waitForTimeout(3000);

      const table = page.locator('table');
      const tableExists = await table.count();

      if (tableExists > 0) {
        await expect(page.locator('th').getByText('Request ID')).toBeVisible();
        await expect(page.locator('th').getByText('Aplicativos')).toBeVisible();
        await expect(page.locator('th').getByText('Categorization')).toBeVisible();
        await expect(page.locator('th').getByText('Status')).toBeVisible();
        await expect(page.locator('th').getByText('Display Status')).toBeVisible();
        await expect(page.locator('th').getByText('Priority')).toBeVisible();
        await expect(page.locator('th').getByText('Technician')).toBeVisible();
        await expect(page.locator('th').getByText('Created Time')).toBeVisible();
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
        await expect(page.getByText('Delete All Monthly Reports')).toBeVisible();
      }
    });

    test('should close confirmation when clicking Cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear data/i });
      const hasClearButton = await clearButton.count();

      if (hasClearButton > 0) {
        await clearButton.click();
        await expect(page.getByText('Delete All Monthly Reports')).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByText('Delete All Monthly Reports')).not.toBeVisible();
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
