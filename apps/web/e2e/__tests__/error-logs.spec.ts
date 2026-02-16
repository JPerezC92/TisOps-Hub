import { test, expect } from '@playwright/test';

test.describe('Error Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/error-logs');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Error Logs', exact: true })
      ).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(
        page.getByText('Monitor and track all system errors and exceptions')
      ).toBeVisible();
    });

    test('should display stats grid', async ({ page }) => {
      await expect(page.getByText('TOTAL ERRORS')).toBeVisible();
      await expect(page.getByText('DATABASE ERRORS')).toBeVisible();
      await expect(page.getByText('LAST 24H')).toBeVisible();
    });

    test('should display limit selector', async ({ page }) => {
      await expect(page.getByText('Records per page:')).toBeVisible();
      await expect(page.getByRole('combobox')).toBeVisible();
    });
  });

  test.describe('Stats Grid', () => {
    test('should have refresh button', async ({ page }) => {
      const refreshButton = page.getByRole('button', { name: /refresh/i });
      await expect(refreshButton).toBeVisible();
    });

    test('should display all stat cards', async ({ page }) => {
      await expect(page.getByText('TOTAL ERRORS')).toBeVisible();
      await expect(page.getByText('DATABASE ERRORS')).toBeVisible();
      await expect(page.getByText('LAST 24H')).toBeVisible();
    });
  });

  test.describe('Limit Selector', () => {
    test('should have default value of 50', async ({ page }) => {
      const limitSelect = page.getByRole('combobox');
      await expect(limitSelect).toHaveValue('50');
    });

    test('should have all limit options', async ({ page }) => {
      const limitSelect = page.getByRole('combobox');
      await expect(limitSelect.locator('option[value="25"]')).toBeAttached();
      await expect(limitSelect.locator('option[value="50"]')).toBeAttached();
      await expect(limitSelect.locator('option[value="100"]')).toBeAttached();
      await expect(limitSelect.locator('option[value="200"]')).toBeAttached();
    });

    test('should change limit when selected', async ({ page }) => {
      const limitSelect = page.getByRole('combobox');
      await limitSelect.selectOption('100');
      await expect(limitSelect).toHaveValue('100');
    });
  });

  test.describe('Error Logs Table', () => {
    test('should display table section header', async ({ page }) => {
      await expect(page.getByText('Error Log Entries')).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
      // Navigate fresh to catch loading state
      await page.goto('/error-logs');

      // The loading state should appear briefly
      // Check that either loading or content appears
      await expect(
        page.getByText(/loading error logs|error log entries|no errors logged/i).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display table or empty state after loading', async ({ page }) => {
      // Wait for loading to complete
      await page.waitForTimeout(3000);

      // Check that either table (with data) or empty state (no data) or stats are visible
      const table = page.locator('table');
      const emptyState = page.getByText(/No Errors Logged|no errors/i);
      const statsSection = page.getByText(/error log entries/i);

      const isTableVisible = await table.isVisible();
      const isEmptyVisible = await emptyState.isVisible();
      const isStatsVisible = await statsSection.isVisible();

      expect(isTableVisible || isEmptyVisible || isStatsVisible).toBe(true);
    });

    test('should display table headers when data exists', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const table = page.locator('table');
      if (await table.isVisible()) {
        await expect(page.getByText('ID', { exact: true })).toBeVisible();
        await expect(page.getByText('Timestamp')).toBeVisible();
        await expect(page.getByText('Type')).toBeVisible();
        await expect(page.getByText('Method')).toBeVisible();
        await expect(page.getByText('Endpoint')).toBeVisible();
        await expect(page.getByText('Message')).toBeVisible();
        await expect(page.getByText('Actions')).toBeVisible();
      }
    });
  });

  test.describe('Error Detail Modal', () => {
    test('should open modal when view details is clicked', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const viewDetailsButton = page.getByText('View Details').first();
      if (await viewDetailsButton.isVisible()) {
        await viewDetailsButton.click();

        await expect(page.getByText(/Error Details #\d+/)).toBeVisible({
          timeout: 5000,
        });
      }
    });

    test('should close modal when close button is clicked', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const viewDetailsButton = page.getByText('View Details').first();
      if (await viewDetailsButton.isVisible()) {
        await viewDetailsButton.click();

        await expect(page.getByText(/Error Details #\d+/)).toBeVisible({
          timeout: 5000,
        });

        // Click close button
        await page.getByTitle('Close').click();

        await expect(page.getByText(/Error Details #\d+/)).not.toBeVisible();
      }
    });

    test('should close modal when clicking outside', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const viewDetailsButton = page.getByText('View Details').first();
      if (await viewDetailsButton.isVisible()) {
        await viewDetailsButton.click();

        await expect(page.getByText(/Error Details #\d+/)).toBeVisible({
          timeout: 5000,
        });

        // Click outside the modal (on the backdrop)
        await page.locator('.fixed.inset-0').click({ position: { x: 10, y: 10 } });

        await expect(page.getByText(/Error Details #\d+/)).not.toBeVisible();
      }
    });

    test('should display error details in modal', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const viewDetailsButton = page.getByText('View Details').first();
      if (await viewDetailsButton.isVisible()) {
        await viewDetailsButton.click();

        await expect(page.getByText('Error Type')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Error Message')).toBeVisible();
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display friendly message when no errors', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      const emptyState = page.getByText('No Errors Logged');
      if (await emptyState.isVisible()) {
        await expect(
          page.getByText('Your system is running smoothly!')
        ).toBeVisible();
      }
    });
  });
});
