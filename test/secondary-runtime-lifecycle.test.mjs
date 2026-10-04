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

async function buildPrimaryPerformanceHtml() {
  const coreHtml = await buildCoreAppHtml();
  const prePerformance = applyViewerUx(
    applyMobileUx(
      applyCompoundBuilderSemantics(
        applyReactionSourceUi(
          applyReactionLab(coreHtml),
        ),
      ),
    ),
  );
  return applyPrimaryRuntimeLifecycle(prePerformance);
}

test('secondary lifecycle gates historical, collision and galvanic loops without removing accepted experiences', async () => {
  const html = applySecondaryRuntimeLifecycle(await buildPrimaryPerformanceHtml());
  for (const marker of [
    'function ensureHistoryAnimation()',
    'function ensureCollisionAnimation()',
    'function ensureGalvanicAnimation()',
    'CHEMLAB_SECONDARY_RUNTIME_LIFECYCLE_SCRIPT',
    'function initThree()',
    'function spawnBeakerFX(type)',
  ]) assert.ok(html.includes(marker), `missing marker: ${marker}`);

  assert.equal(html.includes('function animateHistory3D() {\n    historyAnimId = requestAnimationFrame(animateHistory3D);'), false);
  assert.equal(html.includes('function animateCollisionTheory() {\n    collisionAnimId = requestAnimationFrame(animateCollisionTheory);'), false);
  assert.equal(html.includes('function animateGalvanicCell() {\n    galvanicAnimId = requestAnimationFrame(animateGalvanicCell);'), false);
});

test('secondary lifecycle is single-application and injected runtime is syntactically valid', async () => {
  const primaryHtml = await buildPrimaryPerformanceHtml();
  const html = applySecondaryRuntimeLifecycle(primaryHtml);
  assert.throws(() => applySecondaryRuntimeLifecycle(html), /already applied/);
  const match = html.match(/<script id="CHEMLAB_SECONDARY_RUNTIME_LIFECYCLE_SCRIPT">([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.doesNotThrow(() => new vm.Script(match[1]));
});
