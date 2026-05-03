const DEFAULT_APP_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

export function resolveAppUrl(path = '/') {
  return new URL(path, DEFAULT_APP_URL).toString();
}

export async function seedSession(page, overrides = {}) {
  const session = {
    userRole: 'student',
    userName: 'Test Student',
    userId: 'mock-student-id',
    token: 'mock-token',
    ...overrides,
  };

  await page.goto(resolveAppUrl('/'));
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
