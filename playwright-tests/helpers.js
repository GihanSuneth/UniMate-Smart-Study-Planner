export async function seedStudentSession(page, overrides = {}) {
  const session = {
    userRole: 'student',
    userName: 'Test Student',
    userId: 'mock-student-id',
    token: 'mock-token',
    ...overrides,
  };

  await page.goto('/');
  await page.evaluate((authState) => {
    Object.entries(authState).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    window.dispatchEvent(new Event('auth-change'));
  }, session);
}
