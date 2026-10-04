import { test, expect } from '@playwright/test';

test('installed app reloads offline with local 3D runtime available', async ({ page, context }) => {
  await page.goto('/', { waitUntil: 'load' });

  const support = await page.evaluate(() => 'serviceWorker' in navigator);
  expect(support).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload({ waitUntil: 'load' });

  await expect(page.locator('#tab-btn-atom')).toBeVisible();
  expect(await page.evaluate(() => typeof globalThis.THREE === 'object')).toBe(true);
  expect(await page.evaluate(() => typeof globalThis.confetti === 'function')).toBe(true);

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#tab-btn-atom')).toBeVisible();
    await expect(page.locator('#tab-btn-viewer')).toBeVisible();
    expect(await page.evaluate(() => typeof globalThis.THREE === 'object')).toBe(true);
    expect(await page.evaluate(() => typeof globalThis.confetti === 'function')).toBe(true);
  } finally {
    await context.setOffline(false);
  }
});
