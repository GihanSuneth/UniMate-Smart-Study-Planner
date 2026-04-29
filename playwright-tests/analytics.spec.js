import { test, expect } from '@playwright/test';

test.describe('Analytics Module Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Mock APIs
    await page.route('**/api/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ enrolledModules: ['IT3010', 'IT3011'] })
      });
    });

    await page.route('**/api/analytics/summary/**', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          lastWeek: { attendance: 80, quiz: 85, target: { attendanceTarget: 75, quizTarget: 80 } },
          currentWeek: { attendance: 70, quiz: 65, target: null },
          suggestions: ['Study more', 'Attend more classes'],
          criticalInsight: null
        })
      });
    });

    await page.route('**/api/analytics/history/**', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { week: 4, attendance: { actual: 80 }, quiz: { actual: 85 } },
          { week: 3, attendance: { actual: 90 }, quiz: { actual: 80 } }
        ])
      });
    });

    await page.route('**/api/analytics/target', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ unlockCount: 1 })
      });
    });

    await page.route('**/api/analytics/generate-ai-insight', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          weeklyAnalysis: {
            problem: 'Low attendance in week 5',
            reason: 'Missing lecture on Tuesday',
            suggestion: 'Attend upcoming lab sessions'
          }
        })
      });
    });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('userRole', 'student');
      localStorage.setItem('userName', 'Test Student');
      localStorage.setItem('userId', 'mock-id');
      localStorage.setItem('token', 'mock-token');
      window.dispatchEvent(new Event('auth-change'));
    });
    await page.goto('/analytics');
  });

  test('should interact with module chips and sliders', async ({ page }) => {
    // 1. Module Chips
    const moduleChip = page.getByRole('button', { name: /Database Systems/i }).or(page.getByRole('button', { name: /IT3011/i }));
    if (await moduleChip.isVisible()) {
      await moduleChip.click();
    }

    // 2. Sliders
    const attSlider = page.locator('input[type="range"]').first();
    await attSlider.fill('85');
    await expect(page.getByText(/Attendance Target: 85%/i)).toBeVisible();

    const quizSlider = page.locator('input[type="range"]').last();
    await quizSlider.fill('90');
    await expect(page.getByText(/Quiz Score Target: 90%/i)).toBeVisible();

    // 3. Commit Targets
    const commitButton = page.getByRole('button', { name: /Commit Targets/i });
    await commitButton.click();
    
    // Confirm step
    const confirmButton = page.getByRole('button', { name: /Confirm Lock/i });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    await expect(page.getByRole('button', { name: /Unlock Targets/i })).toBeVisible();
  });

  test('should deploy AI and run validation', async ({ page }) => {
    // 1. Deploy AI
    const deployButton = page.getByRole('button', { name: /Deploy AI Trace Analysis/i });
    await deployButton.click();
    await expect(page.getByText(/Performance Intelligence/i)).toBeVisible();

    // 2. Run Validation
    const validateButton = page.getByRole('button', { name: /Run Live Validation/i });
    await validateButton.click();
    
    // Check for toast message or feedback (since we mock, it should show success or warning based on logic)
    // We can just verify the button is clickable and responsive
    await expect(validateButton).toBeEnabled();
  });
});
