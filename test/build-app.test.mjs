import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAppHtml as buildPhase1AppHtml } from '../scripts/build-app.mjs';
import { buildAppHtml as buildPhase2AppHtml } from '../scripts/build-app-phase2.mjs';

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

test('Phase 1 build preserves accepted experience while replacing legacy electron logic', async () => {
  const html = await buildPhase1AppHtml();

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

test('Phase 1 build keeps neutral call sites backward-compatible', async () => {
  const html = await buildPhase1AppHtml();
  assert.ok(html.includes('function calculateBohrShells(electronCount, atomicNumber = electronCount)'));
  assert.ok(html.includes('function getSubshellElectronConfig(electronCount, atomicNumber = electronCount)'));
});

test('Phase 2 build adds Reaction Lab beside the preserved Compound Builder', async () => {
  const html = await buildPhase2AppHtml();

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

test('Phase 2 keeps the wow-factor while removing reaction claims from Compound Builder', async () => {
  const html = await buildPhase2AppHtml();

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

test('Phase 2 report is a working Compound Builder worksheet, not an unsourced reaction report', async () => {
  const html = await buildPhase2AppHtml();

  assert.ok(html.includes('📋 ใบงาน Compound Builder (ChemLab 3D)'));
  assert.ok(html.includes('ยังไม่ใช่เอกสารรับรองหลักสูตร'));
  assert.ok(html.includes('beakerConditions.heat'));
  assert.ok(html.includes('เอฟเฟกต์ภาพที่เปิด'));

  assert.equal(html.includes('reactionConditions.'), false);
  assert.equal(html.includes('reactionTemperature'), false);
  assert.equal(html.includes('หลักสูตรวิทยาศาสตร์และเคมี (สสวท.)'), false);
  assert.equal(html.includes('สมการเคมีที่เกิดขึ้น:'), false);
});

test('Phase 2 collection and quests keep gamification without claiming physical synthesis/discovery', async () => {
  const html = await buildPhase2AppHtml();

  assert.ok(html.includes('คลังสารที่ปลดล็อก (Collection)'));
  assert.ok(html.includes('สมุดสะสมสารประกอบ (Compound Collection)'));
  assert.ok(html.includes('ปลดล็อกแล้ว: 0 / 58'));
  assert.ok(html.includes('ฝึกฝนการประกอบสูตร สำรวจโครงสร้าง และทบทวนแนวคิดเคมีระดับมัธยม'));
});
