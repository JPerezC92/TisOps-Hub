import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  let pageErrors: string[];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });
    await page.goto('/analytics-dashboard');
  });

  test.afterEach(async () => {
    expect(pageErrors, `Uncaught exceptions detected:\n${pageErrors.join('\n')}`).toHaveLength(0);
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Analytics Dashboard' })).toBeVisible();
    });

    test('should display description text', async ({ page }) => {
      await expect(page.locator('p').getByText('War Rooms analytics and incident tracking')).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('should display application filter label', async ({ page }) => {
      await expect(page.getByText('Application', { exact: true })).toBeVisible();
    });

    test('should display month filter label', async ({ page }) => {
      await expect(page.getByText('Month', { exact: true })).toBeVisible();
    });

    test('should load applications into the dropdown', async ({ page }) => {
      // Wait for the API call to complete
      await page.waitForTimeout(2000);

      // Open the application dropdown
      await page.getByRole('combobox').first().click();

      // "All Applications" is the default option, always present
      await expect(page.getByRole('option', { name: 'All Applications' })).toBeVisible();

      // Verify that application options loaded from the backend exist
      // (more than just the default "All Applications" option)
      const options = page.getByRole('option');
      const count = await options.count();
      expect(count, 'Application dropdown should have options loaded from backend').toBeGreaterThan(1);
    });
  });
});
