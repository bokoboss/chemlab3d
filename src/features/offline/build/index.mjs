import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HEAD_MARKER = 'CHEMLAB_OFFLINE_PWA_HEAD';
const SCRIPT_MARKER = 'CHEMLAB_OFFLINE_PWA_REGISTER';
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function countOccurrences(source, needle) {
  let count = 0;
  let position = 0;
  while ((position = source.indexOf(needle, position)) !== -1) {
    count += 1;
    position += needle.length;
  }
  return count;
}

function replaceExpected(source, needle, replacement, label) {
  const count = countOccurrences(source, needle);
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(needle, replacement);
}

export function applyOfflineShell(html) {
  if (html.includes(HEAD_MARKER) || html.includes(SCRIPT_MARKER)) throw new Error('offline shell already applied');

  html = replaceExpected(html, 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', './vendor/three.r128.min.js', 'Three.js local runtime');
  html = replaceExpected(html, 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', './vendor/OrbitControls.r128.js', 'OrbitControls local runtime');
  html = replaceExpected(html, 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js', './vendor/confetti.browser.js', 'canvas-confetti local runtime');

  const head = `<meta id="${HEAD_MARKER}" name="theme-color" content="#08111f">\n  <link rel="manifest" href="./manifest.webmanifest">`;
  html = replaceExpected(html, '</head>', `${head}\n</head>`, 'PWA head injection');

  const registration = `<script id="${SCRIPT_MARKER}">\n(() => {\n  const localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';\n  if ('serviceWorker' in navigator && (location.protocol === 'https:' || localHost)) {\n    window.addEventListener('load', () => {\n      navigator.serviceWorker.register('./service-worker.js').catch((error) => {\n        console.warn('ChemLab offline service worker registration failed:', error);\n      });\n    }, { once: true });\n  }\n})();\n</script>`;
  html = replaceExpected(html, '</body>', `${registration}\n</body>`, 'service worker registration');
  return html;
}

export function buildManifest() {
  return JSON.stringify({
    name: 'ChemLab 3D — Interactive Chemistry Learning',
    short_name: 'ChemLab 3D',
    description: 'Interactive chemistry learning web app for secondary-school learners.',
    start_url: './',
    scope: './',
    display: 'standalone',
    background_color: '#08111f',
    theme_color: '#08111f',
    icons: [
      { src: './chemlab-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
    ],
  }, null, 2) + '\n';
}

export function buildServiceWorker() {
  return `const CORE_CACHE = 'chemlab3d-core-v1';\nconst RUNTIME_CACHE = 'chemlab3d-runtime-v1';\nconst CORE_PATHS = [\n  './',\n  './index.html',\n  './manifest.webmanifest',\n  './chemlab-icon.svg',\n  './vendor/three.r128.min.js',\n  './vendor/OrbitControls.r128.js',\n  './vendor/confetti.browser.js',\n];\n\nfunction scoped(path) {\n  return new URL(path, self.registration.scope).href;\n}\n\nself.addEventListener('install', (event) => {\n  event.waitUntil(\n    caches.open(CORE_CACHE)\n      .then((cache) => cache.addAll(CORE_PATHS.map(scoped)))\n      .then(() => self.skipWaiting()),\n  );\n});\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil(\n    caches.keys()\n      .then((keys) => Promise.all(keys.filter((key) => ![CORE_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))))\n      .then(() => self.clients.claim()),\n  );\n});\n\nself.addEventListener('fetch', (event) => {\n  if (event.request.method !== 'GET') return;\n\n  if (event.request.mode === 'navigate') {\n    event.respondWith((async () => {\n      try {\n        const fresh = await fetch(event.request);\n        const cache = await caches.open(CORE_CACHE);\n        cache.put(scoped('./index.html'), fresh.clone());\n        return fresh;\n      } catch {\n        return (await caches.match(scoped('./index.html'))) || (await caches.match(scoped('./')));\n      }\n    })());\n    return;\n  }\n\n  event.respondWith((async () => {\n    const cacheName = new URL(event.request.url).origin === self.location.origin ? CORE_CACHE : RUNTIME_CACHE;\n    const cache = await caches.open(cacheName);\n    const cached = await cache.match(event.request);\n    if (cached) {\n      event.waitUntil(fetch(event.request).then((response) => {\n        if (response && (response.ok || response.type === 'opaque')) return cache.put(event.request, response.clone());\n      }).catch(() => undefined));\n      return cached;\n    }\n    try {\n      const response = await fetch(event.request);\n      if (response && (response.ok || response.type === 'opaque')) await cache.put(event.request, response.clone());\n      return response;\n    } catch {\n      return Response.error();\n    }\n  })());\n});\n`;
}

export function buildIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="ChemLab 3D">\n  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#00f0ff"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs>\n  <rect width="512" height="512" rx="112" fill="#08111f"/>\n  <circle cx="256" cy="256" r="40" fill="url(#g)"/>\n  <g fill="none" stroke="url(#g)" stroke-width="20">\n    <ellipse cx="256" cy="256" rx="172" ry="70" transform="rotate(25 256 256)"/>\n    <ellipse cx="256" cy="256" rx="172" ry="70" transform="rotate(145 256 256)"/>\n    <ellipse cx="256" cy="256" rx="172" ry="70" transform="rotate(265 256 256)"/>\n  </g>\n  <circle cx="405" cy="325" r="20" fill="#f59e0b"/>\n</svg>\n`;
}

const VENDOR_ASSETS = [
  ['three/build/three.min.js', 'three.r128.min.js'],
  ['three/examples/js/controls/OrbitControls.js', 'OrbitControls.r128.js'],
  ['canvas-confetti/dist/confetti.browser.js', 'confetti.browser.js'],
  ['three/LICENSE', 'LICENSE-three.txt'],
  ['canvas-confetti/LICENSE', 'LICENSE-canvas-confetti.txt'],
];

export async function writeOfflineAssets(outputDir) {
  const vendorDir = join(outputDir, 'vendor');
  await mkdir(vendorDir, { recursive: true });
  for (const [source, target] of VENDOR_ASSETS) {
    await copyFile(join(PROJECT_ROOT, 'node_modules', source), join(vendorDir, target));
  }
  await Promise.all([
    writeFile(join(outputDir, 'manifest.webmanifest'), buildManifest(), 'utf8'),
    writeFile(join(outputDir, 'service-worker.js'), buildServiceWorker(), 'utf8'),
    writeFile(join(outputDir, 'chemlab-icon.svg'), buildIconSvg(), 'utf8'),
  ]);
}

export const OFFLINE_BUILD_TRANSFORMS = Object.freeze([applyOfflineShell]);
