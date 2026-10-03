import { test, expect } from '@playwright/test';

test('keyboard and dialog accessibility layer augments the existing experience', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const skip = page.locator('.chemlab-skip-link');
  await expect(skip).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();

  const enhancedClickables = page.locator('[onclick][role="button"][tabindex="0"]');
  expect(await enhancedClickables.count()).toBeGreaterThan(0);

  const flashcardsAvailable = await page.evaluate(() => typeof globalThis.openFlashcardModal === 'function');
  expect(flashcardsAvailable).toBe(true);
  await page.evaluate(() => globalThis.openFlashcardModal());

  const dialog = page.locator('[role="dialog"][aria-modal="true"][aria-hidden="false"]:visible').first();
  await expect(dialog).toBeVisible();
  await expect.poll(async () => dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('reduced-motion preference is respected without changing the default visual mode', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const transitionSeconds = await page.locator('.chemlab-skip-link').evaluate((element) => {
    const value = getComputedStyle(element).transitionDuration.split(',')[0] || '0s';
    return value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value);
  });
  expect(transitionSeconds).toBeLessThan(0.01);
});
