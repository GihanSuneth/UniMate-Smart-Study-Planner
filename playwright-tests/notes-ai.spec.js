import { test, expect } from '@playwright/test';
import { seedStudentSession, seedLecturerSession } from './helpers';

test.describe('Notes AI Module Interactions', () => {
  test.describe('student', () => {
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
              generatorMode: 'smart_notes',
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
          return;
        }

        await route.fallback();
      });

      await seedStudentSession(page, { userId: 'mock-student-id' });
      await page.goto('/notes-ai');
    });

    test('should generate notes and switch tabs', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Student Notes AI/i })).toBeVisible();

      await page.getByRole('button', { name: /Exam Prep Generator/i }).click();

      const textarea = page.getByPlaceholder(/Paste long lecture notes|Paste your rough notes/i);
      await textarea.fill('These are my notes about Operating Systems.');

      await page.getByRole('button', { name: /Generate Exam Preparation/i }).click();

      await expect(page.getByText(/Generation complete/i)).toBeVisible();
      await expect(page.getByText('AI Point 1')).toBeVisible();

      await page.getByRole('button', { name: 'Key Points' }).click();
      await expect(page.getByText('Key 1')).toBeVisible();

      await expect(page.getByRole('button', { name: /Download PDF/i })).toBeEnabled();
      await expect(page.getByRole('button', { name: /Copy Notes/i })).toBeEnabled();
    });

    test('should view history', async ({ page }) => {
      await page.getByRole('button', { name: /Show Previous Record/i }).click();

      await expect(page.getByText('Old Notes')).toBeVisible();
      await expect(page.getByText('SMART NOTES', { exact: true })).toBeVisible();

      await page.getByText('Old Notes').click();
      await expect(page.getByText('Point 1')).toBeVisible();
    });
  });

  test.describe('lecturer', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/auth/profile', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ assignedModules: ['IT4010', 'IT4011'] })
        });
      });

      await page.route('**/api/notes?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              type: 'teaching_prep',
              module: 'IT4010',
              title: 'Week 1 Teaching Prep',
              timestamp: new Date().toISOString(),
              content: { Summary: ['Teaching Point 1'], 'Lesson Plan': ['Lesson Step 1'] }
            }
          ])
        });
      });

      await page.route('**/api/ai', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            'Lesson Plan': ['Lesson Step 1', 'Lesson Step 2'],
            Summary: ['Teaching Point 1'],
            'Quiz Ideas': ['Quiz Idea 1']
          })
        });
      });

      await page.route('**/api/notes', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ ok: true })
          });
          return;
        }

        await route.fallback();
      });

      await seedLecturerSession(page);
      await page.goto('/notes-ai');
    });

    test('should generate teaching aids and switch tabs', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Lecturer Reference AI/i })).toBeVisible();

      await page.getByPlaceholder(/Paste your syllabus or reference notes here/i).fill(
        'Week 1 lecture notes about distributed systems.'
      );

      await page.getByRole('button', { name: /Generate Teaching Aids/i }).click();

      await expect(page.getByText(/Generation complete/i)).toBeVisible();
      await expect(page.getByText('Lesson Step 1')).toBeVisible();

      await page.getByRole('button', { name: 'Summary' }).click();
      await expect(page.getByText('Teaching Point 1')).toBeVisible();

      await expect(page.getByRole('button', { name: /Download PDF/i })).toBeEnabled();
    });

    test('should view lecturer history', async ({ page }) => {
      await page.getByRole('button', { name: /Show Previous Record/i }).click();

      await expect(page.getByText('Week 1 Teaching Prep')).toBeVisible();

      await page.getByText('Week 1 Teaching Prep').click();
      await expect(page.getByText('Lesson Step 1')).toBeVisible();
    });
  });
});
