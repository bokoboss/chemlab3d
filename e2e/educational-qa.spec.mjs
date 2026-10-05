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

test('3D library distinguishes ionic formula units and keeps dipole visualization qualitative', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-viewer').click();

  await page.evaluate(() => {
    const card = [...document.querySelectorAll('.molecule-card')].find((el) => el.textContent.includes('NaCl'));
    if (!card) throw new Error('NaCl card not found');
    card.click();
    document.getElementById('btn-dipole')?.click();
  });

  const naclDetails = await page.locator('#details-sidebar-container').innerText();
  expect(naclDetails).toContain('หน่วยสูตร');
  const naclDipole = await page.locator('#dipole-badge-el').textContent();
  expect(naclDipole).toContain('ไม่ใช้ molecular dipole');

  await page.evaluate(() => {
    const card = [...document.querySelectorAll('.molecule-card')].find((el) => el.textContent.includes('H₂O'));
    if (!card) throw new Error('H2O card not found');
    card.click();
    document.getElementById('btn-dipole')?.click();
    document.getElementById('btn-dipole')?.click();
  });
  const waterDipole = await page.locator('#dipole-badge-el').textContent();
  expect(waterDipole).toContain('qualitative');
  expect(waterDipole).toContain('ไม่ใช่ค่า dipole moment ที่วัดได้');
  expect(waterDipole).not.toMatch(/\d+(?:\.\d+)?\s*D\b/);
});
