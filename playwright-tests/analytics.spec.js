import { test, expect } from '@playwright/test';
import { seedStudentSession, seedLecturerSession } from './helpers';

test.describe('Analytics Module Interactions', () => {
  test.describe('student', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/auth/profile', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ enrolledModules: ['IT3010', 'IT3011'] })
        });
      });

      await page.route('**/api/analytics/summary/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
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
          contentType: 'application/json',
          body: JSON.stringify([
            { week: 4, attendance: { actual: 80 }, quiz: { actual: 85 } },
            { week: 3, attendance: { actual: 90 }, quiz: { actual: 80 } }
          ])
        });
      });

      await page.route('**/api/analytics/target', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ unlockCount: 1 })
        });
      });

      await page.route('**/api/analytics/generate-ai-insight', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            text: 'Week 5 attendance slipped after missing one lecture, so prioritize the next live session.',
            type: 'ACTION',
            priority: 'high'
          })
        });
      });

      await page.route('**/api/analytics/quiz-deep-dive/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalAttempts: 1,
            weakestConcepts: [
              {
                concept: 'Normalization',
                accuracy: 52,
                misconception: 'Still mixing 2NF and 3NF rules.',
                recommendedFix: 'Review dependency examples and redraw one table decomposition.'
              }
            ]
          })
        });
      });

      await seedStudentSession(page, { userId: 'mock-id' });
      await page.goto('/analytics');
    });

    test('should interact with module chips and sliders', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Performance Intelligence/i })).toBeVisible();

      const moduleChip = page.getByRole('button', { name: /IT3011 - Database Systems/i });
      await moduleChip.click();

      const attSlider = page.locator('input[type="range"]').first();
      await attSlider.fill('85');
      await expect(page.getByText(/Attendance Target: 85%/i)).toBeVisible();

      const quizSlider = page.locator('input[type="range"]').last();
      await quizSlider.fill('90');
      await expect(page.getByText(/Quiz Score Target: 90%/i)).toBeVisible();

      const commitButton = page.getByRole('button', { name: /Commit Targets/i });
      await commitButton.click();

      const confirmButton = page.getByRole('button', { name: /Confirm Lock/i });
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();

      await expect(page.getByRole('button', { name: /Unlock Targets/i })).toBeVisible();
      await expect(page.getByText(/1 edits remaining/i)).toBeVisible();
    });

    test('should deploy AI and run validation', async ({ page }) => {
      await page.getByRole('button', { name: /IT3010 - Network Design and Modeling/i }).click();
      await page.getByRole('button', { name: /Commit Targets/i }).click();
      await page.getByRole('button', { name: /Confirm Lock/i }).click();

      const deployButton = page.getByRole('button', { name: /Deploy AI Intelligence now/i });
      await deployButton.click();
      await expect(page.getByText(/AI Analytics Deployed/i)).toBeVisible();
      await expect(page.getByText(/Problem-Solving Hub|Academic GPS & Recovery Map/i)).toBeVisible();

      const validateButton = page.getByRole('button', { name: /Run Live Validation/i });
      await validateButton.click();
      await expect(page.getByText(/Action Required|On Track/i)).toBeVisible();
    });
  });

  test.describe('lecturer', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/auth/profile', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ assignedModules: ['Network Design and Modeling'] })
        });
      });

      await page.route('**/api/attendance/module/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              module: 'Network Design and Modeling',
              week: 5,
              status: 'Present',
              date: new Date().toISOString(),
              student: {
                portalId: 'IT2023001',
                username: 'Alice Johnson',
                email: 'alice@example.com'
              }
            }
          ])
        });
      });

      await page.route('**/api/analytics/quiz-deep-dive/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            averageScore: 74,
            bestSubtopic: 'OSI Model',
            classStats: {
              attendance: 82,
              totalEnrolled: 30,
              notesFrequency: 12,
              activeNoteTakers: 8
            },
            topicFailureSummary: [
              { topic: 'Subnetting', failureRate: 48, studentsAffected: 14, severity: 'Critical' },
              { topic: 'OSI Model', failureRate: 20, studentsAffected: 6, severity: 'Info' }
            ],
            quizPerformance: [
              { title: 'Network Fundamentals', avgScore: 78 }
            ],
            hardestQuestions: [
              {
                text: 'Which OSI layer is responsible for routing?',
                failureRate: 66,
                quizTitle: 'Network Fundamentals',
                quizDate: new Date().toISOString()
              }
            ]
          })
        });
      });

      await page.route('**/api/analytics/generate-ai-insight', async route => {
        const body = route.request().postDataJSON();

        if (body.type === 'attendance_patterns') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              dropOffTrend: 'mid-week drop',
              patternInsight: 'Students are missing one session after quiz deadlines.',
              highRiskWindow: 'Week 7',
              strongCoverage: 'Week 5'
            })
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            weeklyAnalysis: {
              problem: 'Subnetting performance is slipping.',
              reason: 'Students are confusing masks and host ranges.',
              suggestion: 'Revisit subnetting drills and do a guided class exercise.'
            },
            improvementPlan: ['Run a subnetting recap', 'Assign one focused quiz']
          })
        });
      });

      await seedLecturerSession(page, { userId: 'mock-lecturer-id' });
      await page.goto('/analytics');
    });

    test('should deploy attendance pattern analysis', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Lecturer Analytics & Attendance/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Attendance Records/i })).toBeVisible();

      await page.getByRole('button', { name: /Deploy Pattern AI/i }).click();

      await expect(page.getByText(/mid-week drop/i)).toBeVisible();
      await expect(page.getByText(/High Risk: Week 7/i)).toBeVisible();
    });

    test('should deploy class academic intelligence', async ({ page }) => {
      await page.getByRole('button', { name: /Performance Analytics/i }).click();
      await expect(page.getByText(/AI Intelligence Offline/i)).toBeVisible();

      await page.getByRole('button', { name: /Deploy AI Analytics/i }).click();

      await expect(page.getByText(/Subnetting performance is slipping/i)).toBeVisible();
      await expect(page.getByText(/Which OSI layer is responsible for routing\?/i)).toBeVisible();
    });
  });
});
