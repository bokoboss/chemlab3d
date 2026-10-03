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

test('global grade control clearly scopes itself to the molecule list and exposes state', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const group = page.locator('.level-bar');
  await expect(group).toHaveAttribute('role', 'group');
  await expect(group).toHaveAttribute('title', 'กรองเฉพาะรายการโมเลกุลในแท็บโมเลกุล 3D');
  await expect(page.locator('#chemlab-level-filter-label')).toHaveText('กรองโมเลกุล:');

  const all = page.getByRole('button', { name: 'ทั้งหมด', exact: true });
  const grade4 = page.getByRole('button', { name: 'ม.4', exact: true });
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(grade4).toHaveAttribute('aria-pressed', 'false');
  await expect(grade4).toHaveAttribute('aria-controls', 'molecule-list-container');

  await grade4.click();
  await expect(grade4).toHaveAttribute('aria-pressed', 'true');
  await expect(all).toHaveAttribute('aria-pressed', 'false');
});

test('mobile horizontal navigation becomes a keyboard-scrollable named region', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const nav = page.locator('.nav-tabs');
  await expect(nav).toHaveAttribute('data-chemlab-scroll-region', 'true');
  await expect(nav).toHaveAttribute('tabindex', '0');
  await expect(nav).toHaveAttribute('aria-label', 'แถบนำทางหลักที่เลื่อนได้ในแนวนอน');

  await nav.focus();
  const before = await nav.evaluate((element) => element.scrollLeft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => nav.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
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
