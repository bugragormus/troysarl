import { test, expect } from '@playwright/test';

test.describe('Car Details Page & Journey', () => {

  test('should navigate to details from listing and run carousel', async ({ page }) => {
    // Start at listings page
    await page.goto('/cars');

    // Wait for the specific UI element 
    const searchInput = page.locator('input[placeholder*="Search by brand"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Make sure cars are loaded and click the first valid view link
    const firstCar = page.locator('a[href^="/cars/"]').first();
    await expect(firstCar).toBeVisible({ timeout: 10000 });

    // Click the car link
    await firstCar.click();

    // Ensure we travelled to a detail route
    await expect(page).toHaveURL(/\/cars\/[^/]+/);

    // Wait for the main heading (car brand + model) to appear
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Test carousel interactions if carousel is present
    const carouselContainer = page.locator('.carousel');
    const isCarouselPresent = await carouselContainer.count() > 0;
    
    if (isCarouselPresent) {
      // Find the next arrow and click it
      const nextButton = page.locator('.control-next.control-arrow');
      if (await nextButton.isVisible()) {
         await nextButton.click();
      }
    }
  });

  test('should open contact form modal on clicking request quote', async ({ page }) => {
    // Navigating directly to a likely existing car route, or via home > cars > first. 
    // Best practice since we have dynamic IDs is to go through list:
    await page.goto('/cars');
    await expect(page.locator('input[placeholder*="Search by brand"]')).toBeVisible({ timeout: 10000 });
    
    const firstCar = page.locator('a[href^="/cars/"]').first();
    await expect(firstCar).toBeVisible({ timeout: 10000 });
    await firstCar.click();

    // Detail page loaded. Wait for the Request button
    const requestBtn = page.locator('button', { hasText: /Request/i }).first();
    await expect(requestBtn).toBeVisible({ timeout: 10000 });

    // Open modal
    await requestBtn.click();

    // Modal dialog should appear
    const modalDialog = page.locator('[role="dialog"]');
    await expect(modalDialog).toBeVisible();
    
    // Form inside modal
    const formNameInput = modalDialog.locator('input[type="text"]').first();
    await expect(formNameInput).toBeVisible();
    
    // Close modal via close button (usually an X icon inside the dialog)
    // Finding it by trying to locate a standard close button
    const closeBtn = modalDialog.locator('button', { hasText: 'Close' });
    if (await closeBtn.isVisible()) {
       await closeBtn.click();
       await expect(modalDialog).not.toBeVisible();
    }
  });
});
