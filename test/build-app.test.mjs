import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAppHtml as buildCoreAppHtml } from '../scripts/build-app-core.mjs';
import { buildAppHtml as buildCurrentAppHtml } from '../scripts/build-app.mjs';
import { applyAccessibilityFoundation } from '../src/features/accessibility/build/index.mjs';
import { applyMobileUx } from '../src/features/mobile-ux/build/index.mjs';
import { applyViewerUx } from '../src/features/viewer-ux/build/index.mjs';
import { applyRuntimeLifecycle } from '../src/features/performance/build/index.mjs';
import { applyReactionLab } from '../src/features/lab/build/reaction-lab.mjs';
import { applyReactionSourceUi } from '../src/features/lab/build/reaction-source-ui.mjs';
import { applyCompoundBuilderSemantics } from '../src/features/lab/build/compound-builder-semantics.mjs';

const EXPERIENCE_MARKERS = [
  'id="tab-atom"',
  'id="tab-ptable"',
  'id="tab-viewer"',
  'id="tab-sandbox"',
  'canvas-confetti',
  'function initThree()',
  'function spawnBeakerFX(type)',
  'toggleIsomerSuperimpose()',
];

test('core build preserves accepted experience while replacing legacy electron logic', async () => {
  const html = await buildCoreAppHtml();

  for (const marker of EXPERIENCE_MARKERS) {
    assert.ok(html.includes(marker), `missing preserved experience marker: ${marker}`);
  }

  assert.ok(html.includes('CHEMLAB_CHEMISTRY_CORE_BEGIN'));
  assert.ok(html.includes('function getElectronSubshells('));
  assert.ok(html.includes('return getSpeciesShellPopulation(atomicNumber, electronCount);'));

  assert.equal(html.includes('const maxCapacity = [2, 8, 18, 32, 50];'), false);
  assert.equal(html.includes('function getSubshellElectronConfig(num) {'), false);

  assert.ok(html.includes('calculateBohrShells(atomState.e, atomState.p)'));
  assert.ok(html.includes('renderOrbitalDiagram(atomState.e, atomState.p)'));
});

test('core build keeps neutral call sites backward-compatible', async () => {
  const html = await buildCoreAppHtml();
  assert.ok(html.includes('function calculateBohrShells(electronCount, atomicNumber = electronCount)'));
  assert.ok(html.includes('function getSubshellElectronConfig(electronCount, atomicNumber = electronCount)'));
});

test('current build orchestration is byte-equivalent to the accepted transform order', async () => {
  const coreHtml = await buildCoreAppHtml();
  const expected = applyAccessibilityFoundation(
    applyRuntimeLifecycle(
      applyViewerUx(
        applyMobileUx(
          applyCompoundBuilderSemantics(
            applyReactionSourceUi(
              applyReactionLab(coreHtml),
            ),
          ),
        ),
      ),
    ),
  );
  const actual = await buildCurrentAppHtml();
  assert.equal(actual, expected);
});

test('current build adds mobile learning navigation without replacing accepted top-level tabs', async () => {
  const html = await buildCurrentAppHtml();
  assert.ok(html.includes('CHEMLAB_MOBILE_UX_STYLE'));
  assert.ok(html.includes('id="chemlab-mobile-menu-btn"'));
  assert.ok(html.includes('id="CHEMLAB_MOBILE_PTABLE_NAV"'));
  assert.ok(html.includes('id="tab-btn-atom"'));
  assert.ok(html.includes('id="tab-btn-flashcards"'));
  assert.ok(html.includes('id="ptable-grid-container"'));
});

test('current build reduces mobile 3D control density without removing advanced viewer tools', async () => {
  const html = await buildCurrentAppHtml();
  assert.ok(html.includes('CHEMLAB_VIEWER_UX_STYLE'));
  assert.ok(html.includes('CHEMLAB_VIEWER_UX_SCRIPT'));
  assert.ok(html.includes('chemlab-mobile-3d-tools-open'));
  assert.ok(html.includes('btn-measure'));
  assert.ok(html.includes('btn-labels'));
  assert.ok(html.includes('openIsomerModal()'));
  assert.ok(html.includes('openReactionPathwaysModal()'));
  assert.ok(html.includes('openExportModal()'));
  assert.ok(html.includes('--text-dim: #7c8aa0'));
});

