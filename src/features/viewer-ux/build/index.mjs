const STYLE_MARKER = 'CHEMLAB_VIEWER_UX_STYLE';
const SCRIPT_MARKER = 'CHEMLAB_VIEWER_UX_SCRIPT';

function countMatches(source, regex) {
  return [...source.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`))].length;
}

function replaceRegexOnce(source, regex, replacement, label) {
  const count = countMatches(source, regex);
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(regex, replacement);
}

function buildViewerUxStyles() {
  return `<style id="${STYLE_MARKER}">
  :root {
    /* #64748b was below 4.5:1 on the common card/background surfaces. */
    --text-dim: #7c8aa0;
  }

  #chemlab-viewer-mobile-tools-btn {
    display: none;
  }

  @media (max-width: 600px) {
    #tab-viewer .viewport-toolbar {
      align-items: flex-start;
      gap: 0.4rem;
    }

    #tab-viewer .tool-cluster {
      max-width: 100%;
    }

    #tab-viewer .cluster-style {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    #tab-viewer .cluster-style .segmented-control {
      flex: 0 0 auto;
    }

    #tab-viewer .cluster-analysis,
    #tab-viewer .cluster-view {
      display: none;
      width: 100%;
      max-width: calc(100vw - 1.3rem);
      overflow-x: auto;
      justify-content: flex-start;
      -webkit-overflow-scrolling: touch;
    }

    #tab-viewer .viewport-toolbar.chemlab-mobile-3d-tools-open .cluster-analysis,
    #tab-viewer .viewport-toolbar.chemlab-mobile-3d-tools-open .cluster-view {
      display: flex;
    }

    #chemlab-viewer-mobile-tools-btn {
      display: flex;
      flex: 0 0 auto;
      min-height: 40px;
      border-color: rgba(0, 240, 255, 0.38);
      color: var(--accent-cyan, #00f0ff);
    }

    #tab-viewer .viewport-toolbar .tool-btn,
    #tab-viewer .viewport-toolbar .seg-btn {
      min-height: 40px;
    }

    #tab-viewer .info-bar {
      font-size: 0.8rem;
    }

    .p-elem-num { font-size: 0.64rem; }
    .p-elem-mass { font-size: 0.58rem; }
    .chemlab-ptable-mobile-nav-label,
    .chemlab-ptable-jump { font-size: 0.76rem; }
  }
</style>`;
}

function buildViewerUxRuntime() {
  return `<script id="${SCRIPT_MARKER}">
(() => {
  const MOBILE_BREAKPOINT = 600;
  const toolbar = document.querySelector('#tab-viewer .viewport-toolbar');
  const styleCluster = toolbar?.querySelector('.cluster-style');
  const analysisCluster = toolbar?.querySelector('.cluster-analysis');
  const viewCluster = toolbar?.querySelector('.cluster-view');
  if (!toolbar || !styleCluster || !analysisCluster || !viewCluster) return;

  analysisCluster.id ||= 'chemlab-viewer-analysis-tools';
  viewCluster.id ||= 'chemlab-viewer-view-tools';

  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'chemlab-viewer-mobile-tools-btn';
  button.className = 'tool-btn';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', analysisCluster.id + ' ' + viewCluster.id);
  button.innerHTML = '<span aria-hidden="true">🛠️</span><span>เพิ่มเติม</span>';
  const segmented = styleCluster.querySelector('.segmented-control');
  styleCluster.insertBefore(button, segmented || null);

  function setExpanded(expanded) {
    toolbar.classList.toggle('chemlab-mobile-3d-tools-open', expanded);
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  button.addEventListener('click', () => {
    setExpanded(button.getAttribute('aria-expanded') !== 'true');
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) setExpanded(false);
  }, { passive: true });
})();
</script>`;
}

export function applyViewerUx(html) {
  if (html.includes(STYLE_MARKER) || html.includes(SCRIPT_MARKER)) {
    throw new Error('viewer UX already applied');
  }
  html = replaceRegexOnce(html, /<\/head>/i, `${buildViewerUxStyles()}\n</head>`, 'viewer UX style injection');
  html = replaceRegexOnce(html, /<\/body>/i, `${buildViewerUxRuntime()}\n</body>`, 'viewer UX runtime injection');
  return html;
}

export const VIEWER_UX_BUILD_TRANSFORMS = Object.freeze([applyViewerUx]);
