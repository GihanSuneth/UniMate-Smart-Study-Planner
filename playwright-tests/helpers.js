export async function seedSession(page, overrides = {}) {
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

export async function seedStudentSession(page, overrides = {}) {
  await seedSession(page, overrides);
}

export async function seedLecturerSession(page, overrides = {}) {
  await seedSession(page, {
    userRole: 'lecturer',
    userName: 'Test Lecturer',
    userId: 'mock-lecturer-id',
    ...overrides,
  });
}
