import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildAppHtml as buildCoreAppHtml } from '../scripts/build-app-core.mjs';
import { applyReactionLab } from '../src/features/lab/build/reaction-lab.mjs';
import { applyReactionSourceUi } from '../src/features/lab/build/reaction-source-ui.mjs';
import { applyCompoundBuilderSemantics } from '../src/features/lab/build/compound-builder-semantics.mjs';
import { applyMobileUx } from '../src/features/mobile-ux/build/index.mjs';
import { applyViewerUx } from '../src/features/viewer-ux/build/index.mjs';
import { applyRuntimeLifecycle as applyPrimaryRuntimeLifecycle } from '../src/features/performance/build/runtime-lifecycle.mjs';
import { applySecondaryRuntimeLifecycle } from '../src/features/performance/build/secondary-lifecycle.mjs';
import { applyResourceLifecycle } from '../src/features/performance/build/resource-lifecycle.mjs';

async function buildPreResourceHtml() {
  const coreHtml = await buildCoreAppHtml();
  const prePerformance = applyViewerUx(applyMobileUx(applyCompoundBuilderSemantics(applyReactionSourceUi(applyReactionLab(coreHtml)))));
  return applySecondaryRuntimeLifecycle(applyPrimaryRuntimeLifecycle(prePerformance));
}

test('resource lifecycle lazily initializes hidden WebGL resources and repairs modal animation resume', async () => {
  const html = applyResourceLifecycle(await buildPreResourceHtml());
  assert.ok(html.includes('Three.js viewer initializes on first Viewer visit'));
  assert.ok(html.includes('Historical Three.js is initialized on first History visit'));
  assert.ok(html.includes("if (!renderer && typeof THREE !== 'undefined') initThree();"));
  assert.ok(html.includes('function ensureIsomerAnimation()'));
  assert.ok(html.includes('CHEMLAB_RESOURCE_LIFECYCLE_SCRIPT'));
  assert.ok(html.includes('viewerInitialized'));
  assert.ok(html.includes('historyInitialized'));
  assert.equal(html.includes('try { initThree(); } catch (e) { console.error("Error in initThree:", e); }'), false);
});

test('resource lifecycle is single-application and injected runtime is syntactically valid', async () => {
  const pre = await buildPreResourceHtml();
  const html = applyResourceLifecycle(pre);
  assert.throws(() => applyResourceLifecycle(html), /already applied/);
  const match = html.match(/<script id="CHEMLAB_RESOURCE_LIFECYCLE_SCRIPT">([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.doesNotThrow(() => new vm.Script(match[1]));
});
