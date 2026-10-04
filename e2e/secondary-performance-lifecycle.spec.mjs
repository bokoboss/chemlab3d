import { test, expect } from '@playwright/test';

async function state(page) {
  return page.evaluate(() => globalThis.ChemLabSecondaryRuntimeLifecycle?.getState?.());
}

test('historical 3D pauses off-panel and resumes when the learner returns', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#atom-subtab-history').click();
  await expect.poll(async () => (await state(page))?.historyRunning).toBe(true);

  await page.locator('#tab-btn-ptable').click();
  await expect.poll(async () => (await state(page))?.historyRunning).toBe(false);

  await page.locator('#tab-btn-atom').click();
  await expect.poll(async () => (await state(page))?.historyRunning).toBe(true);

  await page.locator('#atom-subtab-studio').click();
  await expect.poll(async () => (await state(page))?.historyRunning).toBe(false);
});

test('collision and galvanic loops only run for the active sandbox station', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-sandbox').click();

  await page.locator('#sb-mode-collision').click();
  await expect.poll(async () => (await state(page))?.collisionRunning).toBe(true);
  await expect.poll(async () => (await state(page))?.galvanicRunning).toBe(false);

  await page.locator('#sb-mode-galvanic').click();
  await expect.poll(async () => (await state(page))?.collisionRunning).toBe(false);
  await expect.poll(async () => (await state(page))?.galvanicRunning).toBe(true);

  await page.locator('#tab-btn-viewer').click();
  await expect.poll(async () => (await state(page))?.galvanicRunning).toBe(false);

  await page.locator('#tab-btn-sandbox').click();
  await expect.poll(async () => (await state(page))?.galvanicRunning).toBe(true);
});
