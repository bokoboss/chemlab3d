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
  const dialogState = new WeakMap();

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
    syncDialogs();
  }

  document.addEventListener('DOMContentLoaded', enhance, { once: true });
  if (document.readyState !== 'loading') enhance();

  const observer = new MutationObserver(mutations => {
    let needsInteractiveRefresh = false;
    let needsDialogSync = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') needsInteractiveRefresh = true;
      if (mutation.type === 'childList' || mutation.type === 'attributes') needsDialogSync = true;
    }
    if (needsInteractiveRefresh) enhanceClickableElements();
    if (needsDialogSync) syncDialogs();
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
})();
</script>`;
}

export function applyAccessibilityFoundation(html) {
  if (html.includes(STYLE_MARKER) || html.includes(SCRIPT_MARKER)) {
    throw new Error('accessibility foundation already applied');
  }

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
