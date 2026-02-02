/**
 * Matter Management E2E Tests (Playwright)
 *
 * Tests the complete matter management workflow:
 * - Creating new matters
 * - Viewing matter list
 * - Viewing matter details
 * - Editing matters
 * - Searching/filtering
 */

import { test, expect } from '@playwright/test';

test.describe('Matter Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('correct-password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display matters list', async ({ page }) => {
    await page.goto('/matters');

    await expect(page.getByRole('heading', { name: /matters/i })).toBeVisible();
    await expect(page.getByText(/2026-00001/)).toBeVisible();
    await expect(page.getByText(/123 Oak Street Purchase/)).toBeVisible();
  });

  test('should create new matter', async ({ page }) => {
    await page.goto('/matters');

    // Click New Matter button
    await page.getByRole('button', { name: /new matter/i }).click();

    // Fill in the form
    await page.getByLabel(/title/i).fill('456 Pine Avenue Purchase');
    await page.getByLabel(/transaction type/i).selectOption('PURCHASE');
    await page.getByLabel(/property type/i).selectOption('SINGLE_FAMILY');
    await page.getByLabel(/property address/i).fill('456 Pine Avenue, Test City, TS 12345');
    await page.getByLabel(/purchase price/i).fill('500000');
    await page.getByLabel(/closing date/i).fill('2026-05-01');

    // Submit form
    await page.getByRole('button', { name: /create matter/i }).click();

    // Should redirect to matter detail page
    await expect(page).toHaveURL(/\/matters\/[\w-]+/);
    await expect(page.getByText('456 Pine Avenue Purchase')).toBeVisible();
    await expect(page.getByText(/matter created successfully/i)).toBeVisible();
  });

  test('should validate required fields when creating matter', async ({ page }) => {
    await page.goto('/matters/new');

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create matter/i }).click();

    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/transaction type is required/i)).toBeVisible();
    await expect(page.getByText(/property address is required/i)).toBeVisible();
  });

  test('should view matter details', async ({ page }) => {
    await page.goto('/matters');

    // Click on a matter
    await page.getByText('123 Oak Street Purchase').click();

    // Should show matter details
    await expect(page).toHaveURL(/\/matters\/matter-1/);
    await expect(page.getByText('2026-00001')).toBeVisible();
    await expect(page.getByText('ACTIVE')).toBeVisible();
    await expect(page.getByText(/\$425,000/)).toBeVisible();
    await expect(page.getByText('123 Oak Street, Springfield, IL 62701')).toBeVisible();
  });

  test('should edit matter', async ({ page }) => {
    await page.goto('/matters/matter-1');

    // Click Edit button
    await page.getByRole('button', { name: /edit/i }).click();

    // Update title
    const titleInput = page.getByLabel(/title/i);
    await titleInput.clear();
    await titleInput.fill('123 Oak Street - Updated');

    // Save changes
    await page.getByRole('button', { name: /save/i }).click();

    // Should show success message
    await expect(page.getByText(/matter updated successfully/i)).toBeVisible();
    await expect(page.getByText('123 Oak Street - Updated')).toBeVisible();
  });

  test('should filter matters by status', async ({ page }) => {
    await page.goto('/matters');

    // Select ACTIVE filter
    await page.getByLabel(/status/i).selectOption('ACTIVE');

    // Should only show active matters
    await expect(page.getByText('123 Oak Street Purchase')).toBeVisible();
    // Pending matter should not be visible
    await expect(page.getByText('456 Maple Avenue Sale')).not.toBeVisible();
  });

  test('should search matters', async ({ page }) => {
    await page.goto('/matters');

    // Search for specific matter
    await page.getByPlaceholder(/search matters/i).fill('Oak Street');

    // Should show matching results
    await expect(page.getByText('123 Oak Street Purchase')).toBeVisible();
    await expect(page.getByText('456 Maple Avenue Sale')).not.toBeVisible();
  });

  test('should sort matters by different columns', async ({ page }) => {
    await page.goto('/matters');

    // Click on Matter Number header to sort
    await page.getByRole('columnheader', { name: /matter number/i }).click();

    // Verify order (ascending)
    const firstMatter = page.locator('[data-testid^="matter-card-"]').first();
    await expect(firstMatter.getByText(/2026-00001/)).toBeVisible();

    // Click again for descending
    await page.getByRole('columnheader', { name: /matter number/i }).click();

    // Should be reversed
    const lastMatter = page.locator('[data-testid^="matter-card-"]').first();
    await expect(lastMatter.getByText(/2026-00002/)).toBeVisible();
  });

  test('should delete matter with confirmation', async ({ page }) => {
    await page.goto('/matters/matter-1');

    // Click Delete button
    await page.getByRole('button', { name: /delete/i }).click();

    // Should show confirmation dialog
    await expect(page.getByText(/are you sure/i)).toBeVisible();

    // Cancel first
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page).toHaveURL(/\/matters\/matter-1/);

    // Try again and confirm
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: /confirm|yes/i }).click();

    // Should redirect to matters list
    await expect(page).toHaveURL('/matters');
    await expect(page.getByText(/matter deleted successfully/i)).toBeVisible();
  });

  test('should paginate through matters list', async ({ page }) => {
    await page.goto('/matters');

    // Assuming there are multiple pages
    const nextButton = page.getByRole('button', { name: /next/i });

    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/matters');

    await page.getByPlaceholder(/search matters/i).fill('NonExistentMatter123');

    await expect(page.getByText(/no matters found/i)).toBeVisible();
  });

  test('should show matter tabs for documents and timeline', async ({ page }) => {
    await page.goto('/matters/matter-1');

    // Check for tabs
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /documents/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /timeline/i })).toBeVisible();

    // Click Documents tab
    await page.getByRole('tab', { name: /documents/i }).click();
    await expect(page.getByText(/documents/i)).toBeVisible();

    // Click Timeline tab
    await page.getByRole('tab', { name: /timeline/i }).click();
    await expect(page.getByText(/timeline|activity/i)).toBeVisible();
  });

  test('should be accessible via keyboard', async ({ page }) => {
    await page.goto('/matters');

    // Tab to first matter card
    await page.keyboard.press('Tab');
    const firstCard = page.locator('[data-testid^="matter-card-"]').first();
    await expect(firstCard).toBeFocused();

    // Press Enter to view details
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/matters\/matter-/);
  });
});
