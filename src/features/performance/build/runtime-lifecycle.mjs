const SCRIPT_MARKER = 'CHEMLAB_RUNTIME_LIFECYCLE_SCRIPT';

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

function buildLifecycleRuntime() {
  return `<script id="${SCRIPT_MARKER}">
(() => {
  function resumeVisibleLoops() {
    if (document.hidden) return;
    const active = document.querySelector('.tab-content.active')?.id;
    if (active === 'tab-atom' && typeof ensureAtomAnimation === 'function') ensureAtomAnimation();
    if (active === 'tab-viewer' && typeof ensureViewerAnimation === 'function') ensureViewerAnimation();
    if (active === 'tab-sandbox' && typeof ensureBeakerFXAnimation === 'function') ensureBeakerFXAnimation();
  }

  document.addEventListener('visibilitychange', resumeVisibleLoops);

  window.ChemLabRuntimeLifecycle = Object.freeze({
    getState() {
      return {
        documentVisible: !document.hidden,
        activeTab: document.querySelector('.tab-content.active')?.id || null,
        atomRunning: typeof atomAnimationId !== 'undefined' && atomAnimationId !== null,
        viewerRunning: typeof viewerAnimationId !== 'undefined' && viewerAnimationId !== null,
        beakerFxRunning: typeof beakerFxAnimationId !== 'undefined' && beakerFxAnimationId !== null,
        beakerParticleCount: typeof beakerParticles !== 'undefined' ? beakerParticles.length : 0,
      };
    },
    resumeVisibleLoops,
  });
})();
</script>`;
}

export function applyRuntimeLifecycle(html) {
  if (html.includes(SCRIPT_MARKER)) throw new Error('runtime lifecycle already applied');

  html = replaceExpected(
    html,
    `    if (tabId === 'viewer') {\n      setTimeout(() => {`,
    `    if (tabId === 'viewer') {\n      ensureViewerAnimation();\n      setTimeout(() => {`,
    'viewer tab resume hook',
  );

  html = replaceExpected(
    html,
    `    } else if (tabId === 'atom') {\n      setTimeout(() => {`,
    `    } else if (tabId === 'atom') {\n      ensureAtomAnimation();\n      setTimeout(() => {`,
    'atom tab resume hook',
  );

  html = replaceExpected(
    html,
    `    } else if (tabId === 'sandbox') {\n      setTimeout(() => {`,
    `    } else if (tabId === 'sandbox') {\n      ensureBeakerFXAnimation();\n      setTimeout(() => {`,
    'sandbox tab resume hook',
  );

  html = replaceExpected(
    html,
    `  function animateAtom() {\n    atomState.t += 0.02;\n    drawAtomCanvas();\n    atomAnimationId = requestAnimationFrame(animateAtom);\n  }`,
    `  function ensureAtomAnimation() {\n    if (!atomAnimationId && !document.hidden && document.getElementById('tab-atom')?.classList.contains('active')) {\n      animateAtom();\n    }\n  }\n\n  function animateAtom() {\n    if (document.hidden || !document.getElementById('tab-atom')?.classList.contains('active')) {\n      atomAnimationId = null;\n      return;\n    }\n    atomState.t += 0.02;\n    drawAtomCanvas();\n    atomAnimationId = requestAnimationFrame(animateAtom);\n  }`,
    'atom animation lifecycle',
  );

  html = replaceExpected(
    html,
    `  function animate() {\n    requestAnimationFrame(animate);\n    if (controls) controls.update();\n    if (renderer && scene && camera) renderer.render(scene, camera);\n  }`,
    `  let viewerAnimationId = null;\n\n  function ensureViewerAnimation() {\n    if (!viewerAnimationId && !document.hidden && document.getElementById('tab-viewer')?.classList.contains('active')) {\n      animate();\n    }\n  }\n\n  function animate() {\n    if (document.hidden || !document.getElementById('tab-viewer')?.classList.contains('active')) {\n      viewerAnimationId = null;\n      return;\n    }\n    viewerAnimationId = requestAnimationFrame(animate);\n    if (controls) controls.update();\n    if (renderer && scene && camera) renderer.render(scene, camera);\n  }`,
    'viewer animation lifecycle',
  );

  html = replaceExpected(
    html,
    `  let beakerCanvas, beakerCtx;\n  let beakerParticles = [];`,
    `  let beakerCanvas, beakerCtx;\n  let beakerParticles = [];\n  let beakerFxAnimationId = null;`,
    'beaker animation state',
  );

  html = replaceExpected(
    html,
    `  function initBeakerParticles() {\n    beakerCanvas = document.getElementById('beaker-particles-canvas');\n    if (beakerCanvas) {\n      beakerCtx = beakerCanvas.getContext('2d');\n      animateBeakerFX();\n    }\n  }\n\n  function animateBeakerFX() {`,
    `  function initBeakerParticles() {\n    beakerCanvas = document.getElementById('beaker-particles-canvas');\n    if (beakerCanvas) {\n      beakerCtx = beakerCanvas.getContext('2d');\n    }\n  }\n\n  function ensureBeakerFXAnimation() {\n    if (!beakerFxAnimationId && beakerParticles.length > 0 && !document.hidden && document.getElementById('tab-sandbox')?.classList.contains('active')) {\n      animateBeakerFX();\n    }\n  }\n\n  function animateBeakerFX() {\n    if (document.hidden || !document.getElementById('tab-sandbox')?.classList.contains('active') || beakerParticles.length === 0) {\n      beakerFxAnimationId = null;\n      return;\n    }`,
    'beaker lifecycle entry',
  );

  html = replaceExpected(
    html,
    `    requestAnimationFrame(animateBeakerFX);\n  }\n\n  function spawnBeakerFX(type) {`,
    `    beakerFxAnimationId = requestAnimationFrame(animateBeakerFX);\n  }\n\n  function spawnBeakerFX(type) {`,
    'beaker lifecycle scheduling',
  );

  html = replaceExpected(
    html,
    `      beakerParticles.push({\n        x: beakerCanvas.width / 2 + (Math.random() - 0.5) * 60,\n        y: beakerCanvas.height - 20,\n        vx, vy, size, color, life, decay\n      });\n    }\n  }`,
    `      beakerParticles.push({\n        x: beakerCanvas.width / 2 + (Math.random() - 0.5) * 60,\n        y: beakerCanvas.height - 20,\n        vx, vy, size, color, life, decay\n      });\n    }\n    ensureBeakerFXAnimation();\n  }`,
    'beaker effect resume',
  );

  const bodyCloseCount = (html.match(/<\/body>/gi) || []).length;
  if (bodyCloseCount !== 1) throw new Error(`runtime lifecycle script injection: expected 1 </body>, found ${bodyCloseCount}`);
  return html.replace(/<\/body>/i, `${buildLifecycleRuntime()}\n</body>`);
}

export const PERFORMANCE_BUILD_TRANSFORMS = Object.freeze([applyRuntimeLifecycle]);
