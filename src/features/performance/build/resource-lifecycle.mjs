const SCRIPT_MARKER = 'CHEMLAB_RESOURCE_LIFECYCLE_SCRIPT';

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

function buildRuntime() {
  return `<script id="${SCRIPT_MARKER}">
(() => {
  function modalVisible(id) {
    const modal = document.getElementById(id);
    return !!modal && modal.style.display !== 'none' && !modal.hidden;
  }

  function resumeVisibleResourceLoops() {
    if (document.hidden) return;
    if (typeof ensureIsomerAnimation === 'function') ensureIsomerAnimation();
    if (typeof currentModalElem !== 'undefined' && currentModalElem && typeof elemModalAnimId !== 'undefined' && !elemModalAnimId && modalVisible('elem-modal') && typeof initElemModalCanvas === 'function') {
      initElemModalCanvas(currentModalElem);
    }
  }

  document.addEventListener('visibilitychange', resumeVisibleResourceLoops);

  window.ChemLabResourceLifecycle = Object.freeze({
    getState() {
      return {
        viewerInitialized: typeof renderer !== 'undefined' && !!renderer,
        historyInitialized: typeof historyRenderer !== 'undefined' && !!historyRenderer,
        elementModalRunning: typeof elemModalAnimId !== 'undefined' && elemModalAnimId !== null,
        isomerRunning: typeof isomerAnimId !== 'undefined' && isomerAnimId !== null,
      };
    },
    resumeVisibleResourceLoops,
  });
})();
</script>`;
}

export function applyResourceLifecycle(html) {
  if (html.includes(SCRIPT_MARKER)) throw new Error('resource lifecycle already applied');

  html = replaceExpected(
    html,
    `    if (tabId === 'viewer') {\n      ensureViewerAnimation();\n      setTimeout(() => {`,
    `    if (tabId === 'viewer') {\n      if (!renderer && typeof THREE !== 'undefined') initThree();\n      ensureViewerAnimation();\n      setTimeout(() => {`,
    'lazy viewer initialization hook',
  );

  html = replaceExpected(
    html,
    `        const activeModelBtn = document.querySelector('.timeline-tab-btn.active');\n        const modelKey = activeModelBtn ? activeModelBtn.id.replace('tab-model-', '') : 'dalton';\n        if (!historyRenderer) initHistory3D();\n        else { resizeHistory3D(); renderHistoricalModel3D(modelKey); }`,
    `        const activeModelBtn = document.querySelector('.timeline-tab-btn.active');\n        const modelKey = activeModelBtn ? activeModelBtn.id.replace('tab-model-', '') : 'dalton';\n        const historyPanel = document.getElementById('atom-panel-history');\n        if (historyPanel && historyPanel.style.display !== 'none') {\n          if (!historyRenderer) initHistory3D();\n          else { resizeHistory3D(); renderHistoricalModel3D(modelKey); }\n        }`,
    'hidden history initialization gate',
  );

  html = replaceExpected(
    html,
    `    updateAtomUI();\n    switchModel('dalton');\n    initAtomQuiz();`,
    `    updateAtomUI();\n    // Historical Three.js is initialized on first History visit.\n    initAtomQuiz();`,
    'startup history lazy initialization',
  );

  html = replaceExpected(
    html,
    `    try { initAtomStudio(); } catch (e) { console.error("Error in initAtomStudio:", e); }\n    try { initThree(); } catch (e) { console.error("Error in initThree:", e); }\n    try { renderMoleculeList(); } catch (e) { console.error("Error in renderMoleculeList:", e); }`,
    `    try { initAtomStudio(); } catch (e) { console.error("Error in initAtomStudio:", e); }\n    // Three.js viewer initializes on first Viewer visit instead of consuming WebGL resources at startup.\n    try { renderMoleculeList(); } catch (e) { console.error("Error in renderMoleculeList:", e); }`,
    'startup viewer lazy initialization',
  );

  html = replaceExpected(
    html,
    `        if (typeof THREE !== 'undefined') {\n          clearInterval(checkThree);\n          try { initThree(); } catch(e){}\n        } else if (attempts > 30) {`,
    `        if (typeof THREE !== 'undefined') {\n          clearInterval(checkThree);\n          if (document.getElementById('tab-viewer')?.classList.contains('active') && !renderer) {\n            try { initThree(); } catch(e){}\n          }\n        } else if (attempts > 30) {`,
    'delayed Three.js lazy initialization',
  );

  html = replaceExpected(
    html,
    `      animateIsomers();\n    }\n\n    onIsomerPairChange(currentIsomerKey);`,
    `      ensureIsomerAnimation();\n    }\n\n    ensureIsomerAnimation();\n    onIsomerPairChange(currentIsomerKey);`,
    'isomer reopen resume hook',
  );

  html = replaceExpected(
    html,
    `  function animateIsomers() {\n    isomerAnimId = requestAnimationFrame(animateIsomers);`,
    `  function isomerAnimationVisible() {\n    const modal = document.getElementById('isomer-modal');\n    return !document.hidden && modal && modal.style.display !== 'none';\n  }\n\n  function ensureIsomerAnimation() {\n    if (!isomerAnimId && isomerAnimationVisible()) animateIsomers();\n  }\n\n  function animateIsomers() {\n    if (!isomerAnimationVisible()) {\n      isomerAnimId = null;\n      return;\n    }\n    isomerAnimId = requestAnimationFrame(animateIsomers);`,
    'isomer visibility lifecycle',
  );

  html = replaceExpected(
    html,
    `    function renderModalFrame() {\n      if (!currentModalElem) return;`,
    `    function renderModalFrame() {\n      const modal = document.getElementById('elem-modal');\n      if (!currentModalElem || document.hidden || !modal || modal.style.display === 'none') {\n        elemModalAnimId = null;\n        return;\n      }`,
    'element modal visibility lifecycle',
  );

  const count = (html.match(/<\/body>/gi) || []).length;
  if (count !== 1) throw new Error(`resource lifecycle script injection: expected 1 </body>, found ${count}`);
  return html.replace(/<\/body>/i, `${buildRuntime()}\n</body>`);
}

export const RESOURCE_PERFORMANCE_BUILD_TRANSFORMS = Object.freeze([applyResourceLifecycle]);
