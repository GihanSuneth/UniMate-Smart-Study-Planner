import { test, expect } from '@playwright/test';
import { seedStudentSession, seedLecturerSession } from './helpers';

test.describe('Attendance Module Interactions', () => {
  test.describe('student', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/attendance/sessions/active', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              _id: 'session123',
              module: 'Database Systems',
              week: 5,
              lecturer: { username: 'Dr. Smith' }
            }
          ])
        });
      });

      await page.route('**/api/attendance/mock-id', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            overallPercentage: 85,
            records: [
              { _id: 'rec1', module: 'Database Systems', week: 4, status: 'Present', date: new Date().toISOString() }
            ]
          })
        });
      });

      await page.route('**/api/qr/session/session123/image', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ qrImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' })
        });
      });

      await page.route('**/api/attendance/mark', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Success' })
        });
      });

      await seedStudentSession(page, { userId: 'mock-id' });
      await page.goto('/attendance');
    });

    test('should interact with filters and mark attendance', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Digital Check-in/i })).toBeVisible();

      const moduleSelect = page.locator('select').first();
      await moduleSelect.selectOption('Database Systems');
      await expect(moduleSelect).toHaveValue('Database Systems');

      const weekSelect = page.locator('select').nth(1);
      await weekSelect.selectOption('5');
      await expect(weekSelect).toHaveValue('5');

      const joinButton = page.getByRole('button', { name: /Join & Mark Attendance/i });
      await expect(joinButton).toBeVisible();
      await joinButton.click();

      await expect(page.getByRole('heading', { name: /Join Lecture Session/i })).toBeVisible();
      await expect(page.getByText(/Database Systems/i).last()).toBeVisible();

      const tokenInput = page.getByPlaceholder(/Enter 6-digit code/i);
      await tokenInput.fill('ABCDEF');
      await expect(tokenInput).toHaveValue('ABCDEF');

      const confirmButton = page.getByRole('button', { name: /Confirm and Mark Attendance/i });
      await expect(confirmButton).toBeEnabled();
      await confirmButton.click();

      await expect(page.getByText(/Attendance Recorded/i)).toBeVisible();
    });

    test('should interact with historical filters', async ({ page }) => {
      await expect(page.getByText(/Past Attendance History/i)).toBeVisible();

      const historyModuleSelect = page.locator('select').nth(2);
      await historyModuleSelect.selectOption('Database Systems');

      const historyWeekSelect = page.locator('select').nth(3);
      await historyWeekSelect.selectOption('4');

      await expect(page.getByRole('cell', { name: /Database Systems/i })).toBeVisible();
      await expect(page.getByRole('cell', { name: /Week 4/i })).toBeVisible();
    });
  });

  test.describe('lecturer', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/auth/profile', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ assignedModules: ['Network Design and Modeling', 'Operating Systems'] })
        });
      });

      await page.route('**/api/attendance/module/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              _id: 'att1',
              module: 'Network Design and Modeling',
              week: 5,
              status: 'Present',
              date: new Date().toISOString(),
              student: {
                _id: 'stu-1',
                username: 'Alice Johnson',
                portalId: 'IT2023001',
                email: 'alice@example.com'
              }
            }
          ])
        });
      });

      await page.route('**/api/attendance/enrollment-count?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ count: 2 })
        });
      });

      await page.route('**/api/auth/students?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { _id: 'stu-1', username: 'Alice Johnson', portalId: 'IT2023001', email: 'alice@example.com' },
            { _id: 'stu-2', username: 'Bob Smith', portalId: 'IT2023002', email: 'bob@example.com' }
          ])
        });
      });

      await page.route('**/api/qr/generate', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            qrImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            sessionToken: 'ABC123',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
          })
        });
      });

      await page.route('**/api/attendance/override', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true })
        });
      });

      await page.route('**/api/qr/end', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true })
        });
      });

      await seedLecturerSession(page);
      await page.goto('/attendance');
    });

    test('should start and end a live attendance session', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Attendance Management/i })).toBeVisible();

      await expect(page.getByRole('button', { name: /Start Attendance Session/i })).toBeVisible();
      await page.getByRole('button', { name: /Start Attendance Session/i }).click();

      await expect(page.getByText('ABC123')).toBeVisible();
      await expect(page.getByRole('button', { name: /End Session Now/i })).toBeVisible();

      await page.getByRole('button', { name: /End Session Now/i }).click();
      await expect(page.getByText(/No active session/i)).toBeVisible();
    });

    test('should review missed students and historical attendance', async ({ page }) => {
      await page.getByRole('button', { name: /Missed \(1\)/i }).click();
      await expect(page.getByText('Bob Smith')).toBeVisible();

      await page.getByTitle('Mark Present').last().click();
      await expect(page.getByText(/Marked as Present/i)).toBeVisible();

      await expect(page.getByText(/Past Attendance Details/i)).toBeVisible();
      await expect(page.getByText('Alice Johnson')).toBeVisible();
      await expect(page.getByText('PRESENT')).toBeVisible();
    });
  });
});
