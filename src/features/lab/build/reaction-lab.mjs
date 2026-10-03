import { REACTION_LIBRARY } from '../../../data/reactions.mjs';
import { formatReactionEquation, reactionBalance } from '../../../chemistry/reactions.mjs';

function countOccurrences(source, needle) {
  if (!needle) return 0;
  return source.split(needle).length - 1;
}

function replaceExpected(source, needle, replacement, expectedCount, label) {
  const actualCount = countOccurrences(source, needle);
  if (actualCount !== expectedCount) {
    throw new Error(`${label}: expected ${expectedCount} occurrence(s), found ${actualCount}`);
  }
  return source.split(needle).join(replacement);
}

function toReactionLabData(reaction) {
  const balance = reactionBalance(reaction);
  return {
    id: reaction.id,
    equation: formatReactionEquation(reaction),
    reactants: reaction.reactants,
    products: reaction.products,
    balance: {
      reactants: balance.reactants,
      products: balance.products,
    },
    curriculum: reaction.curriculum,
    conditions: reaction.conditions,
    catalyst: reaction.catalyst,
    facts: reaction.facts,
  };
}

function buildReactionLabPanel() {
  return `        <!-- PHASE 2: EVIDENCE-AWARE REACTION LAB -->
        <div id="sandbox-view-reactionlab" class="sandbox-view-panel" style="display: none;">
          <div class="sandbox-layout">
            <div class="sandbox-panel">
              <div>
                <div class="section-title">🧬 Reaction Lab — สมการปฏิกิริยาที่ดุลแล้ว</div>
                <p style="font-size:0.78rem; color:var(--text-muted); line-height:1.6; margin-bottom:0.85rem;">
                  เลือกปฏิกิริยาเพื่อสำรวจสารตั้งต้น ผลิตภัณฑ์ และตรวจสอบการอนุรักษ์จำนวนอะตอม ข้อมูลสถานะ เงื่อนไข ตัวเร่ง และเทอร์โมเคมีจะแสดงเฉพาะเมื่อมีแหล่งอ้างอิงรองรับ
                </p>
                <select id="reactionlab-select" class="search-box" style="width:100%;" onchange="renderReactionLab()"></select>
              </div>

              <div class="theory-box" style="margin-top:1rem;">
                <div class="section-title" style="font-size:0.9rem;">🔎 ขอบเขตของแบบจำลอง</div>
                <ul style="font-size:0.76rem; color:var(--text-muted); padding-left:1.1rem; line-height:1.65;">
                  <li>สมการในหน้านี้ผ่านการตรวจ <b>สมดุลเชิงอะตอม</b> จาก chemistry core</li>
                  <li>การไม่แสดงสถานะหรือเงื่อนไข หมายถึง <b>ยังไม่ใส่ข้อมูลจนกว่าจะมีแหล่งอ้างอิง</b></li>
                  <li>ภาพเคลื่อนไหวเป็น <b>ภาพสัญลักษณ์เพื่อการเรียนรู้</b> ไม่ใช่การจำลองกลไกปฏิกิริยาระดับโมเลกุล</li>
                </ul>
              </div>
            </div>

            <div class="sandbox-stage">
              <div class="equation-display-card" style="align-items:stretch; gap:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; flex-wrap:wrap;">
                  <div>
                    <div style="font-family:var(--font-display); font-size:1.12rem; font-weight:700; color:#fff;">⚗️ สมการดุล (Balanced Equation)</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">สัมประสิทธิ์หน้าสูตรคืออัตราส่วนเชิงสโตอิชิโอเมทรี</div>
                  </div>
                  <span id="reactionlab-balance-badge" class="balance-status-pill balanced" style="margin:0;"><span>✓</span> อะตอมสมดุล</span>
                </div>

                <div id="reactionlab-equation" style="font-family:var(--font-mono); font-size:clamp(1.05rem, 2.4vw, 1.5rem); color:var(--accent-cyan); text-align:center; padding:1rem; border-radius:12px; background:rgba(0,0,0,0.28); border:1px solid rgba(0,240,255,0.16);"></div>

                <div id="reactionlab-visual-stage" style="display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); align-items:center; gap:0.75rem; padding:0.9rem; border-radius:12px; background:radial-gradient(circle at center, rgba(0,240,255,0.08), rgba(0,0,0,0.16)); transition:transform 0.35s ease, box-shadow 0.35s ease;">
                  <div>
                    <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.45rem; text-align:center;">สารตั้งต้น (Reactants)</div>
                    <div id="reactionlab-reactants" style="display:flex; gap:0.45rem; flex-wrap:wrap; justify-content:center;"></div>
                  </div>
                  <div style="font-size:1.6rem; color:var(--accent-amber);">→</div>
                  <div>
                    <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.45rem; text-align:center;">ผลิตภัณฑ์ (Products)</div>
                    <div id="reactionlab-products" style="display:flex; gap:0.45rem; flex-wrap:wrap; justify-content:center;"></div>
                  </div>
                </div>

                <button class="btn-synthesize" style="width:100%;" onclick="previewReactionLab()">
                  <span>✨</span> แสดงภาพสัญลักษณ์ของสมการ
                </button>

                <div>
                  <div class="section-title" style="font-size:0.9rem;">⚖️ ตรวจการอนุรักษ์อะตอม</div>
                  <div id="reactionlab-balance-grid" style="display:flex; gap:0.45rem; flex-wrap:wrap;"></div>
                </div>

                <div class="result-details-grid">
                  <div class="result-detail-item"><span class="detail-label">สถานะสาร:</span><span class="detail-val" id="reactionlab-state-status"></span></div>
                  <div class="result-detail-item"><span class="detail-label">เงื่อนไข:</span><span class="detail-val" id="reactionlab-condition-status"></span></div>
                  <div class="result-detail-item"><span class="detail-label">ตัวเร่ง:</span><span class="detail-val" id="reactionlab-catalyst-status"></span></div>
                  <div class="result-detail-item"><span class="detail-label">เทอร์โมเคมี:</span><span class="detail-val" id="reactionlab-thermo-status"></span></div>
                </div>

                <div id="reactionlab-curriculum" style="font-size:0.75rem; color:var(--text-muted); line-height:1.5;"></div>
              </div>
            </div>
          </div>
        </div>`;
}

