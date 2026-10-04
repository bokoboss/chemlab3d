import { test, expect } from '@playwright/test';

async function lifecycleState(page) {
  return page.evaluate(() => globalThis.ChemLabRuntimeLifecycle?.getState?.());
}

test('Atom and main Three.js loops pause off-tab and resume on demand', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect.poll(async () => (await lifecycleState(page))?.atomRunning).toBe(true);
  await expect.poll(async () => (await lifecycleState(page))?.viewerRunning).toBe(false);

  await page.locator('#tab-btn-viewer').click();
  await expect(page.locator('#threejs-canvas-container')).toBeVisible();
  await expect.poll(async () => (await lifecycleState(page))?.atomRunning).toBe(false);
  await expect.poll(async () => (await lifecycleState(page))?.viewerRunning).toBe(true);

  await page.locator('#tab-btn-sandbox').click();
  await expect.poll(async () => (await lifecycleState(page))?.viewerRunning).toBe(false);
  await expect.poll(async () => (await lifecycleState(page))?.beakerFxRunning).toBe(false);

  await page.locator('#tab-btn-atom').click();
  await expect.poll(async () => (await lifecycleState(page))?.atomRunning).toBe(true);
  await expect.poll(async () => (await lifecycleState(page))?.viewerRunning).toBe(false);
});

test('beaker particle loop stays idle without particles and runs only while effects are active', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-sandbox').click();

  await expect.poll(async () => (await lifecycleState(page))?.beakerParticleCount).toBe(0);
  await expect.poll(async () => (await lifecycleState(page))?.beakerFxRunning).toBe(false);

  const effectAvailable = await page.evaluate(() => typeof globalThis.spawnBeakerFX === 'function');
  expect(effectAvailable).toBe(true);
  await page.evaluate(() => globalThis.spawnBeakerFX('bubbles'));

  await expect.poll(async () => (await lifecycleState(page))?.beakerParticleCount).toBeGreaterThan(0);
  await expect.poll(async () => (await lifecycleState(page))?.beakerFxRunning).toBe(true);

  await page.locator('#tab-btn-viewer').click();
  await expect.poll(async () => (await lifecycleState(page))?.beakerFxRunning).toBe(false);

  await page.locator('#tab-btn-sandbox').click();
  await expect.poll(async () => (await lifecycleState(page))?.beakerFxRunning).toBe(true);
});
