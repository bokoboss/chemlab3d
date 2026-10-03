import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { applyAccessibilityFoundation } from '../src/features/accessibility/build/index.mjs';
import { buildAppHtml } from '../scripts/build-app.mjs';

const sample = '<!doctype html><html><head><style>:root{--accent-cyan:#0ff}</style></head><body><button id="tab-atom">Atom</button><div onclick="go()">Go</div><div id="sample-modal" style="display:none"><h2>Dialog</h2><button onclick="closeIt()">Close</button></div></body></html>';

test('accessibility transform injects the foundation exactly once and preserves existing markup', () => {
  const html = applyAccessibilityFoundation(sample);
  assert.ok(html.includes('CHEMLAB_ACCESSIBILITY_FOUNDATION_STYLE'));
  assert.ok(html.includes('CHEMLAB_ACCESSIBILITY_FOUNDATION_SCRIPT'));
  assert.ok(html.includes('class="chemlab-skip-link"'));
  assert.ok(html.includes('prefers-reduced-motion: reduce'));
  assert.ok(html.includes('id="tab-atom"'));
  assert.ok(html.includes('onclick="go()"'));
  assert.throws(() => applyAccessibilityFoundation(html), /already applied/);
});

test('accessibility runtime JavaScript is syntactically valid', () => {
  const html = applyAccessibilityFoundation(sample);
  const match = html.match(/<script id="CHEMLAB_ACCESSIBILITY_FOUNDATION_SCRIPT">([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.doesNotThrow(() => new vm.Script(match[1]));
});

test('accessibility transform fails fast when document anchors are missing or duplicated', () => {
  assert.throws(() => applyAccessibilityFoundation('<html><body></body></html>'), /style injection/);
  assert.throws(() => applyAccessibilityFoundation('<html><head></head><head></head><body></body></html>'), /style injection/);
});

test('current app build includes accessibility behavior while preserving the accepted experience', async () => {
  const html = await buildAppHtml();
  assert.ok(html.includes('CHEMLAB_ACCESSIBILITY_FOUNDATION_STYLE'));
  assert.ok(html.includes('CHEMLAB_ACCESSIBILITY_FOUNDATION_SCRIPT'));
  assert.ok(html.includes('function initThree()'));
  assert.ok(html.includes('function spawnBeakerFX(type)'));
  assert.ok(html.includes('Reaction Lab'));
  assert.ok(html.includes('Compound Builder'));
});
