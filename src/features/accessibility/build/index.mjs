const STYLE_MARKER = 'CHEMLAB_ACCESSIBILITY_FOUNDATION_STYLE';
const SCRIPT_MARKER = 'CHEMLAB_ACCESSIBILITY_FOUNDATION_SCRIPT';

function countMatches(source, regex) {
  return [...source.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`))].length;
}

function replaceRegexOnce(source, regex, replacement, label) {
  const count = countMatches(source, regex);
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(regex, replacement);
}

function clarifyLevelFilterScope(html) {
  html = replaceRegexOnce(
    html,
    /<div class="level-bar">/,
    `<div class="level-bar" role="group" aria-labelledby="chemlab-level-filter-label" aria-describedby="chemlab-level-filter-scope" title="กรองเฉพาะรายการโมเลกุลในแท็บโมเลกุล 3D">\n        <span id="chemlab-level-filter-scope" class="chemlab-sr-only">ตัวกรองนี้มีผลเฉพาะรายการโมเลกุลในแท็บโมเลกุล 3D ไม่ได้เปลี่ยนเนื้อหาทั้งแอป</span>`,
    'level filter group',
  );
  html = replaceRegexOnce(
    html,
    /<span class="level-label">ชั้น:<\/span>/,
    '<span class="level-label" id="chemlab-level-filter-label">กรองโมเลกุล:</span>',
    'level filter label',
  );
  return html;
}

function buildAccessibilityStyles() {
  return `<style id="${STYLE_MARKER}">
  .chemlab-skip-link {
    position: fixed;
    top: 0.65rem;
    left: 0.65rem;
    z-index: 2147483647;
    padding: 0.65rem 0.9rem;
    border-radius: 10px;
    background: rgba(7, 15, 28, 0.98);
    border: 1px solid var(--accent-cyan, #00f0ff);
    color: #fff;
    font-weight: 700;
    text-decoration: none;
    transform: translateY(calc(-100% - 1rem));
    transition: transform 0.16s ease;
  }
  .chemlab-skip-link:focus-visible { transform: translateY(0); }
  .chemlab-sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
  :where(a, button, input, select, textarea, summary, [tabindex], [role="button"], [role="tab"]):focus-visible {
    outline: 3px solid var(--accent-cyan, #00f0ff);
    outline-offset: 3px;
  }
  [role="dialog"][tabindex="-1"]:focus { outline: none; }
  @media (prefers-reduced-motion: reduce) {
    html:focus-within { scroll-behavior: auto !important; }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
</style>`;
}

function buildAccessibilityRuntime() {
  return `<script id="${SCRIPT_MARKER}">
(() => {
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
  const DIALOG_SELECTOR = '.modal-overlay[id], [id$="-modal"]';
  const HORIZONTAL_SCROLL_SELECTOR = '.nav-tabs, #tab-ptable, .ptable-grid, .tool-group, .info-bar, .sandbox-presets';
  const dialogState = new WeakMap();
  let scrollRefreshQueued = false;

  function isVisible(element) {
    if (!element || element.hidden) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
  }

  function ensureSkipTarget() {
    const known = document.querySelector('main, [role="main"], .main-content, .content-area, .tab-content, #tab-atom');
    if (!known) return null;
    if (!known.id) known.id = 'chemlab-main-content';
    if (!known.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/i.test(known.tagName)) known.tabIndex = -1;
    const skip = document.querySelector('.chemlab-skip-link');
    if (skip) skip.setAttribute('href', '#' + known.id);
    if (!known.hasAttribute('role') && known.matches('main, .main-content, .content-area, .tab-content')) known.setAttribute('role', 'main');
    return known;
  }

  function enhanceClickableElements(root = document) {
    const selector = '[onclick]:not(button):not(a):not(input):not(select):not(textarea):not(summary)';
    root.querySelectorAll(selector).forEach(element => {
      if (!element.hasAttribute('role')) element.setAttribute('role', 'button');
      if (!element.hasAttribute('tabindex')) element.tabIndex = 0;
      if (element.dataset.chemlabKeyboardReady === 'true') return;
      element.dataset.chemlabKeyboardReady = 'true';
      element.addEventListener('keydown', event => {
        if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        element.click();
      });
    });
  }

  function syncLevelFilterState() {
    document.querySelectorAll('.level-pill').forEach(button => {
      button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
      button.setAttribute('aria-controls', 'molecule-list-container');
    });
  }

  function horizontalScrollLabel(element) {
    if (element.classList.contains('nav-tabs')) return 'แถบนำทางหลักที่เลื่อนได้ในแนวนอน';
    if (element.id === 'tab-ptable' || element.classList.contains('ptable-grid')) return 'ตารางธาตุที่เลื่อนได้ในแนวนอน';
    if (element.classList.contains('tool-group')) return 'แถบเครื่องมือโมเลกุลที่เลื่อนได้ในแนวนอน';
    if (element.classList.contains('info-bar')) return 'ข้อมูลโมเลกุลที่เลื่อนได้ในแนวนอน';
    if (element.classList.contains('sandbox-presets')) return 'ชุดการทดลองตัวอย่างที่เลื่อนได้ในแนวนอน';
    return 'พื้นที่เนื้อหาที่เลื่อนได้ในแนวนอน';
  }

  function removeOwnedScrollSemantics(element) {
    if (element.dataset.chemlabAddedTabindex === 'true') element.removeAttribute('tabindex');
    if (element.dataset.chemlabAddedRole === 'true') element.removeAttribute('role');
    if (element.dataset.chemlabAddedLabel === 'true') element.removeAttribute('aria-label');
    delete element.dataset.chemlabAddedTabindex;
    delete element.dataset.chemlabAddedRole;
    delete element.dataset.chemlabAddedLabel;
    delete element.dataset.chemlabScrollRegion;
  }

  function enhanceHorizontalScrollRegions() {
    document.querySelectorAll(HORIZONTAL_SCROLL_SELECTOR).forEach(element => {
      const scrollable = isVisible(element) && element.scrollWidth > element.clientWidth + 1;
      if (!scrollable) {
        if (element.dataset.chemlabScrollRegion === 'true') removeOwnedScrollSemantics(element);
        return;
      }

      element.dataset.chemlabScrollRegion = 'true';
      if (!element.hasAttribute('tabindex')) {
        element.tabIndex = 0;
        element.dataset.chemlabAddedTabindex = 'true';
      }
      if (!element.hasAttribute('role') && element.tagName !== 'NAV') {
        element.setAttribute('role', 'region');
        element.dataset.chemlabAddedRole = 'true';
      }
      if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
        element.setAttribute('aria-label', horizontalScrollLabel(element));
        element.dataset.chemlabAddedLabel = 'true';
      }
      if (element.dataset.chemlabScrollKeyboardReady === 'true') return;
      element.dataset.chemlabScrollKeyboardReady = 'true';
      element.addEventListener('keydown', event => {
        if (event.target !== element || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        element.scrollBy({ left: direction * Math.max(80, element.clientWidth * 0.75), behavior: 'auto' });
      });
    });
  }

  function queueHorizontalScrollRefresh() {
    if (scrollRefreshQueued) return;
    scrollRefreshQueued = true;
    requestAnimationFrame(() => {
      scrollRefreshQueued = false;
      enhanceHorizontalScrollRegions();
    });
  }

  function labelDialog(dialog, index) {
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    if (!dialog.hasAttribute('tabindex')) dialog.tabIndex = -1;
    if (dialog.hasAttribute('aria-label') || dialog.hasAttribute('aria-labelledby')) return;
    const heading = dialog.querySelector('h1, h2, h3, .modal-title, .section-title');
    if (heading) {
      if (!heading.id) heading.id = 'chemlab-dialog-title-' + index;
      dialog.setAttribute('aria-labelledby', heading.id);
    } else {
      dialog.setAttribute('aria-label', 'หน้าต่างโต้ตอบ');
    }
  }

  function focusableIn(dialog) {
    return [...dialog.querySelectorAll(FOCUSABLE)].filter(isVisible);
  }

  function syncDialogs() {
    const dialogs = [...document.querySelectorAll(DIALOG_SELECTOR)];
    dialogs.forEach((dialog, index) => {
      labelDialog(dialog, index);
      const visible = isVisible(dialog);
      dialog.setAttribute('aria-hidden', visible ? 'false' : 'true');
      const state = dialogState.get(dialog) || { open: false, returnFocus: null };
      if (visible && !state.open) {
        state.open = true;
        state.returnFocus = document.activeElement && !dialog.contains(document.activeElement) ? document.activeElement : null;
        requestAnimationFrame(() => {
          if (!isVisible(dialog)) return;
          const target = focusableIn(dialog)[0] || dialog;
          target.focus({ preventScroll: true });
        });
      } else if (!visible && state.open) {
        state.open = false;
        const returnFocus = state.returnFocus;
        state.returnFocus = null;
        if (returnFocus && returnFocus.isConnected && typeof returnFocus.focus === 'function') {
          requestAnimationFrame(() => returnFocus.focus({ preventScroll: true }));
        }
      }
      dialogState.set(dialog, state);
    });
  }

  function topVisibleDialog() {
    return [...document.querySelectorAll(DIALOG_SELECTOR)].filter(isVisible).pop() || null;
  }

  function closeDialogFromKeyboard(dialog) {
    const closeControl = dialog.querySelector('[data-modal-close], .modal-close, .close-modal, .close-btn, .modal-close-btn, button[aria-label*="ปิด"], button[aria-label*="Close"], button[onclick*="close" i]');
    if (closeControl) {
      closeControl.click();
      return true;
    }
    if (dialog.hasAttribute('onclick')) {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }
    return false;
  }

  document.addEventListener('keydown', event => {
    const dialog = topVisibleDialog();
    if (!dialog) return;
    if (event.key === 'Escape' && !event.defaultPrevented) {
      if (closeDialogFromKeyboard(dialog)) event.preventDefault();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusableIn(dialog);
    if (!items.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, true);

  function enhance() {
    ensureSkipTarget();
    enhanceClickableElements();
    syncLevelFilterState();
    syncDialogs();
    queueHorizontalScrollRefresh();
  }

  document.addEventListener('DOMContentLoaded', enhance, { once: true });
  if (document.readyState !== 'loading') enhance();
  window.addEventListener('resize', queueHorizontalScrollRefresh, { passive: true });

  const observer = new MutationObserver(mutations => {
    let needsInteractiveRefresh = false;
    let needsStateSync = false;
    let needsDialogSync = false;
    let needsScrollRefresh = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') needsInteractiveRefresh = true;
      if (mutation.type === 'attributes' && mutation.target.classList && mutation.target.classList.contains('level-pill')) needsStateSync = true;
      if (mutation.type === 'childList' || mutation.type === 'attributes') needsDialogSync = true;
      if (mutation.type === 'childList' || (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class' || mutation.attributeName === 'hidden'))) needsScrollRefresh = true;
    }
    if (needsInteractiveRefresh) enhanceClickableElements();
    if (needsInteractiveRefresh || needsStateSync) syncLevelFilterState();
    if (needsDialogSync) syncDialogs();
    if (needsScrollRefresh) queueHorizontalScrollRefresh();
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
})();
</script>`;
}

export function applyAccessibilityFoundation(html) {
  if (html.includes(STYLE_MARKER) || html.includes(SCRIPT_MARKER)) {
    throw new Error('accessibility foundation already applied');
  }

  html = clarifyLevelFilterScope(html);
  html = replaceRegexOnce(html, /<\/head>/i, `${buildAccessibilityStyles()}\n</head>`, 'accessibility style injection');
  html = replaceRegexOnce(
    html,
    /<body([^>]*)>/i,
    `<body$1>\n<a class="chemlab-skip-link" href="#tab-atom">ข้ามไปยังเนื้อหาหลัก</a>`,
    'skip link injection',
  );
  html = replaceRegexOnce(html, /<\/body>/i, `${buildAccessibilityRuntime()}\n</body>`, 'accessibility runtime injection');
  return html;
}

export const ACCESSIBILITY_BUILD_TRANSFORMS = Object.freeze([applyAccessibilityFoundation]);
