import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildAppHtml } from '../scripts/build-app.mjs';

test('generated application inline JavaScript is syntactically valid', async () => {
  const html = await buildAppHtml();
  const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .filter((source) => source.trim().length > 0);

  assert.ok(inlineScripts.length > 0, 'expected at least one inline application script');
  const applicationScript = inlineScripts.reduce((largest, source) =>
    source.length > largest.length ? source : largest, '');

  assert.doesNotThrow(() => new vm.Script(applicationScript, { filename: 'generated-chemlab3d.js' }));
});
