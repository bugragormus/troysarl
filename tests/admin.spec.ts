import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Authentication', () => {

  test('should display login form for unauthenticated users', async ({ page }) => {
    // Navigate to the correct login route
    await page.goto('/admin-login');

    // Expected to see the Admin Login header or form
    const loginHeading = page.locator('h1', { hasText: /Admin Access/i });
    await expect(loginHeading).toBeVisible({ timeout: 10000 });

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });

  test('should show error for incorrect password', async ({ page }) => {
    await page.goto('/admin-login');
    
    // Fill with wrong password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill('wrongpassword123');
    
    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    // Toast error or text error should appear 
    const errorMessage = page.locator('text=/Incorrect password!/i');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  // Note: We bypass testing the exact "correct" password scenario here in standard E2E 
  // because hardcoding the admin password in the test suite is a security risk. 
  // We verified the UI rendering and the error handling correctly.
});
