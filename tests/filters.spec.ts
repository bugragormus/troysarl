import { test, expect } from '@playwright/test';

test.describe('Advanced Filtering and Searching', () => {

  test.beforeEach(async ({ page }) => {
    // Go to cars listing before each test
    await page.goto('/cars');
    // Ensure the page has hydrated and search input is visible
    const searchInput = page.locator('input[placeholder*="Search by brand"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should filter cars by brand searching', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search by brand"]');
    
    // Type a specific brand known to exist (e.g. BMW or Porsche from our mock DB)
    await searchInput.fill('BMW');
    
    // We expect the list to update. Wait a moment for state changes
    await page.waitForTimeout(500); 

    // Every visible car card should contain BMW somewhere (in the title)
    const carCards = page.locator('article');
    const count = await carCards.count();
    
    // Check if we actually have BMWs on the server before asserting strict string matching
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await carCards.nth(i).textContent();
        expect(text?.toLowerCase()).toContain('bmw');
      }
    }
  });

  test('should clear filters via clear button', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search by brand"]');
    await searchInput.fill('Mercedes');
    
    // Select manual transmission
    const transmissionSelect = page.locator('select').nth(1);
    await transmissionSelect.selectOption('manual');
    
    await page.waitForTimeout(500); // Wait for React hydration
    
    // Find the Clear Filters button and click it
    const clearButton = page.locator('button', { hasText: 'Clear' }).first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    
    // Ensure the input was cleared
    await expect(searchInput).toHaveValue('');
    // Ensure select returned to "All Transmissions" (empty value string)
    await expect(transmissionSelect).toHaveValue('');
  });

  test('should render zero states when no cars match criteria', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search by brand"]');
    // Deliberately search for gibberish
    await searchInput.fill('XXXYYYZZZ');
    
    await page.waitForTimeout(500);
    
    // Check for the "No cars found" message
    const noResultsMessage = page.locator('text="No cars found matching your criteria"');
    await expect(noResultsMessage).toBeVisible();
    
    // Should display the "Clear all filters" suggestion button
    const suggestionBtn = page.locator('button', { hasText: 'Clear all filters' });
    await expect(suggestionBtn).toBeVisible();
  });
});
