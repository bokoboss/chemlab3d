import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_BUILD_TRANSFORMS } from '../src/features/lab/build/index.mjs';
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
