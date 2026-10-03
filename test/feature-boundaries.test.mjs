import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_BUILD_TRANSFORMS } from '../src/features/lab/build/index.mjs';
import { applyReactionLab as featureReactionLab } from '../src/features/lab/build/reaction-lab.mjs';
import { applyReactionSourceUi as featureReactionSourceUi } from '../src/features/lab/build/reaction-source-ui.mjs';
import { applyCompoundBuilderSemantics as featureCompoundBuilderSemantics } from '../src/features/lab/build/compound-builder-semantics.mjs';
import { applyReactionLab as compatibilityReactionLab } from '../scripts/reaction-lab-build.mjs';
import { applyReactionSourceUi as compatibilityReactionSourceUi } from '../scripts/reaction-source-ui-build.mjs';
import { applyCompoundBuilderSemantics as compatibilityCompoundBuilderSemantics } from '../scripts/compound-builder-semantics-build.mjs';
import { CURRENT_APP_TRANSFORMS } from '../scripts/build-app.mjs';

test('Lab feature exposes one stable ordered build boundary', () => {
  assert.equal(LAB_BUILD_TRANSFORMS.length, 3);
  assert.deepEqual(
    LAB_BUILD_TRANSFORMS.map((transform) => transform.name),
    ['applyReactionLab', 'applyReactionSourceUi', 'applyCompoundBuilderSemantics'],
  );
});

test('current app consumes Lab transforms through the feature boundary', () => {
  assert.deepEqual(CURRENT_APP_TRANSFORMS, LAB_BUILD_TRANSFORMS);
});

test('Lab build implementations live behind the feature boundary while old paths remain compatibility shims', () => {
  assert.equal(compatibilityReactionLab, featureReactionLab);
  assert.equal(compatibilityReactionSourceUi, featureReactionSourceUi);
  assert.equal(compatibilityCompoundBuilderSemantics, featureCompoundBuilderSemantics);
  assert.equal(LAB_BUILD_TRANSFORMS[0], featureReactionLab);
  assert.equal(LAB_BUILD_TRANSFORMS[1], featureReactionSourceUi);
  assert.equal(LAB_BUILD_TRANSFORMS[2], featureCompoundBuilderSemantics);
});
