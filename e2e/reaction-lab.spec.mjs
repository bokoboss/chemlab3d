import { test, expect } from '@playwright/test';

async function attachScreen(page, testInfo, name) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: false }),
    contentType: 'image/png',
  });
}

test('Reaction Lab is distinct from Compound Builder while preserving the original beaker experience', async ({ page }, testInfo) => {
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-btn-sandbox').scrollIntoViewIfNeeded();
  await page.locator('#tab-btn-sandbox').click();
  await expect(page.locator('#tab-sandbox')).toHaveClass(/active/);

  // Compound Builder remains the default and keeps the accepted beaker canvas/effects surface.
  await expect(page.locator('#sb-mode-beaker')).toHaveClass(/active/);
  await expect(page.locator('#sb-mode-beaker')).toContainText('Compound Builder');
  await expect(page.locator('#beaker-particles-canvas')).toBeVisible();
  await expect(page.locator('#reaction-result-box')).toBeAttached();
  await attachScreen(page, testInfo, 'phase2-01-compound-builder');

  // Reaction Lab is a distinct mode using balanced reaction records.
  await page.locator('#sb-mode-reactionlab').click();
  await expect(page.locator('#sandbox-view-reactionlab')).toBeVisible();
  await expect(page.locator('#reactionlab-select option')).toHaveCount(8);
  await expect(page.locator('#reactionlab-equation')).toHaveText('2H₂ + O₂ → 2H₂O');
  await expect(page.locator('#reactionlab-balance-badge')).toContainText('อะตอมสมดุล');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('H: 4 = 4');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('O: 2 = 2');

  // Unknown factual metadata is shown as unknown rather than guessed.
  await expect(page.locator('#reactionlab-state-status')).toContainText('รอแหล่งอ้างอิง');
  await expect(page.locator('#reactionlab-condition-status')).toContainText('รอแหล่งอ้างอิง');
  await expect(page.locator('#reactionlab-catalyst-status')).toContainText('รอแหล่งอ้างอิง');
  await expect(page.locator('#reactionlab-thermo-status')).toContainText('รอแหล่งอ้างอิง');
  await attachScreen(page, testInfo, 'phase2-02-reaction-lab');

  // Switching reactions updates the balanced equation from the validated library.
  await page.locator('#reactionlab-select').selectOption('methane-combustion');
  await expect(page.locator('#reactionlab-equation')).toHaveText('CH₄ + 2O₂ → CO₂ + 2H₂O');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('C: 1 = 1');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('H: 4 = 4');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('O: 4 = 4');

  // Symbolic preview keeps the satisfying feedback but does not replace chemistry truth.
  const visualStage = page.locator('#reactionlab-visual-stage');
  await page.getByRole('button', { name: /แสดงภาพสัญลักษณ์ของสมการ/ }).click();
  await expect(visualStage).toBeVisible();

  // Return to Compound Builder and prove the original beaker experience is still available.
  await page.locator('#sb-mode-beaker').click();
  await expect(page.locator('#sandbox-view-beaker')).toBeVisible();
  await expect(page.locator('#beaker-particles-canvas')).toBeVisible();
  await attachScreen(page, testInfo, 'phase2-03-compound-builder-return');

  expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  expect(consoleErrors, `console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
});
