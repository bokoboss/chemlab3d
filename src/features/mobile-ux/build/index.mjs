const STYLE_MARKER = 'CHEMLAB_MOBILE_UX_STYLE';
const MENU_MARKER = 'CHEMLAB_MOBILE_LEARNING_MENU';
const PTABLE_MARKER = 'CHEMLAB_MOBILE_PTABLE_NAV';
const SCRIPT_MARKER = 'CHEMLAB_MOBILE_UX_SCRIPT';

function countMatches(source, regex) {
  return [...source.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`))].length;
}

function replaceRegexOnce(source, regex, replacement, label) {
  const count = countMatches(source, regex);
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(regex, replacement);
}

function buildMobileUxStyles() {
  return `<style id="${STYLE_MARKER}">
  .chemlab-mobile-menu-btn,
  .chemlab-ptable-mobile-nav {
    display: none;
  }

  .chemlab-mobile-sheet-overlay[hidden] {
    display: none !important;
  }

  .chemlab-mobile-sheet-overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .chemlab-mobile-sheet-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(2, 8, 23, 0.72);
    backdrop-filter: blur(5px);
  }

  .chemlab-mobile-sheet {
    position: relative;
    width: min(100%, 560px);
    max-height: min(78vh, 680px);
    overflow-y: auto;
    padding: 1rem;
    border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
    border-bottom: 0;
    border-radius: 20px 20px 0 0;
    background: rgba(10, 18, 32, 0.98);
    box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.48);
  }

  .chemlab-mobile-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .chemlab-mobile-sheet-header h2 {
    margin: 0;
    color: #fff;
    font-family: var(--font-display);
    font-size: 1.05rem;
  }

  .chemlab-mobile-sheet-hint {
    margin: 0 0 0.85rem;
    color: var(--text-muted);
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .chemlab-mobile-menu-group + .chemlab-mobile-menu-group {
    margin-top: 0.9rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(148, 163, 184, 0.16);
  }

  .chemlab-mobile-menu-group-title {
    margin: 0 0 0.45rem;
    color: var(--accent-cyan, #00f0ff);
    font-family: var(--font-display);
    font-size: 0.76rem;
    font-weight: 700;
  }

  .chemlab-mobile-menu-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .chemlab-mobile-menu-item {
    min-height: 44px;
    justify-content: flex-start;
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(30, 41, 59, 0.55);
    color: var(--text-main, #e2e8f0);
  }

  .chemlab-mobile-menu-item.active,
  .chemlab-mobile-menu-item[aria-current="page"] {
    border-color: rgba(0, 240, 255, 0.58);
    background: rgba(2, 132, 199, 0.28);
    color: #fff;
  }

  @media (max-width: 1100px) {
    .chemlab-mobile-menu-btn {
      display: flex;
      margin-left: auto;
      border-color: rgba(0, 240, 255, 0.35);
      color: var(--accent-cyan, #00f0ff);
    }
  }

  @media (min-width: 1101px) {
    .chemlab-mobile-sheet-overlay {
      display: none !important;
    }
  }

  @media (max-width: 860px) {
    .chemlab-ptable-mobile-nav {
      position: sticky;
      left: 0;
      z-index: 32;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      width: max-content;
      max-width: calc(100vw - 4rem);
      margin: 0 0 0.7rem;
      padding: 0.4rem;
      overflow-x: auto;
      border: 1px solid rgba(0, 240, 255, 0.22);
      border-radius: 12px;
      background: rgba(10, 18, 32, 0.96);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      -webkit-overflow-scrolling: touch;
    }

    .chemlab-ptable-mobile-nav-label {
      flex: 0 0 auto;
      padding-left: 0.25rem;
      color: var(--text-muted);
      font-size: 0.72rem;
      white-space: nowrap;
    }

    .chemlab-ptable-jump {
      flex: 0 0 auto;
      min-height: 36px;
      padding: 0.3rem 0.55rem;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 9px;
      background: rgba(30, 41, 59, 0.68);
      color: var(--text-main, #e2e8f0);
      font-family: var(--font-body);
      font-size: 0.72rem;
      cursor: pointer;
    }

    .chemlab-ptable-jump[aria-pressed="true"] {
      border-color: rgba(0, 240, 255, 0.62);
      background: rgba(2, 132, 199, 0.36);
      color: #fff;
    }
  }

  @media (max-width: 430px) {
    .chemlab-mobile-menu-grid {
      grid-template-columns: 1fr;
    }
    .chemlab-mobile-sheet {
      padding-bottom: max(1rem, env(safe-area-inset-bottom));
    }
  }
</style>`;
}

function buildMobileMenuTrigger() {
  return `<button type="button" class="tool-btn chemlab-mobile-menu-btn" id="chemlab-mobile-menu-btn" aria-haspopup="dialog" aria-controls="chemlab-mobile-learning-modal" aria-expanded="false">
      <span>🧭</span><span>เมนูเรียน</span>
    </button>`;
}

function buildPeriodicTableNavigator() {
  return `<div class="chemlab-ptable-mobile-nav" id="${PTABLE_MARKER}" aria-label="ทางลัดเลื่อนตารางธาตุ">
        <span class="chemlab-ptable-mobile-nav-label">เลื่อนไป:</span>
        <button type="button" class="chemlab-ptable-jump" data-chemlab-ptable-position="start" aria-pressed="true">หมู่ 1–2</button>
        <button type="button" class="chemlab-ptable-jump" data-chemlab-ptable-position="center" aria-pressed="false">หมู่ 3–12</button>
        <button type="button" class="chemlab-ptable-jump" data-chemlab-ptable-position="end" aria-pressed="false">หมู่ 13–18</button>
      </div>`;
}

function buildMobileMenuModal() {
  return `<div id="chemlab-mobile-learning-modal" class="chemlab-mobile-sheet-overlay" data-chemlab-marker="${MENU_MARKER}" hidden>
    <div class="chemlab-mobile-sheet-backdrop" data-chemlab-mobile-menu-close></div>
    <div class="chemlab-mobile-sheet">
      <div class="chemlab-mobile-sheet-header">
        <h2>🧭 เส้นทางการเรียนรู้</h2>
        <button type="button" class="tool-btn modal-close-btn" data-chemlab-mobile-menu-close aria-label="ปิดเมนูเรียน">✕</button>
      </div>
      <p class="chemlab-mobile-sheet-hint">เลือกหัวข้อหลักได้จากภาพรวมนี้ โดยแถบนำทางเดิมยังใช้งานได้เหมือนเดิม</p>
      <div id="chemlab-mobile-learning-menu-groups"></div>
    </div>
  </div>`;
}

function buildMobileUxRuntime() {
  return `<script id="${SCRIPT_MARKER}">
(() => {
  const MENU_GROUPS = [
    { title: 'เรียนรู้หลัก', ids: ['tab-btn-atom', 'tab-btn-ptable', 'tab-btn-viewer', 'tab-btn-sandbox'] },
    { title: 'ฝึกฝนและทบทวน', ids: ['tab-btn-quests', 'tab-btn-guide', 'tab-btn-flashcards'] },
  ];

  const menuButton = document.getElementById('chemlab-mobile-menu-btn');
  const menuModal = document.getElementById('chemlab-mobile-learning-modal');
  const menuGroups = document.getElementById('chemlab-mobile-learning-menu-groups');
  const menuItems = new Map();
  const ptableScroller = document.getElementById('tab-ptable');
  const ptableJumpButtons = [...document.querySelectorAll('[data-chemlab-ptable-position]')];
  let ptableScrollSyncQueued = false;

  function closeMobileLearningMenu() {
    if (!menuModal || menuModal.hidden) return;
    menuModal.hidden = true;
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
  }

  function openMobileLearningMenu() {
    if (!menuModal) return;
    menuModal.hidden = false;
    if (menuButton) menuButton.setAttribute('aria-expanded', 'true');
  }

  function syncMobileMenuState() {
    for (const [source, item] of menuItems) {
      const active = source.classList.contains('active');
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    }
  }

  function buildMobileLearningMenu() {
    if (!menuGroups || menuGroups.dataset.chemlabBuilt === 'true') return;
    menuGroups.dataset.chemlabBuilt = 'true';

    MENU_GROUPS.forEach(group => {
      const section = document.createElement('section');
      section.className = 'chemlab-mobile-menu-group';

      const heading = document.createElement('h3');
      heading.className = 'chemlab-mobile-menu-group-title';
      heading.textContent = group.title;
      section.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'chemlab-mobile-menu-grid';

      group.ids.forEach(id => {
        const source = document.getElementById(id);
        if (!source) return;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'tool-btn chemlab-mobile-menu-item';
        item.innerHTML = source.innerHTML;
        item.dataset.chemlabSourceNav = id;
        item.addEventListener('click', () => {
          closeMobileLearningMenu();
          requestAnimationFrame(() => source.click());
        });
        menuItems.set(source, item);
        grid.appendChild(item);
      });

      section.appendChild(grid);
      menuGroups.appendChild(section);
    });

    syncMobileMenuState();
  }

  function ptableTarget(position) {
    if (!ptableScroller) return 0;
    const max = Math.max(0, ptableScroller.scrollWidth - ptableScroller.clientWidth);
    if (position === 'end') return max;
    if (position === 'center') return max / 2;
    return 0;
  }

  function syncPeriodicTableNavigator() {
    if (!ptableScroller || !ptableJumpButtons.length) return;
    const max = Math.max(0, ptableScroller.scrollWidth - ptableScroller.clientWidth);
    const ratio = max > 0 ? ptableScroller.scrollLeft / max : 0;
    const active = ratio < 0.25 ? 'start' : ratio > 0.75 ? 'end' : 'center';
    ptableJumpButtons.forEach(button => {
      button.setAttribute('aria-pressed', button.dataset.chemlabPtablePosition === active ? 'true' : 'false');
    });
  }

  function queuePeriodicTableSync() {
    if (ptableScrollSyncQueued) return;
    ptableScrollSyncQueued = true;
    requestAnimationFrame(() => {
      ptableScrollSyncQueued = false;
      syncPeriodicTableNavigator();
    });
  }

  if (menuButton) menuButton.addEventListener('click', openMobileLearningMenu);
  if (menuModal) {
    menuModal.querySelectorAll('[data-chemlab-mobile-menu-close]').forEach(control => {
      control.addEventListener('click', closeMobileLearningMenu);
    });
  }

  buildMobileLearningMenu();

  const navObserver = new MutationObserver(syncMobileMenuState);
  document.querySelectorAll('.nav-tab').forEach(source => {
    navObserver.observe(source, { attributes: true, attributeFilter: ['class'] });
  });

  ptableJumpButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (!ptableScroller) return;
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ptableScroller.scrollTo({
        left: ptableTarget(button.dataset.chemlabPtablePosition),
        behavior: reduced ? 'auto' : 'smooth',
      });
      queuePeriodicTableSync();
    });
  });

  if (ptableScroller) ptableScroller.addEventListener('scroll', queuePeriodicTableSync, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100) closeMobileLearningMenu();
    queuePeriodicTableSync();
  }, { passive: true });

  syncPeriodicTableNavigator();
})();
</script>`;
}

export function applyMobileUx(html) {
  if (html.includes(STYLE_MARKER) || html.includes(MENU_MARKER) || html.includes(PTABLE_MARKER) || html.includes(SCRIPT_MARKER)) {
    throw new Error('mobile UX already applied');
  }

  html = replaceRegexOnce(html, /<\/head>/i, `${buildMobileUxStyles()}\n</head>`, 'mobile UX style injection');
  html = replaceRegexOnce(
    html,
    /\s*<!-- Navigation Tabs -->/,
    `\n    ${buildMobileMenuTrigger()}\n\n    <!-- Navigation Tabs -->`,
    'mobile learning menu trigger',
  );
  html = replaceRegexOnce(
    html,
    /<section class="tab-content" id="tab-ptable">/,
    `<section class="tab-content" id="tab-ptable">\n      ${buildPeriodicTableNavigator()}`,
    'periodic table mobile navigator',
  );
  html = replaceRegexOnce(
    html,
    /<\/body>/i,
    `${buildMobileMenuModal()}\n${buildMobileUxRuntime()}\n</body>`,
    'mobile UX runtime injection',
  );
  return html;
}

export const MOBILE_UX_BUILD_TRANSFORMS = Object.freeze([applyMobileUx]);
