import { test, expect } from '@playwright/test';
import { seedStudentSession, seedLecturerSession } from './helpers';

test.describe('Quiz Validator Module Interactions', () => {
  test.describe('student', () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/quizzes?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              _id: 'quiz123',
              title: 'Network Fundamentals',
              module: 'Network Design and Modeling',
              week: 5,
              questions: [
                {
                  text: 'What is OSI model?',
                  options: [
                    { text: 'A framework', isCorrect: true },
                    { text: 'A hardware', isCorrect: false }
                  ]
                }
              ]
            }
          ])
        });
      });

      await page.route('**/api/quizzes/attempts/history?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { _id: 'att1', quiz: { title: 'Old Quiz' }, score: 100, week: 4, createdAt: new Date().toISOString() }
          ])
        });
      });

      await page.route('**/api/quizzes/quiz123/attempt', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            score: 100,
            correctCount: 1,
            totalQuestions: 1,
            questionResults: [{ questionText: 'What is OSI model?', selectedText: 'A framework', isCorrect: true }]
          })
        });
      });

      await page.route('**/api/analytics/justify-batch', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ explanations: ['The OSI model is a conceptual framework.'] })
        });
      });

      await seedStudentSession(page, { userId: 'mock-id' });
      await page.goto('/quiz-validator');
    });

    test('should complete a quiz and view AI briefing', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Student Quiz Portal/i })).toBeVisible();

      const moduleSelect = page.locator('select').first();
      await moduleSelect.selectOption('Network Design and Modeling');

      const startButton = page.getByRole('button', { name: /Start Quiz Now/i });
      await expect(startButton).toBeVisible();
      await startButton.click();

      const option = page.getByText('A framework');
      await option.click();

      const submitButton = page.getByRole('button', { name: /Finish and Submit/i });
      await submitButton.click();

      await expect(page.getByRole('heading', { name: /Quiz Results/i })).toBeVisible();
      await expect(page.getByText('100%')).toBeVisible();

      const aiButton = page.getByRole('button', { name: /Master AI Briefing/i });
      await aiButton.click();
      await expect(page.getByText('AI BRIEFING', { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/conceptual framework/i)).toBeVisible();

      await page.getByRole('button', { name: /Back to Portal/i }).click();
      await expect(page.getByText(/Student Quiz Portal/i)).toBeVisible();
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

      await page.route('**/api/quizzes?**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              _id: 'quiz123',
              title: 'Network Fundamentals',
              module: 'Network Design and Modeling',
              week: 5,
              questionCount: 5,
              dateCreated: new Date().toISOString(),
              academicYear: 'Year 1 Semester 1',
              isPublished: true,
              questions: [
                {
                  text: 'What is OSI model?',
                  options: [
                    { text: 'A framework', isCorrect: true },
                    { text: 'A hardware', isCorrect: false }
                  ]
                }
              ]
            }
          ])
        });
      });

      await page.route('**/api/quizzes/attempts/module/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              _id: 'attempt1',
              student: { username: 'Test Student', portalId: 'IT2023001' },
              quiz: { _id: 'quiz123', title: 'Network Fundamentals' },
              score: 80,
              correctAnswers: 4,
              week: 5,
              questionResults: [
                { questionText: 'What is OSI model?', selectedText: 'A framework', isCorrect: true }
              ]
            }
          ])
        });
      });

      await page.route('**/api/quizzes/quiz123', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'quiz123',
            title: 'Network Fundamentals',
            module: 'Network Design and Modeling',
            questions: [
              {
                text: 'What is OSI model?',
                options: [
                  { text: 'A framework', isCorrect: true },
                  { text: 'A hardware', isCorrect: false }
                ]
              }
            ]
          })
        });
      });

      await page.route('**/api/analytics/justify', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ explanation: 'The OSI model is a conceptual framework.' })
        });
      });

      await seedLecturerSession(page);
      await page.goto('/quiz-validator');
    });

    test('should view a published quiz', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Lecturer Quiz Dashboard/i })).toBeVisible();
      await expect(page.getByText('Network Fundamentals')).toBeVisible();

      await page.getByRole('button', { name: /View Quiz/i }).click();

      await expect(page.getByText(/View Quiz/i).first()).toBeVisible();
      await expect(page.getByText(/What is OSI model\?/i)).toBeVisible();
    });

    test('should inspect a student attempt', async ({ page }) => {
      await expect(page.getByText(/Performed Quizzes \(Student History\)/i)).toBeVisible();
      await expect(page.getByText('Test Student')).toBeVisible();

      await page.getByRole('button', { name: /View Logic Trace/i }).click();

      await expect(page.getByText(/AI Logic Trace: Test Student's Attempt/i)).toBeVisible();
      await expect(page.getByText(/Score: 80\/100/i)).toBeVisible();
      await expect(page.getByText(/What is OSI model\?/i)).toBeVisible();
    });
  });
});
