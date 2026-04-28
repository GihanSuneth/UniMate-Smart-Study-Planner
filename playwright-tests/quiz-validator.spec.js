import { test, expect } from '@playwright/test';

test.describe('Quiz Validator Module Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Mock APIs
    await page.route('**/api/quizzes?**', async route => {
      await route.fulfill({
        status: 200,
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
        body: JSON.stringify([
          { _id: 'att1', quiz: { title: 'Old Quiz' }, score: 100, week: 4, createdAt: new Date().toISOString() }
        ])
      });
    });

    await page.route('**/api/quizzes/quiz123/attempt', async route => {
      await route.fulfill({
        status: 200,
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
        body: JSON.stringify({ explanations: ['The OSI model is a conceptual framework.'] })
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
    await page.goto('/quiz-validator');
  });

  test('should complete a quiz and view AI briefing', async ({ page }) => {
    // 1. Select Module
    const moduleSelect = page.locator('select').first();
    await moduleSelect.selectOption('Network Design and Modeling');

    // 2. Start Quiz
    const startButton = page.getByRole('button', { name: /Start Quiz Now/i });
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 3. Answer Questions
    const option = page.getByText('A framework');
    await option.click();

    // 4. Submit
    const submitButton = page.getByRole('button', { name: /Finish and Submit/i });
    await submitButton.click();

    // 5. Result Screen & AI Briefing
    await expect(page.getByText('100%')).toBeVisible();
    
    const aiButton = page.getByRole('button', { name: /Master AI Briefing/i });
    await aiButton.click();
    await expect(page.getByText('AI BRIEFING', { exact: true }).first()).toBeVisible();

    // 6. Back to Portal
    await page.getByRole('button', { name: /Back to Portal/i }).click();
    await expect(page.getByText(/Student Quiz Portal/i)).toBeVisible();
  });
});
