import { test, expect } from '@playwright/test';

/**
 * FULL STACK INTEGRATION TEST
 * This test communicates with the REAL backend at http://localhost:5001
 * and uses real database records from the seeder.
 */
test.describe('Full-Stack Integration Tests', () => {
  
  test('should login with real credentials and access modules', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Login as Student/i }).click();

    const usernameInput = page.getByPlaceholder(/Enter student/i);
    const passwordInput = page.getByPlaceholder(/Enter passcode/i);
    const loginButton = page.getByRole('button', { name: /Sign In/i });

    await usernameInput.fill('student1');
    await passwordInput.fill('s1001s1001');
    await loginButton.click();

    await expect(page).toHaveURL(/\/$/); // Root URL
    await expect(page.getByText(/Welcome Back, student1/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Academic Week 5/i)).toBeVisible({ timeout: 10000 });

    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /Digital Check-in/i })).toBeVisible();
    const moduleSelect = page.locator('select').first();
    await expect(moduleSelect).not.toBeDisabled();

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /Performance Intelligence/i })).toBeVisible();

    await page.goto('/quiz-validator');
    await expect(page.getByRole('heading', { name: /Student Quiz Portal/i })).toBeVisible();
  });
});
