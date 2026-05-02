# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notes-ai.spec.js >> Notes AI Module Interactions >> student >> should view history
- Location: playwright-tests/notes-ai.spec.js:80:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/SMART NOTES/i)
Expected: visible
Error: strict mode violation: getByText(/SMART NOTES/i) resolved to 5 elements:
    1) <p>Students have two separate AI tools: one for deta…</p> aka getByText('Students have two separate AI')
    2) <button class="tab active">Smart Notes Generator</button> aka getByRole('button', { name: 'Smart Notes Generator' })
    3) <button class="btn-primary generate-btn">Generate Smart Notes</button> aka getByRole('button', { name: 'Generate Smart Notes' })
    4) <h3>Smart Notes Preview</h3> aka getByRole('heading', { name: 'Smart Notes Preview' })
    5) <span>SMART NOTES</span> aka getByText('SMART NOTES', { exact: true })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/SMART NOTES/i)

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - img "UniMate Logo" [ref=e6]
        - generic [ref=e7]: UniMate
      - navigation [ref=e8]:
        - link "Dashboard" [ref=e9] [cursor=pointer]:
          - /url: /
          - img [ref=e10]
          - text: Dashboard
        - link "Notes AI" [ref=e15] [cursor=pointer]:
          - /url: /notes-ai
          - img [ref=e16]
          - text: Notes AI
        - link "Attendance" [ref=e18] [cursor=pointer]:
          - /url: /attendance
          - img [ref=e19]
          - text: Attendance
        - link "Quiz Validator" [ref=e23] [cursor=pointer]:
          - /url: /quiz-validator
          - img [ref=e24]
          - text: Quiz Validator
        - link "Analytics" [ref=e28] [cursor=pointer]:
          - /url: /analytics
          - img [ref=e29]
          - text: Analytics
        - link "Profile Activity" [ref=e33] [cursor=pointer]:
          - /url: /settings
          - img [ref=e34]
          - text: Profile Activity
      - generic [ref=e37]:
        - generic [ref=e38]:
          - img "Test Student" [ref=e39]
          - generic [ref=e40]:
            - generic [ref=e41]: Test Student
            - generic [ref=e42]: student
        - button "Logout" [ref=e43] [cursor=pointer]:
          - img [ref=e44]
          - generic [ref=e48]: Logout
    - main [ref=e49]:
      - generic [ref=e51]:
        - generic [ref=e54]: Academic Week 5
        - generic [ref=e56]:
          - generic [ref=e57]:
            - generic [ref=e58]: Test Student
            - generic [ref=e59]: student
          - img "Profile" [ref=e60] [cursor=pointer]
      - generic [ref=e62]:
        - generic:
          - generic [ref=e63]: I'm ready! Upload or paste your rough notes above.
          - img "AI Mascot" [ref=e64]
        - generic [ref=e65]:
          - heading "Student Notes AI" [level=1] [ref=e66]
          - paragraph [ref=e67]: "Students have two separate AI tools: one for detailed smart notes and one for compressed exam preparation."
          - generic [ref=e68]:
            - button "Smart Notes Generator" [ref=e69] [cursor=pointer]
            - button "Exam Prep Generator" [ref=e70] [cursor=pointer]
        - generic [ref=e72]:
          - generic [ref=e73]:
            - generic [ref=e74]:
              - heading "Reference Materials" [level=3] [ref=e75]
              - generic [ref=e77] [cursor=pointer]:
                - img [ref=e79]
                - paragraph [ref=e82]: Upload or drop study materials here...
              - button "Generate Smart Notes" [ref=e83] [cursor=pointer]
            - generic [ref=e84]:
              - generic [ref=e85]:
                - heading "Paste Text" [level=3] [ref=e86]
                - generic [ref=e87]:
                  - generic [ref=e88]: "Filter by Module:"
                  - combobox [ref=e89] [cursor=pointer]:
                    - option "IT3010" [selected]
                    - option "IT3011"
              - textbox "Paste your rough notes here..." [ref=e90]
          - generic [ref=e91]:
            - generic [ref=e92]:
              - generic [ref=e93]:
                - heading "Smart Notes Preview" [level=3] [ref=e94]
                - generic [ref=e95]: Awaiting input...
              - generic [ref=e96]:
                - button "Download PDF" [disabled] [ref=e97] [cursor=pointer]:
                  - img [ref=e98]
                  - text: Download PDF
                - button "Copy Notes" [disabled] [ref=e101] [cursor=pointer]:
                  - img [ref=e102]
                  - text: Copy Notes
            - generic [ref=e105]:
              - button "Summary" [ref=e106] [cursor=pointer]
              - button "Key Points" [ref=e107] [cursor=pointer]
              - button "Deep Dive" [ref=e108] [cursor=pointer]
              - button "Quiz Ideas" [ref=e109] [cursor=pointer]
              - button "Show Previous Record" [active] [ref=e110] [cursor=pointer]
            - generic [ref=e112]:
              - generic [ref=e113]:
                - img [ref=e114]
                - generic [ref=e116]: "Filter by Module:"
                - combobox [ref=e117]:
                  - option "All Modules" [selected]
                  - option "IT3010"
                  - option "IT3011"
              - generic [ref=e119] [cursor=pointer]:
                - generic [ref=e121]: Old Notes
                - generic [ref=e122]:
                  - generic [ref=e123]: IT3010
                  - generic [ref=e124]: SMART NOTES
                  - generic [ref=e125]: 5/3/2026
  - region "Notifications Alt+T"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { seedStudentSession, seedLecturerSession } from './helpers';
  3   | 
  4   | test.describe('Notes AI Module Interactions', () => {
  5   |   test.describe('student', () => {
  6   |     test.beforeEach(async ({ page }) => {
  7   |       await page.route('**/api/auth/profile', async route => {
  8   |         await route.fulfill({
  9   |           status: 200,
  10  |           contentType: 'application/json',
  11  |           body: JSON.stringify({ enrolledModules: ['IT3010', 'IT3011'] })
  12  |         });
  13  |       });
  14  | 
  15  |       await page.route('**/api/activity?**', async route => {
  16  |         await route.fulfill({
  17  |           status: 200,
  18  |           contentType: 'application/json',
  19  |           body: JSON.stringify([
  20  |             {
  21  |               type: 'notes_generated',
  22  |               generatorMode: 'smart_notes',
  23  |               module: 'IT3010',
  24  |               title: 'Old Notes',
  25  |               timestamp: new Date().toISOString(),
  26  |               content: { Summary: ['Point 1', 'Point 2'] }
  27  |             }
  28  |           ])
  29  |         });
  30  |       });
  31  | 
  32  |       await page.route('**/api/ai', async route => {
  33  |         await route.fulfill({
  34  |           status: 200,
  35  |           contentType: 'application/json',
  36  |           body: JSON.stringify({
  37  |             Summary: ['AI Point 1', 'AI Point 2'],
  38  |             'Key Points': ['Key 1', 'Key 2']
  39  |           })
  40  |         });
  41  |       });
  42  | 
  43  |       await page.route('**/api/activity', async route => {
  44  |         if (route.request().method() === 'POST') {
  45  |           await route.fulfill({
  46  |             status: 201,
  47  |             contentType: 'application/json',
  48  |             body: JSON.stringify({ ok: true })
  49  |           });
  50  |           return;
  51  |         }
  52  | 
  53  |         await route.fallback();
  54  |       });
  55  | 
  56  |       await seedStudentSession(page, { userId: 'mock-student-id' });
  57  |       await page.goto('/notes-ai');
  58  |     });
  59  | 
  60  |     test('should generate notes and switch tabs', async ({ page }) => {
  61  |       await expect(page.getByRole('heading', { name: /Student Notes AI/i })).toBeVisible();
  62  | 
  63  |       await page.getByRole('button', { name: /Exam Prep Generator/i }).click();
  64  | 
  65  |       const textarea = page.getByPlaceholder(/Paste long lecture notes|Paste your rough notes/i);
  66  |       await textarea.fill('These are my notes about Operating Systems.');
  67  | 
  68  |       await page.getByRole('button', { name: /Generate Exam Preparation/i }).click();
  69  | 
  70  |       await expect(page.getByText(/Generation complete/i)).toBeVisible();
  71  |       await expect(page.getByText('AI Point 1')).toBeVisible();
  72  | 
  73  |       await page.getByRole('button', { name: 'Key Points' }).click();
  74  |       await expect(page.getByText('Key 1')).toBeVisible();
  75  | 
  76  |       await expect(page.getByRole('button', { name: /Download PDF/i })).toBeEnabled();
  77  |       await expect(page.getByRole('button', { name: /Copy Notes/i })).toBeEnabled();
  78  |     });
  79  | 
  80  |     test('should view history', async ({ page }) => {
  81  |       await page.getByRole('button', { name: /Show Previous Record/i }).click();
  82  | 
  83  |       await expect(page.getByText('Old Notes')).toBeVisible();
> 84  |       await expect(page.getByText(/SMART NOTES/i)).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  85  | 
  86  |       await page.getByText('Old Notes').click();
  87  |       await expect(page.getByText('Point 1')).toBeVisible();
  88  |     });
  89  |   });
  90  | 
  91  |   test.describe('lecturer', () => {
  92  |     test.beforeEach(async ({ page }) => {
  93  |       await page.route('**/api/auth/profile', async route => {
  94  |         await route.fulfill({
  95  |           status: 200,
  96  |           contentType: 'application/json',
  97  |           body: JSON.stringify({ assignedModules: ['IT4010', 'IT4011'] })
  98  |         });
  99  |       });
  100 | 
  101 |       await page.route('**/api/notes?**', async route => {
  102 |         await route.fulfill({
  103 |           status: 200,
  104 |           contentType: 'application/json',
  105 |           body: JSON.stringify([
  106 |             {
  107 |               type: 'teaching_prep',
  108 |               module: 'IT4010',
  109 |               title: 'Week 1 Teaching Prep',
  110 |               timestamp: new Date().toISOString(),
  111 |               content: { Summary: ['Teaching Point 1'], 'Lesson Plan': ['Lesson Step 1'] }
  112 |             }
  113 |           ])
  114 |         });
  115 |       });
  116 | 
  117 |       await page.route('**/api/ai', async route => {
  118 |         await route.fulfill({
  119 |           status: 200,
  120 |           contentType: 'application/json',
  121 |           body: JSON.stringify({
  122 |             'Lesson Plan': ['Lesson Step 1', 'Lesson Step 2'],
  123 |             Summary: ['Teaching Point 1'],
  124 |             'Quiz Ideas': ['Quiz Idea 1']
  125 |           })
  126 |         });
  127 |       });
  128 | 
  129 |       await page.route('**/api/notes', async route => {
  130 |         if (route.request().method() === 'POST') {
  131 |           await route.fulfill({
  132 |             status: 201,
  133 |             contentType: 'application/json',
  134 |             body: JSON.stringify({ ok: true })
  135 |           });
  136 |           return;
  137 |         }
  138 | 
  139 |         await route.fallback();
  140 |       });
  141 | 
  142 |       await seedLecturerSession(page);
  143 |       await page.goto('/notes-ai');
  144 |     });
  145 | 
  146 |     test('should generate teaching aids and switch tabs', async ({ page }) => {
  147 |       await expect(page.getByRole('heading', { name: /Lecturer Reference AI/i })).toBeVisible();
  148 | 
  149 |       await page.getByPlaceholder(/Paste your syllabus or reference notes here/i).fill(
  150 |         'Week 1 lecture notes about distributed systems.'
  151 |       );
  152 | 
  153 |       await page.getByRole('button', { name: /Generate Teaching Aids/i }).click();
  154 | 
  155 |       await expect(page.getByText(/Generation complete/i)).toBeVisible();
  156 |       await expect(page.getByText('Lesson Step 1')).toBeVisible();
  157 | 
  158 |       await page.getByRole('button', { name: 'Summary' }).click();
  159 |       await expect(page.getByText('Teaching Point 1')).toBeVisible();
  160 | 
  161 |       await expect(page.getByRole('button', { name: /Download PDF/i })).toBeEnabled();
  162 |     });
  163 | 
  164 |     test('should view lecturer history', async ({ page }) => {
  165 |       await page.getByRole('button', { name: /Show Previous Record/i }).click();
  166 | 
  167 |       await expect(page.getByText('Week 1 Teaching Prep')).toBeVisible();
  168 | 
  169 |       await page.getByText('Week 1 Teaching Prep').click();
  170 |       await expect(page.getByText('Lesson Step 1')).toBeVisible();
  171 |     });
  172 |   });
  173 | });
  174 | 
```