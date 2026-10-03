import { test, expect } from '@playwright/test';

async function attachScreen(page, testInfo, name) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: false }),
    contentType: 'image/png',
  });
}

async function clickTab(page, id, panelId) {
  const button = page.locator(id);
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await expect(page.locator(panelId)).toHaveClass(/active/);
}

test('accepted ChemLab learning experience remains interactive across all core modules', async ({ page }, testInfo) => {
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/ChemLab 3D/i);

  // Atom Studio: preserve canvas-based interactive atom experience.
  await expect(page.locator('#tab-atom')).toHaveClass(/active/);
  await expect(page.locator('#atom-canvas')).toBeVisible();
  const atomBox = await page.locator('#atom-canvas').boundingBox();
  expect(atomBox?.width ?? 0).toBeGreaterThan(200);
  expect(atomBox?.height ?? 0).toBeGreaterThan(150);
  await attachScreen(page, testInfo, '01-atom-studio');

  // Periodic table: all 118 real elements must remain present and interactive.
  await clickTab(page, '#tab-btn-ptable', '#tab-ptable');
  await expect(page.locator('#ptable-grid-container .p-elem:not(.placeholder-elem)')).toHaveCount(118);
  await page.locator('#ptable-grid-container .p-elem:not(.placeholder-elem)').first().click();
  await expect(page.locator('#elem-modal')).toBeVisible();
  await page.keyboard.press('Escape').catch(() => {});
  const modal = page.locator('#elem-modal');
  if (await modal.isVisible()) {
    const closeButton = modal.locator('.modal-close').first();
    if (await closeButton.count()) await closeButton.click();
    else await page.evaluate(() => document.getElementById('elem-modal').style.display = 'none');
  }
  await attachScreen(page, testInfo, '02-periodic-table');

  // 3D Viewer: external Three.js dependency and actual WebGL canvas must initialize.
  await clickTab(page, '#tab-btn-viewer', '#tab-viewer');
  await page.waitForFunction(() => typeof THREE !== 'undefined', null, { timeout: 15_000 });
  const threeCanvas = page.locator('#threejs-canvas-container canvas').first();
  await expect(threeCanvas).toBeVisible({ timeout: 15_000 });
  const threeBox = await threeCanvas.boundingBox();
  expect(threeBox?.width ?? 0).toBeGreaterThan(200);
  expect(threeBox?.height ?? 0).toBeGreaterThan(180);
  await attachScreen(page, testInfo, '03-molecule-3d');

  // Sandbox: preserve lab station navigation and animated beaker canvas.
  await clickTab(page, '#tab-btn-sandbox', '#tab-sandbox');
  await expect(page.locator('.sandbox-station-nav')).toBeVisible();
  await expect(page.locator('#beaker-particles-canvas')).toBeVisible();
  const beakerBox = await page.locator('#beaker-particles-canvas').boundingBox();
  expect(beakerBox?.width ?? 0).toBeGreaterThan(150);
  await attachScreen(page, testInfo, '04-sandbox');

  // Quests and curriculum guide: preserve learning/practice surfaces.
  await clickTab(page, '#tab-btn-quests', '#tab-quests');
  await expect(page.locator('#quest-cards-container .quest-card').first()).toBeVisible();
  expect(await page.locator('#quest-cards-container .quest-card').count()).toBeGreaterThan(0);
  await attachScreen(page, testInfo, '05-quests');

  await clickTab(page, '#tab-btn-guide', '#tab-guide');
  await expect(page.locator('#tab-guide .guide-container')).toBeVisible();
  await expect(page.locator('#tab-guide .grade-section').first()).toBeVisible();
  await attachScreen(page, testInfo, '06-curriculum-guide');

  expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  expect(consoleErrors, `console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
});
