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

  // Existing interactive beaker/effects remain in place rather than being replaced.
  assert.ok(html.includes('id="beaker-particles-canvas"'));
  assert.ok(html.includes('function spawnBeakerFX(type)'));
  assert.ok(html.includes('id="reaction-result-box"'));
});

test('Phase 2 build exposes reaction provenance in the learner-facing UI', async () => {
  const html = await buildPhase2AppHtml();

  assert.ok(html.includes('id="reactionlab-sources"'));
  assert.ok(html.includes('const REACTION_SOURCE_DATA ='));
  assert.ok(html.includes('const REACTION_SOURCE_IDS_BY_REACTION ='));
  assert.ok(html.includes('function renderReactionLabSources('));
  assert.ok(html.includes('แหล่งอ้างอิงของปฏิกิริยานี้'));
  assert.ok(html.includes('target="_blank"'));
  assert.ok(html.includes('rel="noopener noreferrer"'));
});