function buildReactionLabClientSource() {
  const data = JSON.stringify(REACTION_LIBRARY.map(toReactionLabData));
  return `  // CHEMLAB_REACTION_LAB_BEGIN — generated from validated reaction records
  const REACTION_LAB_DATA = ${data};

  function reactionLabDisplayFormula(formula) {
    const subs = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' };
    return String(formula).replace(/\\d/g, d => subs[d] || d);
  }

  function reactionLabSpeciesChip(species) {
    const coeff = species.coefficient === 1 ? '' : species.coefficient;
    const state = species.state ? '(' + species.state + ')' : '';
    return '<span style="display:inline-flex; align-items:center; justify-content:center; min-width:64px; padding:0.45rem 0.65rem; border-radius:10px; background:rgba(0,240,255,0.08); border:1px solid rgba(0,240,255,0.22); color:#fff; font-family:var(--font-mono); font-weight:700;">' + coeff + reactionLabDisplayFormula(species.formula) + state + '</span>';
  }

  function initReactionLab() {
    const select = document.getElementById('reactionlab-select');
    if (!select) return;
    if (!select.dataset.ready) {
      select.innerHTML = REACTION_LAB_DATA.map((reaction, index) => '<option value="' + reaction.id + '">' + (index + 1) + '. ' + reaction.equation + '</option>').join('');
      select.dataset.ready = 'true';
    }
    renderReactionLab();
  }

  function renderReactionLab() {
    const select = document.getElementById('reactionlab-select');
    const reaction = REACTION_LAB_DATA.find(item => item.id === (select && select.value)) || REACTION_LAB_DATA[0];
    if (!reaction) return;

    const equation = document.getElementById('reactionlab-equation');
    const reactants = document.getElementById('reactionlab-reactants');
    const products = document.getElementById('reactionlab-products');
    const balanceGrid = document.getElementById('reactionlab-balance-grid');
    if (equation) equation.textContent = reaction.equation;
    if (reactants) reactants.innerHTML = reaction.reactants.map(reactionLabSpeciesChip).join('');
    if (products) products.innerHTML = reaction.products.map(reactionLabSpeciesChip).join('');

    const symbols = Array.from(new Set([...Object.keys(reaction.balance.reactants), ...Object.keys(reaction.balance.products)])).sort();
    if (balanceGrid) {
      balanceGrid.innerHTML = symbols.map(symbol => {
        const left = reaction.balance.reactants[symbol] || 0;
        const right = reaction.balance.products[symbol] || 0;
        return '<span style="padding:0.3rem 0.55rem; border-radius:999px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.28); color:var(--accent-emerald); font-family:var(--font-mono); font-size:0.78rem;">' + symbol + ': ' + left + ' = ' + right + '</span>';
      }).join('');
    }

    const hasStates = [...reaction.reactants, ...reaction.products].every(species => species.state && species.stateSource);
    const stateStatus = document.getElementById('reactionlab-state-status');
    const conditionStatus = document.getElementById('reactionlab-condition-status');
    const catalystStatus = document.getElementById('reactionlab-catalyst-status');
    const thermoStatus = document.getElementById('reactionlab-thermo-status');
    if (stateStatus) stateStatus.textContent = hasStates ? 'มีข้อมูลอ้างอิง' : 'ยังไม่ระบุ — รอแหล่งอ้างอิง';
    if (conditionStatus) conditionStatus.textContent = reaction.conditions.length ? reaction.conditions.map(item => item.text).join(' • ') : 'ยังไม่ระบุ — รอแหล่งอ้างอิง';
    if (catalystStatus) catalystStatus.textContent = reaction.catalyst ? reaction.catalyst.label : 'ยังไม่ระบุ — รอแหล่งอ้างอิง';
    if (thermoStatus) thermoStatus.textContent = reaction.facts && reaction.facts.enthalpyKJMol !== null ? 'มีข้อมูลอ้างอิง' : 'ยังไม่ระบุ — รอแหล่งอ้างอิง';

    const curriculum = document.getElementById('reactionlab-curriculum');
    if (curriculum) {
      curriculum.innerHTML = '<b>แนวทางการเรียน:</b> ' + reaction.curriculum.levels.join(', ') + ' · ' + reaction.curriculum.topics.join(' · ') + '<br><span style="color:var(--text-dim);">หมายเหตุ: metadata นี้ใช้จัดระดับการเรียนภายในแอพ ยังไม่ถือเป็น curriculum certification ขั้นสุดท้าย</span>';
    }
  }

  function previewReactionLab() {
    playSound('success');
    const stage = document.getElementById('reactionlab-visual-stage');
    if (stage) {
      stage.style.transform = 'scale(1.02)';
      stage.style.boxShadow = '0 0 28px rgba(0, 240, 255, 0.22)';
      setTimeout(() => {
        stage.style.transform = 'scale(1)';
        stage.style.boxShadow = 'none';
      }, 450);
    }
    if (typeof confetti === 'function') {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.65 } });
    }
  }
  // CHEMLAB_REACTION_LAB_END`;
}

