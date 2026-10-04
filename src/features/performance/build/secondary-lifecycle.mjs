const SCRIPT_MARKER = 'CHEMLAB_SECONDARY_RUNTIME_LIFECYCLE_SCRIPT';

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

function buildSecondaryLifecycleRuntime() {
  return `<script id="${SCRIPT_MARKER}">
(() => {
  let refreshQueued = false;

  function resumeVisibleSecondaryLoops() {
    if (document.hidden) return;
    if (typeof ensureHistoryAnimation === 'function') ensureHistoryAnimation();
    if (typeof ensureCollisionAnimation === 'function') ensureCollisionAnimation();
    if (typeof ensureGalvanicAnimation === 'function') ensureGalvanicAnimation();
  }

  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      resumeVisibleSecondaryLoops();
    });
  }

  document.addEventListener('visibilitychange', resumeVisibleSecondaryLoops);
  const observer = new MutationObserver(queueRefresh);
  document.querySelectorAll('.tab-content, .sandbox-view-panel, #atom-panel-history').forEach((element) => {
    observer.observe(element, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  });

  window.ChemLabSecondaryRuntimeLifecycle = Object.freeze({
    getState() {
      return {
        historyRunning: typeof historyAnimId !== 'undefined' && historyAnimId !== null,
        collisionRunning: typeof collisionAnimId !== 'undefined' && collisionAnimId !== null,
        galvanicRunning: typeof galvanicAnimId !== 'undefined' && galvanicAnimId !== null,
      };
    },
    resumeVisibleSecondaryLoops,
  });
})();
</script>`;
}

export function applySecondaryRuntimeLifecycle(html) {
  if (html.includes(SCRIPT_MARKER)) throw new Error('secondary runtime lifecycle already applied');

  html = replaceExpected(
    html,
    `      setTimeout(() => {\n        if (typeof switchModel === 'function') switchModel('dalton');\n      }, 60);`,
    `      setTimeout(() => {\n        if (typeof switchModel === 'function') switchModel('dalton');\n        if (typeof ensureHistoryAnimation === 'function') ensureHistoryAnimation();\n      }, 60);`,
    'history subtab resume hook',
  );

  html = replaceExpected(
    html,
    `    animateHistory3D();\n    renderHistoricalModel3D(currentHistoryKey || 'dalton');`,
    `    ensureHistoryAnimation();\n    renderHistoricalModel3D(currentHistoryKey || 'dalton');`,
    'history initial lifecycle hook',
  );

  html = replaceExpected(
    html,
    `  function animateHistory3D() {\n    historyAnimId = requestAnimationFrame(animateHistory3D);\n    if (!historyRenderer || !historyScene || !historyCamera) return;`,
    `  function historyAnimationVisible() {\n    const historyPanel = document.getElementById('atom-panel-history');\n    return !document.hidden\n      && !!historyRenderer\n      && document.getElementById('tab-atom')?.classList.contains('active')\n      && historyPanel\n      && historyPanel.style.display !== 'none';\n  }\n\n  function ensureHistoryAnimation() {\n    if (!historyAnimId && historyAnimationVisible()) animateHistory3D();\n  }\n\n  function animateHistory3D() {\n    if (!historyAnimationVisible()) {\n      historyAnimId = null;\n      return;\n    }\n    historyAnimId = requestAnimationFrame(animateHistory3D);\n    if (!historyRenderer || !historyScene || !historyCamera) return;`,
    'history animation lifecycle',
  );

  html = replaceExpected(
    html,
    `    if (!collisionAnimId) {\n      collisionLastTime = performance.now();\n      animateCollisionTheory();\n    }`,
    `    ensureCollisionAnimation();`,
    'collision init lifecycle hook',
  );

  html = replaceExpected(
    html,
    `  function animateCollisionTheory() {\n    collisionAnimId = requestAnimationFrame(animateCollisionTheory);\n    const canvas = document.getElementById('collision-chamber-canvas');`,
    `  function collisionAnimationVisible() {\n    const panel = document.getElementById('sandbox-view-collision');\n    return !document.hidden\n      && document.getElementById('tab-sandbox')?.classList.contains('active')\n      && panel\n      && panel.style.display !== 'none';\n  }\n\n  function ensureCollisionAnimation() {\n    if (!collisionAnimId && collisionAnimationVisible()) {\n      collisionLastTime = performance.now();\n      animateCollisionTheory();\n    }\n  }\n\n  function animateCollisionTheory() {\n    if (!collisionAnimationVisible()) {\n      collisionAnimId = null;\n      return;\n    }\n    collisionAnimId = requestAnimationFrame(animateCollisionTheory);\n    const canvas = document.getElementById('collision-chamber-canvas');`,
    'collision animation lifecycle',
  );

  html = replaceExpected(
    html,
    `  function initGalvanicCell() {\n    onGalvanicMetalChange();\n    if (!galvanicAnimId) animateGalvanicCell();\n  }`,
    `  function initGalvanicCell() {\n    onGalvanicMetalChange();\n    ensureGalvanicAnimation();\n  }`,
    'galvanic init lifecycle hook',
  );

  html = replaceExpected(
    html,
    `  function animateGalvanicCell() {\n    galvanicAnimId = requestAnimationFrame(animateGalvanicCell);\n    const canvas = document.getElementById('galvanic-cell-canvas');`,
    `  function galvanicAnimationVisible() {\n    const panel = document.getElementById('sandbox-view-galvanic');\n    return !document.hidden\n      && document.getElementById('tab-sandbox')?.classList.contains('active')\n      && panel\n      && panel.style.display !== 'none';\n  }\n\n  function ensureGalvanicAnimation() {\n    if (!galvanicAnimId && galvanicAnimationVisible()) animateGalvanicCell();\n  }\n\n  function animateGalvanicCell() {\n    if (!galvanicAnimationVisible()) {\n      galvanicAnimId = null;\n      return;\n    }\n    galvanicAnimId = requestAnimationFrame(animateGalvanicCell);\n    const canvas = document.getElementById('galvanic-cell-canvas');`,
    'galvanic animation lifecycle',
  );

  const bodyCloseCount = (html.match(/<\/body>/gi) || []).length;
  if (bodyCloseCount !== 1) throw new Error(`secondary lifecycle script injection: expected 1 </body>, found ${bodyCloseCount}`);
  return html.replace(/<\/body>/i, `${buildSecondaryLifecycleRuntime()}\n</body>`);
}

export const SECONDARY_PERFORMANCE_BUILD_TRANSFORMS = Object.freeze([applySecondaryRuntimeLifecycle]);
