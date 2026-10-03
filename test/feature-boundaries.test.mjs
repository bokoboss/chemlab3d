import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_BUILD_TRANSFORMS } from '../src/features/lab/build/index.mjs';
import { applyReactionLab } from '../src/features/lab/build/reaction-lab.mjs';
import { applyReactionSourceUi } from '../src/features/lab/build/reaction-source-ui.mjs';
import { applyCompoundBuilderSemantics } from '../src/features/lab/build/compound-builder-semantics.mjs';
import { MOBILE_UX_BUILD_TRANSFORMS } from '../src/features/mobile-ux/build/index.mjs';
import { ACCESSIBILITY_BUILD_TRANSFORMS } from '../src/features/accessibility/build/index.mjs';
import { CURRENT_APP_TRANSFORMS } from '../scripts/build-app.mjs';

test('Lab feature exposes one stable ordered build boundary', () => {
  assert.equal(LAB_BUILD_TRANSFORMS.length, 3);
  assert.deepEqual(
    LAB_BUILD_TRANSFORMS.map((transform) => transform.name),
    ['applyReactionLab', 'applyReactionSourceUi', 'applyCompoundBuilderSemantics'],
  );
});

test('current app composes Lab, mobile UX and accessibility through feature boundaries', () => {
  const labEnd = LAB_BUILD_TRANSFORMS.length;
  const mobileEnd = labEnd + MOBILE_UX_BUILD_TRANSFORMS.length;

  assert.deepEqual(CURRENT_APP_TRANSFORMS.slice(0, labEnd), LAB_BUILD_TRANSFORMS);
  assert.deepEqual(CURRENT_APP_TRANSFORMS.slice(labEnd, mobileEnd), MOBILE_UX_BUILD_TRANSFORMS);
  assert.deepEqual(CURRENT_APP_TRANSFORMS.slice(mobileEnd), ACCESSIBILITY_BUILD_TRANSFORMS);
});

test('Lab boundary owns all Lab build implementations directly', () => {
  assert.equal(LAB_BUILD_TRANSFORMS[0], applyReactionLab);
  assert.equal(LAB_BUILD_TRANSFORMS[1], applyReactionSourceUi);
  assert.equal(LAB_BUILD_TRANSFORMS[2], applyCompoundBuilderSemantics);
});
