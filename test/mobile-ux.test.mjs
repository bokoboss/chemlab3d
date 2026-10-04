import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { applyMobileUx } from '../src/features/mobile-ux/build/index.mjs';

const sample = `<!doctype html>
<html>
<head><style>:root{--accent-cyan:#0ff}</style></head>
<body>
<header>
  <div class="brand" onclick="switchTab('atom')">ChemLab</div>
  <!-- Navigation Tabs -->
  <nav class="nav-tabs">
    <button id="tab-btn-atom" class="nav-tab active"><span>⚛️</span><span>อะตอม</span></button>
    <button id="tab-btn-ptable" class="nav-tab"><span>🧪</span><span>ตารางธาตุ</span></button>
    <button id="tab-btn-viewer" class="nav-tab"><span>🧬</span><span>โมเลกุล 3D</span></button>
    <button id="tab-btn-sandbox" class="nav-tab"><span>⚗️</span><span>Lab</span></button>
    <button id="tab-btn-quests" class="nav-tab"><span>🎯</span><span>ภารกิจ</span></button>
    <button id="tab-btn-guide" class="nav-tab"><span>📘</span><span>คู่มือ</span></button>
    <button id="tab-btn-flashcards" class="nav-tab"><span>🃏</span><span>Flashcards</span></button>
  </nav>
</header>
<section class="tab-content" id="tab-atom">Atom</section>
<section class="tab-content" id="tab-ptable"><div class="ptable-container">Periodic table</div></section>
<section class="tab-content" id="tab-viewer">Viewer</section>
<section class="tab-content" id="tab-sandbox">Lab</section>
</body>
</html>`;

test('mobile UX transform injects navigation aids exactly once and preserves original navigation', () => {
  const html = applyMobileUx(sample);
  assert.ok(html.includes('CHEMLAB_MOBILE_UX_STYLE'));
  assert.ok(html.includes('CHEMLAB_MOBILE_LEARNING_MENU'));
  assert.ok(html.includes('CHEMLAB_MOBILE_PTABLE_NAV'));
  assert.ok(html.includes('CHEMLAB_MOBILE_UX_SCRIPT'));
  assert.ok(html.includes('id="tab-btn-atom"'));
  assert.ok(html.includes('id="tab-btn-flashcards"'));
  assert.ok(html.includes('<nav class="nav-tabs">'));
  assert.throws(() => applyMobileUx(html), /mobile UX already applied/);
});

test('mobile learning overview groups all accepted top-level destinations without replacing the original tabs', () => {
  const html = applyMobileUx(sample);
  assert.ok(html.includes('🧭 เส้นทางการเรียนรู้'));
  assert.ok(html.includes("{ title: 'เรียนรู้หลัก', ids: ['tab-btn-atom', 'tab-btn-ptable', 'tab-btn-viewer', 'tab-btn-sandbox'] }"));
  assert.ok(html.includes("{ title: 'ฝึกฝนและทบทวน', ids: ['tab-btn-quests', 'tab-btn-guide', 'tab-btn-flashcards'] }"));
  assert.ok(html.includes("item.dataset.chemlabSourceNav = id"));
  assert.ok(html.includes('requestAnimationFrame(() => source.click())'));
});

test('periodic-table mobile navigator offers start, center and end jumps while keeping the full table', () => {
  const html = applyMobileUx(sample);
  assert.ok(html.includes('data-chemlab-ptable-position="start"'));
  assert.ok(html.includes('data-chemlab-ptable-position="center"'));
  assert.ok(html.includes('data-chemlab-ptable-position="end"'));
  assert.ok(html.includes('หมู่ 1–2'));
  assert.ok(html.includes('หมู่ 3–12'));
  assert.ok(html.includes('หมู่ 13–18'));
  assert.ok(html.includes('<div class="ptable-container">Periodic table</div>'));
  assert.ok(html.includes("const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches"));
});

test('mobile UX runtime JavaScript is syntactically valid', () => {
  const html = applyMobileUx(sample);
  const match = html.match(/<script id="CHEMLAB_MOBILE_UX_SCRIPT">([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.doesNotThrow(() => new vm.Script(match[1]));
});

test('mobile UX transform fails fast when required document anchors are missing or ambiguous', () => {
  assert.throws(() => applyMobileUx('<html><head></head><body></body></html>'), /mobile learning menu trigger/);
  const duplicateNav = sample.replace('<!-- Navigation Tabs -->', '<!-- Navigation Tabs --><!-- Navigation Tabs -->');
  assert.throws(() => applyMobileUx(duplicateNav), /mobile learning menu trigger/);
});
