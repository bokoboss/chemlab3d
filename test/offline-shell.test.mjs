import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { applyOfflineShell, buildManifest, buildServiceWorker, buildIconSvg } from '../src/features/offline/build/index.mjs';

const sample = `<!doctype html><html><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
</head><body><main>ChemLab</main></body></html>`;

test('offline shell replaces critical CDN scripts with local runtime assets and injects PWA metadata', () => {
  const html = applyOfflineShell(sample);
  assert.ok(html.includes('./vendor/three.r128.min.js'));
  assert.ok(html.includes('./vendor/OrbitControls.r128.js'));
  assert.ok(html.includes('./vendor/confetti.browser.js'));
  assert.ok(html.includes('manifest.webmanifest'));
  assert.ok(html.includes('CHEMLAB_OFFLINE_PWA_REGISTER'));
  assert.equal(html.includes('cdnjs.cloudflare.com/ajax/libs/three.js'), false);
  assert.throws(() => applyOfflineShell(html), /already applied/);
});

test('manifest, service worker and icon sources are valid build artifacts', () => {
  const manifest = JSON.parse(buildManifest());
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.icons[0].type, 'image/svg+xml');
  assert.doesNotThrow(() => new vm.Script(buildServiceWorker()));
  assert.match(buildServiceWorker(), /three\.r128\.min\.js/);
  assert.match(buildServiceWorker(), /confetti\.browser\.js/);
  assert.match(buildIconSvg(), /<svg/);
});
