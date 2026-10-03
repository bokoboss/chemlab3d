import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { restoreAcceptedBaseline } from '../scripts/baseline.mjs';

const EXPECTED_BYTES = 644_997;
const EXPECTED_SHA256 = '3fd0d17583d07ccfdded08daed5d753f2adaf232a8da6a0a995bef1afcf6220f';

const REQUIRED_EXPERIENCE_MARKERS = [
  'ChemLab 3D',
  'id="tab-atom"',
  'id="tab-ptable"',
  'id="tab-viewer"',
  'id="tab-sandbox"',
  'id="tab-quests"',
  'id="tab-guide"',
  'three.min.js',
  'OrbitControls.js',
  'canvas-confetti',
  'function initThree()',
  'function spawnBeakerFX(type)',
  'openFlashcardModal()',
  'toggleIsomerSuperimpose()',
];

test('accepted prototype archive restores byte-for-byte', async () => {
  const baseline = await restoreAcceptedBaseline();
  assert.equal(baseline.length, EXPECTED_BYTES);
  assert.equal(createHash('sha256').update(baseline).digest('hex'), EXPECTED_SHA256);
});

test('accepted prototype keeps the interaction-rich experience markers', async () => {
  const html = (await restoreAcceptedBaseline()).toString('utf8');
  for (const marker of REQUIRED_EXPERIENCE_MARKERS) {
    assert.ok(html.includes(marker), `missing accepted-experience marker: ${marker}`);
  }
});
