import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { applyViewerUx } from '../src/features/viewer-ux/build/index.mjs';

const sample = `<!doctype html><html><head></head><body>
<section id="tab-viewer"><div class="viewport-toolbar">
  <div class="tool-cluster cluster-style"><div class="segmented-control"></div></div>
  <div class="tool-cluster cluster-analysis"><button id="btn-measure">measure</button></div>
  <div class="tool-cluster cluster-view"><button id="btn-labels">labels</button></div>
</div><div class="info-bar"></div></section>
</body></html>`;

test('viewer UX transform injects mobile control density and contrast rules exactly once', () => {
  const html = applyViewerUx(sample);
  assert.ok(html.includes('CHEMLAB_VIEWER_UX_STYLE'));
  assert.ok(html.includes('CHEMLAB_VIEWER_UX_SCRIPT'));
  assert.ok(html.includes('--text-dim: #7c8aa0'));
  assert.ok(html.includes('chemlab-mobile-3d-tools-open'));
  assert.ok(html.includes('เพิ่มเติม'));
  assert.ok(html.includes('cluster-analysis'));
  assert.throws(() => applyViewerUx(html), /already applied/);
});

test('viewer UX runtime JavaScript is syntactically valid', () => {
  const html = applyViewerUx(sample);
  const match = html.match(/<script id="CHEMLAB_VIEWER_UX_SCRIPT">([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.doesNotThrow(() => new vm.Script(match[1]));
});

test('viewer UX fails fast when document anchors are missing or duplicated', () => {
  assert.throws(() => applyViewerUx('<html><body></body></html>'), /style injection/);
  assert.throws(() => applyViewerUx('<html><head></head><head></head><body></body></html>'), /style injection/);
});

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function luminance(hex) {
  const clean = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => channel(parseInt(clean.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('revised dim text token clears 4.5:1 on the common opaque card reference surface', () => {
  assert.ok(contrast('#7c8aa0', '#101828') >= 4.5);
});
