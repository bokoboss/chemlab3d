import { test, expect } from '@playwright/test';

test('mobile 3D viewer keeps advanced controls available but collapses them by default', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-viewer').click();

  const toolbar = page.locator('#tab-viewer .viewport-toolbar');
  const toggle = page.locator('#chemlab-viewer-mobile-tools-btn');
  const analysis = page.locator('#tab-viewer .cluster-analysis');
  const view = page.locator('#tab-viewer .cluster-view');

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(analysis).toBeHidden();
  await expect(view).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toolbar).toHaveClass(/chemlab-mobile-3d-tools-open/);
  await expect(analysis).toBeVisible();
  await expect(view).toBeVisible();
  await expect(page.locator('#btn-measure')).toBeVisible();
  await expect(page.locator('#btn-labels')).toBeVisible();

  await toggle.click();
  await expect(analysis).toBeHidden();
  await expect(view).toBeHidden();
});

test('desktop 3D viewer remains fully expanded and the mobile toggle stays out of the way', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-viewer').click();

  await expect(page.locator('#chemlab-viewer-mobile-tools-btn')).toBeHidden();
  await expect(page.locator('#tab-viewer .cluster-analysis')).toBeVisible();
  await expect(page.locator('#tab-viewer .cluster-view')).toBeVisible();
  await expect(page.locator('#threejs-canvas-container')).toBeVisible();
});

test('revised dim-text token meets the intended contrast floor on the common card reference surface', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const token = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim());
  expect(token.toLowerCase()).toBe('#7c8aa0');
});
