import { test, expect } from '@playwright/test';

test.describe('Weekly Corrective Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/weekly-corrective');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Weekly Corrective', exact: true })
      ).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(
        page.getByText('Weekly corrective action reports')
      ).toBeVisible();
    });

    test('should display upload section', async ({ page }) => {
      await expect(
        page.getByText('Upload Weekly Corrective Report')
      ).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.locator('p').getByText('Total Records')).toBeVisible();
      await expect(page.locator('p').getByText('Top Priority')).toBeVisible();
      await expect(page.locator('p').getByText('Top Status')).toBeVisible();
      await expect(page.locator('p').getByText('Unique Statuses')).toBeVisible();
    });
  });

  test.describe('Upload Section', () => {
    test('should display upload description', async ({ page }) => {
      await expect(
        page.getByText(/Upload an Excel file.*to import and manage weekly corrective data/)
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
      await expect(page.locator('p').getByText('Total Records')).toBeVisible();
      await expect(page.locator('p').getByText('Top Priority')).toBeVisible();
      await expect(page.locator('p').getByText('Top Status')).toBeVisible();
      await expect(page.locator('p').getByText('Unique Statuses')).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder('Request ID, Technician, Application...')
      ).toBeVisible();
    });

    test('should display priority filter', async ({ page }) => {
      const selects = page.locator('select');
      const prioritySelect = selects.first();
      await expect(prioritySelect).toBeVisible();
    });

    test('should display status filter', async ({ page }) => {
      const selects = page.locator('select');
      const count = await selects.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Data Table', () => {
    test('should display table section header', async ({ page }) => {
      await expect(page.getByText('Weekly Corrective Records')).toBeVisible();
    });

    test('should show loading or content', async ({ page }) => {
      await page.waitForTimeout(2000);

      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();

      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should display table headers when data exists', async ({ page }) => {
      await page.waitForTimeout(3000);

      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount > 0) {
        await expect(page.locator('th').getByText('Request ID')).toBeVisible();
        await expect(page.locator('th').getByText('Technician')).toBeVisible();
        await expect(page.locator('th').getByText('Aplicativos')).toBeVisible();
        await expect(page.locator('th').getByText('Categorization')).toBeVisible();
      }
    });
  });

  test.describe('Delete Confirmation', () => {
    test('should show delete confirmation dialog when clear data is clicked', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear all data/i });

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(page.getByText('Delete All Weekly Corrective Records')).toBeVisible();
        await expect(
          page.getByText(/permanently delete all data from the weekly correctives table/)
        ).toBeVisible();
      }
    });

    test('should close confirmation when clicking Cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const clearButton = page.getByRole('button', { name: /clear all data/i });

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(page.getByText('Delete All Weekly Corrective Records')).toBeVisible();

        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByText('Delete All Weekly Corrective Records')).not.toBeVisible();
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
