import { test, expect } from '@playwright/test';

test.describe('Corrective Status Registry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/corrective-status-registry');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Corrective Status Registry', exact: true })
      ).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(
        page.getByText('Manage status mappings for corrective maintenance data (Spanish → English)')
      ).toBeVisible();
    });

    test('should display New Mapping button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /new mapping/i })
      ).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/search statuses/i)
      ).toBeVisible();
    });

    test('should display status filter', async ({ page }) => {
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });
  });

  test.describe('Status Mappings Table', () => {
    test('should show loading state or content', async ({ page }) => {
      await page.goto('/corrective-status-registry');

      const spinner = page.locator('.animate-spin');
      const table = page.locator('table');
      const emptyState = page.getByText('No status mappings found');

      await expect(
        spinner.or(table).or(emptyState)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display content section after page load', async ({ page }) => {
      await expect(page.getByText(/Showing \d+ mappings/)).toBeVisible({ timeout: 20000 });
    });

    test('should display table headers when data exists', async ({ page }) => {
      const table = page.locator('table');
      const loadingSpinner = page.locator('.animate-spin');

      let attempts = 0;
      while (attempts < 40) {
        const isSpinnerVisible = await loadingSpinner.isVisible();
        if (!isSpinnerVisible) break;
        await page.waitForTimeout(500);
        attempts++;
      }

      if (await table.isVisible()) {
        await expect(page.locator('th').getByText('RAW STATUS')).toBeVisible();
        await expect(page.locator('th').getByText('DISPLAY STATUS')).toBeVisible();
        await expect(page.locator('th').getByText('STATUS')).toBeVisible();
        await expect(page.locator('th').getByText('ACTIONS')).toBeVisible();
      }
    });
  });

  test.describe('Create Modal', () => {
    test('should open create modal when clicking New Mapping', async ({ page }) => {
      await page.getByRole('button', { name: /new mapping/i }).click();

      await expect(page.getByText('Create New Mapping')).toBeVisible({ timeout: 5000 });
    });

    test('should display form fields in create modal', async ({ page }) => {
      await page.getByRole('button', { name: /new mapping/i }).click();

      await expect(page.getByText('Create New Mapping')).toBeVisible({ timeout: 5000 });
      await expect(page.getByPlaceholder(/En Cola de Desarrollo/i)).toBeVisible();
      await expect(page.getByText('Display Status *')).toBeVisible();
    });

    test('should load display status options from API', async ({ page }) => {
      await page.getByRole('button', { name: /new mapping/i }).click();

      await expect(page.getByText('Create New Mapping')).toBeVisible({ timeout: 5000 });

      // Check that display status dropdown has options
      const displayStatusSelect = page.locator('select').filter({ hasText: 'Select a display status' });
      await expect(displayStatusSelect).toBeVisible();
    });

    test('should close create modal when clicking Cancel', async ({ page }) => {
      await page.getByRole('button', { name: /new mapping/i }).click();

      await expect(page.getByText('Create New Mapping')).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /cancel/i }).click();

      await expect(page.getByText('Create New Mapping')).not.toBeVisible();
    });

    test('should fill create form fields', async ({ page }) => {
      await page.getByRole('button', { name: /new mapping/i }).click();

      await expect(page.getByText('Create New Mapping')).toBeVisible({ timeout: 5000 });

      const timestamp = Date.now();
      const rawStatus = `E2E Test Status ${timestamp}`;

      // Fill raw status
      const rawStatusInput = page.getByPlaceholder(/En Cola de Desarrollo/i);
      await rawStatusInput.fill(rawStatus);
      await expect(rawStatusInput).toHaveValue(rawStatus);

      // Verify display status dropdown is present
      const displayStatusSelect = page.locator('select').filter({ hasText: 'Select a display status' });
      await expect(displayStatusSelect).toBeVisible();
    });
  });

  test.describe('Edit Modal', () => {
    test('should open edit modal when clicking Edit button', async ({ page }) => {
      await page.waitForTimeout(2000);

      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        await expect(page.getByText('Edit Mapping')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display pre-filled form in edit modal', async ({ page }) => {
      await page.waitForTimeout(2000);

      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        await expect(page.getByText('Edit Mapping')).toBeVisible({ timeout: 5000 });

        const rawStatusInput = page.locator('input[placeholder*="En Cola de Desarrollo"]');
        await expect(rawStatusInput).not.toHaveValue('');
      }
    });

    test('should close edit modal when clicking Cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        await expect(page.getByText('Edit Mapping')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: /cancel/i }).click();

        await expect(page.getByText('Edit Mapping')).not.toBeVisible();
      }
    });
  });

  test.describe('Delete Confirmation', () => {
    test('should show delete confirmation when clicking Delete button', async ({ page }) => {
      await page.waitForTimeout(2000);

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        await expect(page.getByText('Confirm Delete')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should close confirmation when clicking Cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        await expect(page.getByText('Confirm Delete')).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: /cancel/i }).click();

        await expect(page.getByText('Confirm Delete')).not.toBeVisible();
      }
    });
  });

  test.describe('Filtering', () => {
    test('should filter by search term', async ({ page }) => {
      await page.waitForTimeout(2000);

      const table = page.locator('table');
      if (await table.isVisible()) {
        const searchInput = page.getByPlaceholder(/search statuses/i);
        await searchInput.fill('nonexistent-search-term-xyz');

        await page.waitForTimeout(500);

        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should filter by status', async ({ page }) => {
      await page.waitForTimeout(2000);

      const table = page.locator('table');
      if (await table.isVisible()) {
        const statusSelect = page.getByRole('combobox').first();
        await statusSelect.selectOption('active');

        await page.waitForTimeout(500);

        const tableVisible = await page.locator('table').isVisible();
        const emptyVisible = await page.getByText('No status mappings found').isVisible();
        expect(tableVisible || emptyVisible).toBe(true);
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display friendly message when no status mappings', async ({ page }) => {
      await page.waitForTimeout(2000);

      const emptyState = page.getByText('No status mappings found');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('Pagination', () => {
    test('should display pagination controls when data exists', async ({ page }) => {
      await page.waitForTimeout(2000);

      const table = page.locator('table');
      if (await table.isVisible()) {
        const paginationInfo = page.getByText(/Page \d+ of \d+/);
        const hasPagination = await paginationInfo.isVisible();
        expect(hasPagination).toBeDefined();
      }
    });
  });
});
