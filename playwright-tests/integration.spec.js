import { test, expect } from '@playwright/test';

/**
 * FULL STACK INTEGRATION TEST
 * This test communicates with the REAL backend at http://localhost:5001
 * and uses real database records from the seeder.
 */
test.describe('Full-Stack Integration Tests', () => {
  
  test('should login with real credentials and access modules', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('/');
    
    // 2. Select Role
    await page.getByRole('button', { name: /Login as Student/i }).click();

    // 3. Perform Login
    const usernameInput = page.getByPlaceholder(/Enter student/i);
    const passwordInput = page.getByPlaceholder(/Enter passcode/i);
    const loginButton = page.getByRole('button', { name: /Sign In/i });

    await usernameInput.fill('student1');
    await passwordInput.fill('s1001s1001');
    await loginButton.click();

    // 3. Verify Dashboard Access
    await expect(page).toHaveURL(/\/$/); // Root URL
    await expect(page.getByText(/student1/i).first()).toBeVisible();
    await expect(page.getByText(/Academic Week 5/i)).toBeVisible({ timeout: 10000 });

    // 4. Access Attendance (Real Data)
    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /Digital Check-in/i })).toBeVisible();
    const moduleSelect = page.locator('select').first();
    await expect(moduleSelect).not.toBeDisabled();

    // 5. Access Analytics (Real Data)
    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /Performance Intelligence/i })).toBeVisible();

    // 6. Access Quiz Validator (Real Data)
    await page.goto('/quiz-validator');
    await expect(page.getByRole('heading', { name: /Student Quiz Portal/i })).toBeVisible();
  });
});
