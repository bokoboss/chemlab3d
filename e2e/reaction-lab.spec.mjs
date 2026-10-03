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
  await expect(page.locator('#sandbox-view-beaker')).toContainText('ไม่ใช่การจำลองว่าธาตุเหล่านี้ทำปฏิกิริยากันจริง');
  await expect(page.locator('#cond-heat')).toContainText('เอฟเฟกต์ความร้อน');
  await expect(page.locator('#cond-elec')).toContainText('เอฟเฟกต์ไฟฟ้า');
  await expect(page.locator('#cond-cat')).toContainText('เอฟเฟกต์ตัวเร่ง');
  await attachScreen(page, testInfo, 'phase2-01-compound-builder');

  // The printable workflow is preserved, but it is now an academically safe worksheet.
  const labReportButton = page.locator('#sandbox-view-beaker button').filter({ hasText: 'รายงานแล็บ' }).first();
  await labReportButton.click();
  await expect(page.locator('#lab-report-modal')).toBeVisible();
  await expect(page.locator('#lab-report-printable-area')).toContainText('ใบงาน Compound Builder');
  await expect(page.locator('#lab-report-printable-area')).toContainText('ยังไม่ใช่เอกสารรับรองหลักสูตร');
  await expect(page.locator('#lab-report-printable-area')).not.toContainText('สมการเคมีที่เกิดขึ้น');
  await page.locator('#lab-report-modal .modal-close').click();
  await expect(page.locator('#lab-report-modal')).toBeHidden();

  // Reaction Lab is a distinct mode using balanced, sourced reaction records.
  await page.locator('#sb-mode-reactionlab').click();
  await expect(page.locator('#sandbox-view-reactionlab')).toBeVisible();
  await expect(page.locator('#reactionlab-select option')).toHaveCount(8);
  await expect(page.locator('#reactionlab-equation')).toHaveText('2H₂(g) + O₂(g) → 2H₂O(l)');
  await expect(page.locator('#reactionlab-balance-badge')).toContainText('อะตอมสมดุล');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('H: 4 = 4');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('O: 2 = 2');

  // Physical states have provenance; unsupported facts remain explicitly unknown.
  await expect(page.locator('#reactionlab-state-status')).toContainText('มีข้อมูลอ้างอิง');
  await expect(page.locator('#reactionlab-condition-status')).toContainText('รอแหล่งอ้างอิง');
  await expect(page.locator('#reactionlab-catalyst-status')).toContainText('รอแหล่งอ้างอิง');
  await expect(page.locator('#reactionlab-thermo-status')).toContainText('รอแหล่งอ้างอิง');

  const sourceLinks = page.locator('#reactionlab-sources a');
  await expect(sourceLinks).toHaveCount(1);
  await expect(sourceLinks.first()).toContainText('Chemistry LibreTexts');
  await expect(sourceLinks.first()).toHaveAttribute('href', /chem\.libretexts\.org/);
  await expect(sourceLinks.first()).toHaveAttribute('target', '_blank');
  await expect(sourceLinks.first()).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('#reactionlab-sources')).toContainText('รองรับข้อมูล: สมการ • สถานะสาร');
  await attachScreen(page, testInfo, 'phase2-02-reaction-lab');

  // Switching reactions updates the balanced equation and its source from the validated library.
  await page.locator('#reactionlab-select').selectOption('methane-combustion');
  await expect(page.locator('#reactionlab-equation')).toHaveText('CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('C: 1 = 1');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('H: 4 = 4');
  await expect(page.locator('#reactionlab-balance-grid')).toContainText('O: 4 = 4');
  await expect(page.locator('#reactionlab-sources')).toContainText('OpenStax');
  await expect(page.locator('#reactionlab-sources a').first()).toHaveAttribute('href', /openstax\.org/);

  // A reaction with a sourced condition exposes it and the source declares condition support.
  await page.locator('#reactionlab-select').selectOption('calcium-carbonate-decomposition');
  await expect(page.locator('#reactionlab-equation')).toHaveText('CaCO₃(s) → CaO(s) + CO₂(g)');
  await expect(page.locator('#reactionlab-condition-status')).toContainText('thermal decomposition');
  await expect(page.locator('#reactionlab-catalyst-status')).toContainText('รอแหล่งอ้างอิง');
  await expect(page.locator('#reactionlab-thermo-status')).toContainText('รอแหล่งอ้างอิง');
  await expect(page.locator('#reactionlab-sources')).toContainText('เงื่อนไข');

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
