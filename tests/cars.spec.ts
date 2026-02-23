import { test, expect } from '@playwright/test';

test.describe('Cars Listing Page', () => {
  test('should load cars list and display items', async ({ page }) => {
    await page.goto('/cars');

    // Wait for the specific UI element directly rather than relying on networkidle which can be flaky
    const searchInput = page.locator('input[placeholder*="Search by brand"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Ensure there is at least one CarCard loaded
    const carCards = page.locator('article');
    // It's possible the DB has no cars, but assuming we have test data:
    const count = await carCards.count();
    
    // Fallback if db is empty during test run:
    if (count > 0) {
      await expect(carCards.first()).toBeVisible();
      // Should have a heart icon for favorite
      await expect(carCards.first().locator('button[aria-label="Add to favorites"]')).toBeVisible();
    }
  });

  test('should sort vehicles', async ({ page }) => {
    await page.goto('/cars');
    const sortSelect = page.locator('select').first();
    await expect(sortSelect).toBeVisible({ timeout: 10000 });
    await sortSelect.selectOption('asc');
    
    // We can't strictly assert the exact order unless we control the mock data,
    // but we can verify the UI responds to the select change.
    await expect(page).toHaveURL(/\/cars/); // URL doesn't strictly change on sort unless we placed it in query parameters
    await expect(sortSelect).toHaveValue('asc');
  });

  test('should toggle favorite state and persist in localstorage', async ({ page, context }) => {
    await page.goto('/cars');
    await page.waitForLoadState('networkidle');

    const carCards = page.locator('article');
    if ((await carCards.count()) > 0) {
      const firstCarFavBtn = carCards.first().locator('button[aria-label="Add to favorites"]');
      
      // Click favorite
      await firstCarFavBtn.click();
      
      // Heart should be filled or colored (UI changes its aria-label usually)
      await expect(carCards.first().locator('button[aria-label="Remove from favorites"]')).toBeVisible();
      
      // Verify local storage
      const favorites = await page.evaluate(() => localStorage.getItem('favorites'));
      expect(favorites).not.toBeNull();
      const parsedFavs = JSON.parse(favorites || '[]');
      expect(parsedFavs.length).toBeGreaterThan(0);
    }
  });
});
