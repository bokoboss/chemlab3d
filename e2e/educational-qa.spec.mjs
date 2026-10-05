import { test, expect } from '@playwright/test';

test('Compound Builder quests use model-building language rather than synthesis claims', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-quests').click();
  const container = page.locator('#quest-cards-container');
  await expect(container.locator('.quest-card').first()).toBeVisible();
  const text = await container.innerText();
  expect(text).toContain('ประกอบแบบจำลอง');
  expect(text).not.toMatch(/สังเคราะห์/);
});

test('Guide is transparent about curriculum status and renders corrected chemistry wording', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-guide').click();
  const guide = page.locator('#tab-guide');
  await expect(guide.getByRole('heading', { name: /แนวทางทบทวนเคมีระดับมัธยม/ })).toBeVisible();
  const text = await guide.innerText();
  expect(text).toContain('อยู่ระหว่างการตรวจเทียบกับเอกสารหลักสูตรทางการ');
  expect(text).toContain('กฎออกเตตเป็นแนวทางที่มีประโยชน์');
  expect(text).toContain('22.7 L/mol');
  expect(text).toContain('Brønsted–Lowry');
  expect(text).not.toContain('$p^+$');
  expect(text).not.toContain('สรุปเนื้อหาเคมีตามหลักสูตรแกนกลาง');
});
