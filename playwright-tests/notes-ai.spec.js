import { test, expect } from '@playwright/test';
import { seedStudentSession } from './helpers';

test.describe('Notes AI Module Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ enrolledModules: ['IT3010', 'IT3011'] })
      });
    });

    await page.route('**/api/activity?**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            type: 'notes_generated',
            module: 'IT3010',
            title: 'Old Notes',
            timestamp: new Date().toISOString(),
            content: { Summary: ['Point 1', 'Point 2'] }
          }
        ])
      });
    });

    await page.route('**/api/ai', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Summary: ['AI Point 1', 'AI Point 2'],
          'Key Points': ['Key 1', 'Key 2']
        })
      });
    });

    await page.route('**/api/activity', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true })
        });
      }
    });

    await seedStudentSession(page, { userId: 'mock-id' });
    await page.goto('/notes-ai');
  });

  test('should generate notes and switch tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Student Notes AI/i })).toBeVisible();

    const examPrepBtn = page.getByRole('button', { name: /Exam Prep Generator/i });
    await examPrepBtn.click();

    const textarea = page.getByPlaceholder(/Paste long lecture notes|Paste your rough notes/i);
    await textarea.fill('These are my notes about Operating Systems.');

    const generateBtn = page.getByRole('button', { name: /Generate Exam Preparation/i });
    await generateBtn.click();

    await expect(page.getByText(/Generation complete/i)).toBeVisible();
    await expect(page.getByText('AI Point 1')).toBeVisible();

    const keyPointsTab = page.getByRole('button', { name: 'Key Points' });
    await keyPointsTab.click();
    await expect(page.getByText('Key 1')).toBeVisible();

    const downloadBtn = page.getByRole('button', { name: /Download PDF/i });
    await expect(downloadBtn).toBeEnabled();

    const copyBtn = page.getByRole('button', { name: /Copy Notes/i });
    await expect(copyBtn).toBeEnabled();
  });

  test('should view history', async ({ page }) => {
    const historyTab = page.getByRole('button', { name: /Show Previous Record/i });
    await historyTab.click();

    await expect(page.getByText('Old Notes')).toBeVisible();
    await expect(page.getByText(/SMART NOTES/i)).toBeVisible();
    
    await page.getByText('Old Notes').click();
    await expect(page.getByText('Point 1')).toBeVisible();
  });
});
