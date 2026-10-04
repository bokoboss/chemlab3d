import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildAppHtml as buildCoreAppHtml } from '../scripts/build-app-core.mjs';
import { applyReactionLab } from '../src/features/lab/build/reaction-lab.mjs';
import { applyReactionSourceUi } from '../src/features/lab/build/reaction-source-ui.mjs';
import { applyCompoundBuilderSemantics } from '../src/features/lab/build/compound-builder-semantics.mjs';
import { applyMobileUx } from '../src/features/mobile-ux/build/index.mjs';
import { applyViewerUx } from '../src/features/viewer-ux/build/index.mjs';
import { applyRuntimeLifecycle } from '../src/features/performance/build/index.mjs';

async function buildPrePerformanceHtml() {
  const coreHtml = await buildCoreAppHtml();
  return applyViewerUx(
    applyMobileUx(
      applyCompoundBuilderSemantics(
        applyReactionSourceUi(
          applyReactionLab(coreHtml),
        ),
      ),
    ),
  );
}

test('runtime lifecycle patches the three accepted idle loops without removing experience markers', async () => {
  const html = applyRuntimeLifecycle(await buildPrePerformanceHtml());
  for (const marker of ['function initThree()', 'function spawnBeakerFX(type)', 'function drawAtomCanvas()', 'CHEMLAB_VIEWER_UX_STYLE']) {
    assert.ok(html.includes(marker), `missing preserved marker: ${marker}`);
  }
  assert.ok(html.includes('function ensureAtomAnimation()'));
  assert.ok(html.includes('let viewerAnimationId = null;'));
  assert.ok(html.includes('function ensureViewerAnimation()'));
  assert.ok(html.includes('let beakerFxAnimationId = null;'));
  assert.ok(html.includes('function ensureBeakerFXAnimation()'));
  assert.ok(html.includes('window.ChemLabRuntimeLifecycle'));
  assert.equal(html.includes('function animate() {\n    requestAnimationFrame(animate);'), false);
});

test('runtime lifecycle is single-application and fails on incompatible source', async () => {
  const prePerformanceHtml = await buildPrePerformanceHtml();
  const html = applyRuntimeLifecycle(prePerformanceHtml);
  assert.throws(() => applyRuntimeLifecycle(html), /already applied/);
  assert.throws(() => applyRuntimeLifecycle('<html><body></body></html>'), /viewer tab resume hook/);
});

test('injected lifecycle runtime JavaScript is syntactically valid', async () => {
  const html = applyRuntimeLifecycle(await buildPrePerformanceHtml());
  const match = html.match(/<script id="CHEMLAB_RUNTIME_LIFECYCLE_SCRIPT">([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.doesNotThrow(() => new vm.Script(match[1]));
});
