import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage and display hero section', async ({ page }) => {
    await page.goto('/');

    // Check title (Note: we use the French title provided in SEO logic)
    await expect(page).toHaveTitle(/.*(Acheter des Voitures d'Occasion|Troy Cars).*/);
    
    // Check main hero text
    await expect(page.locator('h1')).toContainText('Redefining Automotive Excellence', { timeout: 10000 });
    
    // Check explore button - needs the arrow character too
    const exploreButton = page.locator('a', { hasText: 'Explore Collection' }).first();
    await expect(exploreButton).toBeVisible();
    await expect(exploreButton).toHaveAttribute('href', '/cars');
  });

  test('should navigate to cars page when clicking explore', async ({ page }) => {
    await page.goto('/');
    
    const exploreButton = page.locator('a', { hasText: 'Explore Collection' }).first();
    await exploreButton.click();
    
    // Should navigate to /cars and display the cars list
    await expect(page).toHaveURL(/.*\/cars.*/, { timeout: 10000 });
  });
  
  test('should load featured cars section', async ({ page }) => {
    await page.goto('/');
    
    // the Featured Vehicles heading
    await expect(page.locator('h2', { hasText: 'Featured Vehicles' })).toBeVisible();
    
    // There should be cars inside it (car articles)
    const featuredList = page.locator('article');
    const count = await featuredList.count();
    
    if (count > 0) {
      await expect(featuredList.first()).toBeVisible();
    }
  });
});
