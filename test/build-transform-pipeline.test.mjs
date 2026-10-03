import test from 'node:test';
import assert from 'node:assert/strict';
import { applyBuildTransforms } from '../scripts/build-transform-pipeline.mjs';

test('build transform pipeline applies transforms in order', () => {
  const result = applyBuildTransforms('A', [
    (html) => `${html}B`,
    (html) => `${html}C`,
    (html) => `${html}D`,
  ]);
  assert.equal(result, 'ABCD');
});

test('build transform pipeline accepts an empty transform list', () => {
  assert.equal(applyBuildTransforms('<html></html>', []), '<html></html>');
});

test('build transform pipeline rejects invalid input, transform entries and outputs', () => {
  assert.throws(() => applyBuildTransforms(null, []), /HTML string/);
  assert.throws(() => applyBuildTransforms('x', null), /array/);
  assert.throws(() => applyBuildTransforms('x', [null]), /must be a function/);
  assert.throws(() => applyBuildTransforms('x', [() => null]), /must return an HTML string/);
});