test('current build gates the major idle animation loops without removing the active experiences', async () => {
  const html = await buildCurrentAppHtml();
  assert.ok(html.includes('CHEMLAB_RUNTIME_LIFECYCLE_SCRIPT'));
  assert.ok(html.includes('function ensureAtomAnimation()'));
  assert.ok(html.includes('function ensureViewerAnimation()'));
  assert.ok(html.includes('function ensureBeakerFXAnimation()'));
  assert.ok(html.includes('window.ChemLabRuntimeLifecycle'));
  assert.ok(html.includes('function initThree()'));
  assert.ok(html.includes('function spawnBeakerFX(type)'));
  assert.ok(html.includes('function drawAtomCanvas()'));
});

test('current build adds Reaction Lab beside the preserved Compound Builder', async () => {
  const html = await buildCurrentAppHtml();

  assert.ok(html.includes('id="sb-mode-reactionlab"'));
  assert.ok(html.includes("switchSandboxMode('reactionlab')"));
  assert.ok(html.includes('id="sandbox-view-reactionlab"'));
  assert.ok(html.includes('Reaction Lab'));
  assert.ok(html.includes('Compound Builder'));
  assert.ok(html.includes('const REACTION_LAB_DATA ='));
  assert.ok(html.includes('function initReactionLab()'));
  assert.ok(html.includes('function renderReactionLab()'));
  assert.ok(html.includes('id="reactionlab-sources"'));
  assert.ok(html.includes('รองรับข้อมูล:'));

  // Existing interactive beaker/effects remain in place rather than being replaced.
  assert.ok(html.includes('id="beaker-particles-canvas"'));
  assert.ok(html.includes('function spawnBeakerFX(type)'));
  assert.ok(html.includes('id="reaction-result-box"'));
  assert.ok(html.includes('id="cond-heat"'));
  assert.ok(html.includes('id="cond-elec"'));
  assert.ok(html.includes('id="cond-cat"'));
});

test('current build keeps the wow-factor while removing reaction claims from Compound Builder', async () => {
  const html = await buildCurrentAppHtml();

  assert.ok(html.includes('Compound Builder — แบบจำลองการประกอบสูตร'));
  assert.ok(html.includes('ไม่ใช่การจำลองว่าธาตุเหล่านี้ทำปฏิกิริยากันจริง'));
  assert.ok(html.includes('เอฟเฟกต์ภาพจำลองด้านล่างมีไว้เพื่อการเรียนรู้และความสนุก'));
  assert.ok(html.includes('✅ ประกอบสูตรในแบบจำลองสำเร็จ'));
  assert.ok(html.includes('🧭 แบบจำลองยังไม่รองรับชุดนี้'));
  assert.ok(html.includes('generatedModel: true'));
  assert.ok(html.includes('ค่าประมาณ ionic character ≈'));

  assert.equal(html.includes('🎉 สังเคราะห์สารประกอบสำเร็จ!'), false);
  assert.equal(html.includes('⚠️ ไม่เกิดปฏิกิริยาเคมี (No Reaction)'), false);
  assert.equal(html.includes('ก่อนจุดชนวนปฏิกิริยา'), false);
  assert.equal(html.includes('deltaEN: "1.0"'), false);
});

test('current report is a working Compound Builder worksheet, not an unsourced reaction report', async () => {
  const html = await buildCurrentAppHtml();

  assert.ok(html.includes('📋 ใบงาน Compound Builder (ChemLab 3D)'));
  assert.ok(html.includes('ยังไม่ใช่เอกสารรับรองหลักสูตร'));
  assert.ok(html.includes('beakerConditions.heat'));
  assert.ok(html.includes('เอฟเฟกต์ภาพที่เปิด'));

  assert.equal(html.includes('reactionConditions.'), false);
  assert.equal(html.includes('reactionTemperature'), false);
  assert.equal(html.includes('หลักสูตรวิทยาศาสตร์และเคมี (สสวท.)'), false);
  assert.equal(html.includes('สมการเคมีที่เกิดขึ้น:'), false);
});

test('current collection and quests keep gamification without claiming physical synthesis/discovery', async () => {
  const html = await buildCurrentAppHtml();

  assert.ok(html.includes('คลังสารที่ปลดล็อก (Collection)'));
  assert.ok(html.includes('สมุดสะสมสารประกอบ (Compound Collection)'));
  assert.ok(html.includes('ปลดล็อกแล้ว: 0 / 58'));
  assert.ok(html.includes('ฝึกฝนการประกอบสูตร สำรวจโครงสร้าง และทบทวนแนวคิดเคมีระดับมัธยม'));
});
