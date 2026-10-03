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

function replaceSection(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`${label}: start marker not found`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`${label}: end marker not found`);
  return `${source.slice(0, start)}${replacement}\n\n${source.slice(end)}`;
}

export function applyCompoundBuilderSemantics(html) {
  html = replaceExpected(html, '⚗️ การสังเคราะห์ & ไฟฟ้าเคมี', '🧩 การสร้างสูตร & ไฟฟ้าเคมี', 1, 'station title');
  html = replaceExpected(html, '🧪 การทดลองแนะนำ (Preset Experiments)', '🧩 ตัวอย่างสูตรแนะนำ (Preset Compounds)', 1, 'preset title');
  html = replaceExpected(html, '🧪 เลือกธาตุอิสระเข้าบีกเกอร์', '🧩 เลือกธาตุเพื่อประกอบสูตร', 1, 'picker title');
  html = replaceExpected(
    html,
    'คลิกธาตุเพื่อนำเข้าบีกเกอร์ สามารถผสมธาตุใดๆ ได้อย่างอิสระ!',
    'เลือกจำนวนอะตอมเพื่อสำรวจอัตราส่วนองค์ประกอบและสูตรเคมี หน้านี้เป็น Compound Builder ไม่ใช่การจำลองว่าธาตุเหล่านี้ทำปฏิกิริยากันจริง',
    1,
    'builder scope',
  );
  html = replaceExpected(html, '💡 กฎการเกิดพันธะเคมี', '💡 หลักคิดในการประกอบสูตรอย่างง่าย', 1, 'theory title');
  html = replaceExpected(html, 'เช่น Na⁺ + Cl⁻ → NaCl', 'เช่น Na⁺:Cl⁻ = 1:1 → สูตร NaCl', 1, 'ionic example');
  html = replaceExpected(html, 'เช่น C + 2O → CO₂', 'เช่น C:O = 1:2 → สูตร CO₂', 1, 'covalent example');
  html = replaceExpected(
    html,
    '<b>ก๊าซเฉื่อย (หมู่ 8A):</b> มี e⁻ ครบ 8 ตัว เสถียรสูงมาก ไม่ทำปฏิกิริยาทั่วไป',
    '<b>แก๊สมีตระกูล หมู่ 18 (8A):</b> โดยทั่วไปมีปฏิกิริยาต่ำในสภาวะปกติ แต่มีข้อยกเว้น โดยเฉพาะธาตุหนักบางชนิด เช่น Xe',
    1,
    'noble gas scope',
  );
  html = replaceExpected(
    html,
    '<span>⚗️</span> บีกเกอร์ผสมสาร\n                <span class="beaker-mass-indicator"',
    '<span>🧩</span> Compound Builder — แบบจำลองการประกอบสูตร\n                <span class="beaker-mass-indicator"',
    1,
    'builder title',
  );
  html = replaceExpected(
    html,
    '            <!-- Reaction Conditions Toggles -->\n            <div class="conditions-container">',
    `            <div style="font-size:0.72rem; color:var(--text-dim); line-height:1.45; margin:0.35rem 0 0.45rem; text-align:center;">🎛️ เอฟเฟกต์ภาพจำลองด้านล่างมีไว้เพื่อการเรียนรู้และความสนุก ไม่ใช่เงื่อนไขของปฏิกิริยาจริง</div>\n            <div class="conditions-container">`,
    1,
    'effect disclaimer',
  );
  html = replaceExpected(html, '<span>🔥</span> ให้ความร้อน (Δ)', '<span>🔥</span> เอฟเฟกต์ความร้อน', 1, 'heat label');
  html = replaceExpected(html, '<span>⚡</span> กระแสไฟฟ้า\n              </button>\n              <button class="condition-btn" id="cond-cat"', '<span>⚡</span> เอฟเฟกต์ไฟฟ้า\n              </button>\n              <button class="condition-btn" id="cond-cat"', 1, 'electric label');
  html = replaceExpected(html, '<span>🧪</span> เติมตัวเร่งปฏิกิริยา', '<span>🧪</span> เอฟเฟกต์ตัวเร่ง', 1, 'catalyst label');
  html = replaceExpected(html, '🌡️ อุณหภูมิ:</span>', '🌡️ ข้อมูลอุณหภูมิ:</span>', 1, 'temperature label');
  html = replaceExpected(html, '>25°C</span>\n            </div>\n\n            <!-- Added Elements Chips -->', '>ไม่ระบุ</span>\n            </div>\n\n            <!-- Added Elements Chips -->', 1, 'initial temperature');
  html = replaceExpected(
    html,
    "    document.getElementById('thermo-fill-el').style.width = '25%';\n    document.getElementById('thermo-temp-text').innerText = '25°C';",
    "    document.getElementById('thermo-fill-el').style.width = '0%';\n    document.getElementById('thermo-temp-text').innerText = 'ไม่ระบุ';",
    1,
    'temperature reset',
  );

  html = replaceExpected(html, 'alert("กรุณาใส่ธาตุลงในบีกเกอร์ก่อนจุดชนวนปฏิกิริยา");', 'alert("กรุณาเลือกธาตุและจำนวนอะตอมก่อนประกอบสูตร");', 1, 'empty guidance');
  html = replaceExpected(html, '🎉 สังเคราะห์สารประกอบสำเร็จ!', '✅ ประกอบสูตรในแบบจำลองสำเร็จ', 1, 'success heading');
  html = replaceExpected(html, '<b>สารที่เกิดขึ้น:</b>', '<b>สูตร/โมเดลที่เลือกได้:</b>', 1, 'result label');
  html = replaceExpected(html, 'พบปฏิกิริยาที่เป็นไปได้! แต่อัตราส่วนยังไม่สมดุล', 'พบสูตรที่ใช้ธาตุชุดนี้ แต่อัตราส่วนยังไม่ตรง', 1, 'ratio heading');
  html = replaceExpected(html, 'ซึ่งยังไม่ตรงกับอัตราส่วนที่เสถียรตามกฎออกเตตหรือประจุไฟฟ้า', 'ซึ่งยังไม่ตรงกับองค์ประกอบของสูตรที่บันทึกไว้', 1, 'ratio claim');
  html = replaceExpected(html, 'เพื่อจุดชนวนปฏิกิริยาทันทีหรือไม่?', 'เพื่อประกอบสูตรในแบบจำลองหรือไม่?', 1, 'auto-fix prompt');
  html = replaceExpected(html, 'สารประกอบไอออนิกสามารถเกิดขึ้นได้!', 'แบบจำลองสูตรไอออนิกเบื้องต้น', 1, 'dynamic ionic heading');
  html = replaceExpected(
    html,
    'descTh: `สารประกอบไอออนิกสังเคราะห์ใหม่ เกิดจาก ${mInfo.name} ถ่ายโอนอิเล็กตรอนให้ ${xInfo.name} ผลึกยึดเหนี่ยวด้วยแรงดึงดูดทางไฟฟ้าสถิต`',
    'descTh: `แบบจำลองสูตรไอออนิกอย่างง่ายของ ${mInfo.name} และ ${xInfo.name} ใช้เพื่อฝึกสัดส่วนประจุ ไม่ใช่หลักฐานว่าปฏิกิริยาหรือเฟสผลึกนี้เกิดขึ้นจริง`',
    1,
    'dynamic ionic description',
  );
  html = replaceExpected(
    html,
    'realWorld: "สารประกอบอนินทรีย์ โครงข่ายผลึกไอออนิกจุดหลอมเหลวสูง นำไฟฟ้าได้เมื่อหลอมเหลวหรือละลายน้ำ"',
    'realWorld: "แบบจำลองการเรียนรู้; สมบัติจริงต้องตรวจสอบจากสารและโครงสร้างผลึกเฉพาะ"',
    1,
    'dynamic ionic property scope',
  );
  html = replaceExpected(
    html,
    'bondType: `พันธะไอออนิก (Ionic Character ${ionicPct}%)`, polarity: "สารประกอบไอออนิก",',
    'bondType: `พันธะไอออนิก (ค่าประมาณ ionic character ≈ ${ionicPct}%)`, polarity: "สารประกอบไอออนิก", generatedModel: true, evidenceStatus: "illustrative",',
    1,
    'dynamic ionic evidence scope',
  );
  html = replaceExpected(
    html,
    '      id, formula, nameTh, nameEn: `${formula} Molecule`, level: "ม.4",\n      geometry: "เส้นตรง (Linear)", vsepr: "AX",\n      bondType: "พันธะโคเวเลนต์", polarity: "โมเลกุลมีขั้ว",\n      deltaEN: "1.0",',
    '      id, formula, nameTh, nameEn: `${formula} Molecule`, level: "ม.4",\n      geometry: "เส้นตรง (Linear; โมเลกุลไดอะตอม)", vsepr: "Diatomic",\n      bondType: "พันธะโคเวเลนต์", polarity: "โมเลกุลไดอะตอมต่างชนิด — ตรวจขั้วจาก ΔEN",\n      deltaEN: (() => { const a = ELEMENTS_DATA.find(e => e.sym === k1); const b = ELEMENTS_DATA.find(e => e.sym === k2); return Number.isFinite(a?.en) && Number.isFinite(b?.en) ? Math.abs(a.en - b.en).toFixed(2) : "ไม่ระบุ"; })(),',
    1,
    'dynamic covalent EN',
  );
  html = replaceExpected(html, 'realWorld: "สารประกอบโคเวเลนต์ที่สังเคราะห์ขึ้นในห้องทดลอง"', 'realWorld: "แบบจำลองการเรียนรู้; เงื่อนไขการเกิดและสมบัติจริงต้องอ้างอิงข้อมูลของสารนั้นโดยเฉพาะ"', 1, 'dynamic covalent scope');
  html = replaceExpected(
    html,
    'bondType: "พันธะโคเวเลนต์", polarity: "โมเลกุลไดอะตอมต่างชนิด — ตรวจขั้วจาก ΔEN",',
    'bondType: "พันธะโคเวเลนต์", polarity: "โมเลกุลไดอะตอมต่างชนิด — ตรวจขั้วจาก ΔEN", generatedModel: true, evidenceStatus: "illustrative",',
    1,
    'dynamic covalent evidence scope',
  );

  const unsupported = `  function handleNonReactingMixture(keys) {
    playSound('fail');
    const resultBox = document.getElementById('reaction-result-box');
    resultBox.className = 'reaction-result result-fail';
    let guidance = 'Compound Builder รุ่นนี้ยังไม่มีแบบจำลองสูตรสำหรับชุดธาตุที่เลือก การไม่พบผลลัพธ์ไม่ควรตีความว่าไม่มีปฏิกิริยาเคมีเกิดขึ้นจริง';
    if (keys.some(k => INERT_GASES.includes(k))) {
      guidance = 'แก๊สมีตระกูลโดยทั่วไปมีปฏิกิริยาต่ำในสภาวะปกติ แต่มีข้อยกเว้น โดยเฉพาะ Xe และ Kr; หน้านี้จึงไม่ใช้กฎ “ไม่เกิดปฏิกิริยา” แบบตายตัว';
    } else if (keys.every(k => METALS_TABLE[k])) {
      guidance = 'โลหะหลายชนิดสามารถเกิดโลหะผสมหรือสารประกอบระหว่างโลหะได้ แต่ Compound Builder รุ่นนี้ไม่ได้ทำนายแผนภาพเฟส โครงสร้างผลึก หรือเสถียรภาพของระบบโลหะ';
    }
    resultBox.innerHTML = \`<div style="font-weight:700; color:var(--accent-amber); margin-bottom:0.4rem;">🧭 แบบจำลองยังไม่รองรับชุดนี้</div><p style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">\${guidance}</p>\`;
  }`;
  html = replaceSection(html, '  function handleNonReactingMixture(keys) {', '  function createDynamicIonicMolecule(', unsupported, 'unsupported mixture guidance');

  html = replaceExpected(html, 'คลังสารเคมีที่ค้นพบ (Pokédex)', 'คลังสารที่ปลดล็อก (Collection)', 1, 'collection quick tool');
  html = replaceExpected(html, 'สมุดสะสมสารประกอบ (Compound Discovery Log)', 'สมุดสะสมสารประกอบ (Compound Collection)', 1, 'collection title');
  html = replaceExpected(html, 'ค้นพบแล้ว: 0 / 58', 'ปลดล็อกแล้ว: 0 / 58', 1, 'collection initial counter');
  html = replaceExpected(html, 'สารประกอบที่สังเคราะห์สำเร็จในห้องแล็บจะถูกบันทึกในสมุดสะสมนี้ คลิกที่สารที่ปลดล็อกเพื่อเปิดส่องโมเดล 3D ได้ทันที!', 'สูตรสารที่ประกอบได้ใน Compound Builder จะถูกปลดล็อกในสมุดสะสมนี้ คลิกที่รายการที่ปลดล็อกเพื่อเปิดดูโมเดล 3D ได้ทันที', 1, 'collection explanation');
  html = replaceExpected(html, '`ค้นพบแล้ว: ${discoveredSet.size} / ${MOLECULES_DATA.length}`', '`ปลดล็อกแล้ว: ${discoveredSet.size} / ${MOLECULES_DATA.length}`', 1, 'collection live counter');
  html = replaceExpected(html, '✔️ ค้นพบแล้ว', '✔️ ปลดล็อกแล้ว', 1, 'collection unlocked');
  html = replaceExpected(html, 'ยังไม่ค้นพบ', 'ยังไม่ปลดล็อก', 1, 'collection locked');
  html = replaceExpected(html, 'title="ดูสารประกอบที่ค้นพบ"', 'title="ดูสารประกอบที่ปลดล็อก"', 1, 'collection tooltip');
  html = replaceExpected(html, 'ฝึกฝนทักษะการสังเคราะห์สารประกอบตามหลักสูตร ม.1 - ม.6', 'ฝึกฝนการประกอบสูตร สำรวจโครงสร้าง และทบทวนแนวคิดเคมีระดับมัธยม', 1, 'quest intro');

  const report = `  function openLabReportModal() {
    playSound('click');
    const modal = document.getElementById('lab-report-modal');
    const area = document.getElementById('lab-report-printable-area');
    if (!modal || !area) return;
    const keys = Object.keys(beakerElements);
    const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    let molName = 'ยังไม่ได้ประกอบสูตร';
    let formula = '—';
    let composition = '—';
    if (lastSynthesizedInfo) {
      molName = lastSynthesizedInfo.nameTh;
      formula = lastSynthesizedInfo.formula;
      composition = lastSynthesizedInfo.equation || lastSynthesizedInfo.formula;
    }
    const selectedAtomsText = keys.length ? keys.map(k => \`\${beakerElements[k]} อะตอมของ \${k}\`).join(', ') : 'ยังไม่ได้เลือกอะตอม';
    const visualEffectsText = [beakerConditions.heat ? 'เอฟเฟกต์ความร้อน' : null, beakerConditions.elec ? 'เอฟเฟกต์ไฟฟ้า' : null, beakerConditions.cat ? 'เอฟเฟกต์ตัวเร่ง' : null].filter(Boolean).join(', ') || 'ไม่ได้เปิดเอฟเฟกต์เพิ่มเติม';
    area.innerHTML = \`
      <div style="border-bottom:2px solid var(--accent-cyan); padding-bottom:0.75rem; margin-bottom:1rem;"><h2 style="font-family:var(--font-display); font-size:1.35rem; color:#fff;">📋 ใบงาน Compound Builder (ChemLab 3D)</h2><div style="font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;"><span>แบบฝึกหัดภายในแอพ — ยังไม่ใช่เอกสารรับรองหลักสูตร</span><span>วันที่บันทึก: \${dateStr}</span></div></div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem; font-size:0.85rem;"><div><b>ชื่อผู้เรียน:</b> <input type="text" placeholder="ระบุชื่อ-นามสกุล / เลขที่" class="search-box" style="display:inline-block; width:65%; padding:0.25rem 0.5rem; font-size:0.82rem;"></div><div><b>ระดับชั้น:</b> มัธยมศึกษาปีที่ ________ ห้อง _____</div></div>
      <div style="background:rgba(0,0,0,0.3); border-radius:8px; padding:1rem; margin-bottom:1rem; font-size:0.85rem; line-height:1.6;"><div><b>1. สูตร/โมเดลที่ประกอบได้:</b> <span style="color:var(--accent-cyan); font-weight:700;">\${molName} (\${formula})</span></div><div><b>2. สัดส่วนองค์ประกอบ:</b> <span style="font-family:var(--font-mono); color:var(--accent-amber);">\${composition}</span></div><div><b>3. อะตอมที่เลือก:</b> \${selectedAtomsText}</div><div><b>4. เอฟเฟกต์ภาพที่เปิด:</b> \${visualEffectsText}</div></div>
      <div style="font-size:0.85rem; margin-bottom:1rem;"><b>5. บันทึกสิ่งที่สังเกต/ข้อสรุป:</b><div style="border:1px dashed rgba(255,255,255,0.2); border-radius:6px; padding:0.75rem; min-height:70px; margin-top:0.35rem; font-size:0.8rem; color:var(--text-muted);">เปรียบเทียบจำนวนอะตอมกับสูตรที่ได้ และระบุข้อจำกัดของแบบจำลอง โดยไม่สรุปว่าเป็นปฏิกิริยาจริงหากยังไม่มีข้อมูลจาก Reaction Lab หรือแหล่งอ้างอิง</div></div>
      <div style="font-size:0.75rem; line-height:1.5; color:var(--text-dim); background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.18); border-radius:8px; padding:0.65rem;">⚠️ Compound Builder เป็นเครื่องมือฝึกสูตรและองค์ประกอบ ส่วนข้อมูลปฏิกิริยาจริงให้ตรวจใน Reaction Lab ซึ่งใช้ข้อมูลแบบมี provenance</div>
    \`;
    modal.style.display = 'flex';
  }`;
  html = replaceSection(html, '  function openLabReportModal() {', '  function closeLabReportModal(e) {', report, 'builder worksheet');

  return html;
}
