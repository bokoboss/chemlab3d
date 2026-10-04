import { test, expect } from '@playwright/test';

async function states(page) {
  return page.evaluate(() => ({
    primary: globalThis.ChemLabRuntimeLifecycle?.getState?.() || {},
    secondary: globalThis.ChemLabSecondaryRuntimeLifecycle?.getState?.() || {},
    resource: globalThis.ChemLabResourceLifecycle?.getState?.() || {},
  }));
}

function runningCount(snapshot) {
  const p = snapshot.primary;
  const s = snapshot.secondary;
  const r = snapshot.resource;
  return [p.atomRunning, p.viewerRunning, p.beakerFxRunning, s.historyRunning, s.collisionRunning, s.galvanicRunning, r.elementModalRunning, r.isomerRunning].filter(Boolean).length;
}

test('hidden/static modules stay within the continuous-animation budget and WebGL initializes on demand', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect.poll(async () => (await states(page)).resource.viewerInitialized).toBe(false);
  await expect.poll(async () => (await states(page)).resource.historyInitialized).toBe(false);
  await expect.poll(async () => runningCount(await states(page))).toBeLessThanOrEqual(1);

  await page.locator('#tab-btn-ptable').click();
  await expect.poll(async () => runningCount(await states(page))).toBe(0);

  await page.locator('#tab-btn-guide').click();
  await expect.poll(async () => runningCount(await states(page))).toBe(0);

  await page.locator('#tab-btn-viewer').click();
  await expect(page.locator('#threejs-canvas-container canvas').first()).toBeVisible();
  await expect.poll(async () => (await states(page)).resource.viewerInitialized).toBe(true);
  await expect.poll(async () => runningCount(await states(page))).toBeLessThanOrEqual(1);

  await page.locator('#tab-btn-atom').click();
  await expect.poll(async () => (await states(page)).resource.historyInitialized).toBe(false);
  await page.locator('#atom-subtab-history').click();
  await expect.poll(async () => (await states(page)).resource.historyInitialized).toBe(true);
  await expect.poll(async () => (await states(page)).secondary.historyRunning).toBe(true);
  await page.locator('#atom-subtab-studio').click();
  await expect.poll(async () => (await states(page)).secondary.historyRunning).toBe(false);
});

test('isomer animation restarts after close and reopen instead of remaining frozen', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-viewer').click();
  await page.evaluate(() => globalThis.openIsomerModal());
  await expect(page.locator('#isomer-modal')).toBeVisible();
  await expect.poll(async () => (await states(page)).resource.isomerRunning).toBe(true);

  await page.evaluate(() => globalThis.closeIsomerModal());
  await expect.poll(async () => (await states(page)).resource.isomerRunning).toBe(false);

  await page.evaluate(() => globalThis.openIsomerModal());
  await expect.poll(async () => (await states(page)).resource.isomerRunning).toBe(true);
});
