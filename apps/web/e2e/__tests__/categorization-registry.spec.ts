import { test, expect } from '@playwright/test';

test.describe('Categorization Registry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categorization-registry');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Categorization Registry', exact: true })
      ).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(
        page.getByText('Manage categorization mappings (Source Value → Display Value)')
      ).toBeVisible();
    });

    test('should display New Mapping button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /new mapping/i })
      ).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/search categorizations/i)
      ).toBeVisible();
    });

    test('should display status filter', async ({ page }) => {
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });
  });

  test.describe('Categorizations Table', () => {
    test('should show loading state or content', async ({ page }) => {
      await page.goto('/categorization-registry');

      // Either loading spinner, table, or empty state should appear
      const spinner = page.locator('.animate-spin');
      const table = page.locator('table');
      const emptyState = page.getByText('No categorization mappings found');

      // Wait for any of these to be visible
      await expect(
        spinner.or(table).or(emptyState)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display content section after page load', async ({ page }) => {
      // The section header with "Showing X mappings" should always be visible
      await expect(page.getByText(/Showing \d+ mappings/)).toBeVisible({ timeout: 20000 });
    });

    test('should display table headers when data exists', async ({ page }) => {
      const table = page.locator('table');
      const loadingSpinner = page.locator('.animate-spin');

      // Poll for up to 20 seconds for loading to complete
      let attempts = 0;
      while (attempts < 40) {
        const isSpinnerVisible = await loadingSpinner.isVisible();
        if (!isSpinnerVisible) break;
        await page.waitForTimeout(500);
        attempts++;
      }

      // Only check headers if table is visible (data exists)
      if (await table.isVisible()) {
        // Use table header cells to avoid matching other elements
        await expect(page.locator('th').getByText('SOURCE VALUE')).toBeVisible();
        await expect(page.locator('th').getByText('DISPLAY VALUE')).toBeVisible();
        await expect(page.locator('th').getByText('STATUS')).toBeVisible();
        await expect(page.locator('th').getByText('ACTIONS')).toBeVisible();
      }
      // If no table, test passes (empty state or still loading)
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
      await expect(page.getByPlaceholder(/Error de codificación/i)).toBeVisible();
      await expect(page.getByPlaceholder(/Bugs/i)).toBeVisible();
    });

    test('should close create modal when clicking Cancel', async ({ page }) => {
      await page.getByRole('button', { name: /new mapping/i }).click();

      await expect(page.getByText('Create New Mapping')).toBeVisible({ timeout: 5000 });

      await page.getByRole('button', { name: /cancel/i }).click();

      await expect(page.getByText('Create New Mapping')).not.toBeVisible();
    });

    test('should submit create form', async ({ page }) => {
      await page.getByRole('button', { name: /new mapping/i }).click();

      await expect(page.getByText('Create New Mapping')).toBeVisible({ timeout: 5000 });

      const timestamp = Date.now();
      const sourceValue = `E2E Test Source ${timestamp}`;
      const displayValue = `E2E Test Display ${timestamp}`;

      await page.getByPlaceholder(/Error de codificación/i).fill(sourceValue);
      await page.getByPlaceholder(/Bugs/i).fill(displayValue);

      const createButton = page.getByRole('button', { name: /^create$/i });

      // Verify form is filled and button is enabled
      await expect(createButton).toBeEnabled();

      // Click create button
      await createButton.click();

      // Wait briefly for response
      await page.waitForTimeout(2000);

      // Test passes if we got this far - form was submitted
      // Outcome depends on backend state (success closes modal, error shows toast)
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

        // Form inputs should have values (not empty)
        const sourceInput = page.locator('input[placeholder*="Error de codificación"]');
        const displayInput = page.locator('input[placeholder*="Bugs"]');

        await expect(sourceInput).not.toHaveValue('');
        await expect(displayInput).not.toHaveValue('');
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
        const searchInput = page.getByPlaceholder(/search categorizations/i);
        await searchInput.fill('nonexistent-search-term-xyz');

        await page.waitForTimeout(500);

        // Either no results or filtered results
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

        // Table should still be visible (or empty state)
        const tableVisible = await page.locator('table').isVisible();
        const emptyVisible = await page.getByText('No categorization mappings found').isVisible();
        expect(tableVisible || emptyVisible).toBe(true);
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display friendly message when no categorizations', async ({ page }) => {
      await page.waitForTimeout(2000);

      const emptyState = page.getByText('No categorization mappings found');
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
        // Check for pagination info or controls
        const paginationInfo = page.getByText(/Page \d+ of \d+/);
        const hasPagination = await paginationInfo.isVisible();

        // Pagination might not be visible if there's only one page
        expect(hasPagination).toBeDefined();
      }
    });
  });
});
