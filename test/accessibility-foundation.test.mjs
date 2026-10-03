import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { applyAccessibilityFoundation } from '../src/features/accessibility/build/index.mjs';
import { buildAppHtml } from '../scripts/build-app.mjs';

const sample = '<!doctype html><html><head><style>:root{--accent-cyan:#0ff}</style></head><body><header><div class="level-bar"><span class="level-label">ชั้น:</span><button class="level-pill active" onclick="setFilterLevel(\'all\')">ทั้งหมด</button><button class="level-pill" onclick="setFilterLevel(\'ม.4\')">ม.4</button></div></header><main><button id="tab-atom">Atom</button><div onclick="go()">Go</div><div id="molecule-list-container"></div><div id="sample-modal" style="display:none"><h2>Dialog</h2><button onclick="closeIt()">Close</button></div></main></body></html>';

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

test('grade-level control states its molecule-list scope instead of implying an app-wide filter', () => {
  const html = applyAccessibilityFoundation(sample);
  assert.ok(html.includes('id="chemlab-level-filter-label">กรองโมเลกุล:</span>'));
  assert.ok(html.includes('ตัวกรองนี้มีผลเฉพาะรายการโมเลกุลในแท็บโมเลกุล 3D ไม่ได้เปลี่ยนเนื้อหาทั้งแอป'));
  assert.ok(html.includes('role="group" aria-labelledby="chemlab-level-filter-label"'));
  assert.ok(html.includes("button.setAttribute('aria-controls', 'molecule-list-container')"));
  assert.ok(html.includes("button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false')"));
});

test('accessibility runtime includes keyboard-scroll support and is syntactically valid', () => {
  const html = applyAccessibilityFoundation(sample);
  const match = html.match(/<script id="CHEMLAB_ACCESSIBILITY_FOUNDATION_SCRIPT">([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.ok(match[1].includes('HORIZONTAL_SCROLL_SELECTOR'));
  assert.ok(match[1].includes('enhanceHorizontalScrollRegions'));
  assert.ok(match[1].includes("event.key !== 'ArrowLeft' && event.key !== 'ArrowRight'"));
  assert.doesNotThrow(() => new vm.Script(match[1]));
});

test('accessibility transform fails fast when document anchors are missing or duplicated', () => {
  assert.throws(() => applyAccessibilityFoundation('<html><body></body></html>'), /level filter group/);
  assert.throws(() => applyAccessibilityFoundation('<html><head></head><head></head><body><div class="level-bar"><span class="level-label">ชั้น:</span></div></body></html>'), /style injection/);
});

test('current app build includes accessibility behavior while preserving the accepted experience', async () => {
  const html = await buildAppHtml();
  assert.ok(html.includes('CHEMLAB_ACCESSIBILITY_FOUNDATION_STYLE'));
  assert.ok(html.includes('CHEMLAB_ACCESSIBILITY_FOUNDATION_SCRIPT'));
  assert.ok(html.includes('กรองโมเลกุล:'));
  assert.ok(html.includes('dataset.chemlabScrollRegion'));
  assert.ok(html.includes('function initThree()'));
  assert.ok(html.includes('function spawnBeakerFX(type)'));
  assert.ok(html.includes('Reaction Lab'));
  assert.ok(html.includes('Compound Builder'));
});