export function applyReactionLab(html) {
  const beakerButton = `              <button class="sandbox-mode-btn active" id="sb-mode-beaker" onclick="switchSandboxMode('beaker')">
                <span>⚗️</span> บีกเกอร์ผสมสาร
              </button>`;
  const phase2Buttons = `              <button class="sandbox-mode-btn active" id="sb-mode-beaker" onclick="switchSandboxMode('beaker')">
                <span>⚗️</span> สร้างสารประกอบ (Compound Builder)
              </button>
              <button class="sandbox-mode-btn" id="sb-mode-reactionlab" onclick="switchSandboxMode('reactionlab')">
                <span>🧬</span> Reaction Lab
              </button>`;
  html = replaceExpected(html, beakerButton, phase2Buttons, 1, 'Phase 2 sandbox mode buttons');

  html = replaceExpected(
    html,
    '<span>⚡</span> จุดชนวนปฏิกิริยาเคมี (Ignite Reaction)',
    '<span>🧩</span> ประกอบสารจากสัดส่วนนี้ (Build Compound)',
    1,
    'Compound Builder primary action',
  );

  const beakerPanelAnchor = '        <!-- MODE 2: EQUATION BALANCER & STOICHIOMETRY -->';
  html = replaceExpected(
    html,
    beakerPanelAnchor,
    `${buildReactionLabPanel()}\n\n${beakerPanelAnchor}`,
    1,
    'Reaction Lab panel',
  );

  const switchAnchor = '  function switchSandboxMode(mode) {';
  html = replaceExpected(
    html,
    switchAnchor,
    `${buildReactionLabClientSource()}\n\n${switchAnchor}`,
    1,
    'Reaction Lab client logic',
  );

  html = replaceExpected(
    html,
    `    if (mode === 'balancer') {
      setTimeout(initBalancer, 50);`,
    `    if (mode === 'reactionlab') {
      setTimeout(initReactionLab, 50);
    } else if (mode === 'balancer') {
      setTimeout(initBalancer, 50);`,
    1,
    'Reaction Lab sandbox init',
  );

  return html;
}
