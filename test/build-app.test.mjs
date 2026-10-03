import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAppHtml } from '../scripts/build-app.mjs';

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
  const html = await buildAppHtml();

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
  const html = await buildAppHtml();
  assert.ok(html.includes('function calculateBohrShells(electronCount, atomicNumber = electronCount)'));
  assert.ok(html.includes('function getSubshellElectronConfig(electronCount, atomicNumber = electronCount)'));
});
