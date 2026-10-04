import { test, expect } from '@playwright/test';

async function openMobileLearningMenu(page) {
  const trigger = page.locator('#chemlab-mobile-menu-btn');
  await expect(trigger).toBeVisible();
  await trigger.click();
  const modal = page.locator('#chemlab-mobile-learning-modal');
  await expect(modal).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  return modal;
}

test('mobile learning overview exposes all top-level destinations without replacing the original nav', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const originalTabs = page.locator('.nav-tabs .nav-tab');
  await expect(originalTabs).toHaveCount(7);

  const modal = await openMobileLearningMenu(page);
  await expect(modal.getByRole('heading', { name: 'เรียนรู้หลัก' })).toBeVisible();
  await expect(modal.getByRole('heading', { name: 'ฝึกฝนและทบทวน' })).toBeVisible();
  await expect(modal.locator('[data-chemlab-source-nav]')).toHaveCount(7);

  await modal.locator('[data-chemlab-source-nav="tab-btn-ptable"]').click();
  await expect(modal).toBeHidden();
  await expect(page.locator('#tab-ptable')).toHaveClass(/active/);
  await expect(page.locator('#tab-btn-ptable')).toHaveClass(/active/);
  await expect(originalTabs).toHaveCount(7);
});

test('mobile periodic-table navigator jumps across the preserved full table', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-ptable').click();

  const tableTab = page.locator('#tab-ptable');
  const jumpNav = page.locator('#CHEMLAB_MOBILE_PTABLE_NAV');
  await expect(tableTab).toBeVisible();
  await expect(jumpNav).toBeVisible();
  await expect(page.locator('#ptable-grid-container')).toBeVisible();

  const maxScroll = await tableTab.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(maxScroll).toBeGreaterThan(0);

  await jumpNav.getByRole('button', { name: 'หมู่ 13–18' }).click();
  await expect.poll(async () => tableTab.evaluate((element) => element.scrollLeft)).toBeGreaterThan(maxScroll * 0.7);
  await expect(jumpNav.getByRole('button', { name: 'หมู่ 13–18' })).toHaveAttribute('aria-pressed', 'true');

  await jumpNav.getByRole('button', { name: 'หมู่ 1–2' }).click();
  await expect.poll(async () => tableTab.evaluate((element) => element.scrollLeft)).toBeLessThan(maxScroll * 0.25);
  await expect(jumpNav.getByRole('button', { name: 'หมู่ 1–2' })).toHaveAttribute('aria-pressed', 'true');
});

test('mobile learning sheet participates in the accessibility dialog contract', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const trigger = page.locator('#chemlab-mobile-menu-btn');
  const modal = await openMobileLearningMenu(page);
  await expect(modal).toHaveAttribute('role', 'dialog');
  await expect(modal).toHaveAttribute('aria-modal', 'true');
  await expect.poll(async () => modal.evaluate((node) => node.contains(document.activeElement))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
});
