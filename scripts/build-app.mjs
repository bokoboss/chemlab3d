import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { PROJECT_ROOT, restoreAcceptedBaseline } from './baseline.mjs';

const ELECTRON_CORE_PATH = join(PROJECT_ROOT, 'src', 'chemistry', 'electron-config.mjs');
const COMPOSITION_CORE_PATH = join(PROJECT_ROOT, 'src', 'chemistry', 'composition.mjs');
const REACTION_FACTS_CORE_PATH = join(PROJECT_ROOT, 'src', 'chemistry', 'reaction-facts.mjs');

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
  if (source.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error(`${label}: start marker is not unique`);
  }
  return `${source.slice(0, start)}${replacement}\n\n${source.slice(end)}`;
}

function toClassicBrowserSource(moduleSource) {
  return moduleSource.replace(/^export\s+/gm, '');
}

export async function buildAppHtml() {
  let html = (await restoreAcceptedBaseline()).toString('utf8');
  const electronCore = toClassicBrowserSource(await readFile(ELECTRON_CORE_PATH, 'utf8'));
  const compositionCore = toClassicBrowserSource(await readFile(COMPOSITION_CORE_PATH, 'utf8'));
  const reactionFactsCore = toClassicBrowserSource(await readFile(REACTION_FACTS_CORE_PATH, 'utf8'));

  const coreAnchor = '  // GLOBAL BOHR SHELL CALCULATOR (Accessible Everywhere)';
  const presentationHelpers = `  function formatThermochemistryForResult(thermochemistry) {
    if (!thermochemistry || thermochemistry.status !== 'known') {
      return 'ไม่มีข้อมูลเทอร์โมเคมีของปฏิกิริยาเฉพาะ';
    }
    const labels = {
      exothermic: 'คายความร้อน (Exothermic)',
      endothermic: 'ดูดความร้อน (Endothermic)',
      thermoneutral: 'เทอร์โมนิวทรัล (Thermoneutral)',
    };
    return \`${'${labels[thermochemistry.type]}'} — ΔH = ${'${thermochemistry.enthalpyKJMol}'} kJ/mol\`;
  }`;

  const injectedCore = [
    '  // CHEMLAB_CHEMISTRY_CORE_BEGIN — generated from tested domain modules',
    electronCore.split('\n').map((line) => `  ${line}`).join('\n'),
    '  // CHEMLAB_COMPOSITION_CORE_BEGIN',
    compositionCore.split('\n').map((line) => `  ${line}`).join('\n'),
    '  // CHEMLAB_COMPOSITION_CORE_END',
    '  // CHEMLAB_REACTION_FACTS_CORE_BEGIN',
    reactionFactsCore.split('\n').map((line) => `  ${line}`).join('\n'),
    '  // CHEMLAB_REACTION_FACTS_CORE_END',
    presentationHelpers,
    '  // CHEMLAB_CHEMISTRY_CORE_END',
    '',
    coreAnchor,
  ].join('\n');

  html = replaceExpected(html, coreAnchor, injectedCore, 1, 'chemistry-core injection');

  const legacyBohr = `  function calculateBohrShells(num) {\n    const maxCapacity = [2, 8, 18, 32, 50];\n    let remaining = num;\n    const shells = [];\n    for (const max of maxCapacity) {\n      if (remaining <= 0) break;\n      const count = Math.min(remaining, max);\n      shells.push(count);\n      remaining -= count;\n    }\n    return shells;\n  }`;

  const hardenedBohr = `  function calculateBohrShells(electronCount, atomicNumber = electronCount) {\n    if (electronCount === 0) return [];\n    return getSpeciesShellPopulation(atomicNumber, electronCount);\n  }`;

  html = replaceExpected(html, legacyBohr, hardenedBohr, 1, 'Bohr shell adapter');
  html = replaceExpected(
    html,
    'const shells = calculateBohrShells(atomState.e);',
    'const shells = calculateBohrShells(atomState.e, atomState.p);',
    2,
    'Atom Studio shell call sites',
  );
  html = replaceExpected(
    html,
    'renderOrbitalDiagram(atomState.e);',
    'renderOrbitalDiagram(atomState.e, atomState.p);',
    1,
    'Atom Studio orbital call site',
  );

  const orbitalAdapter = `  function getSubshellElectronConfig(electronCount, atomicNumber = electronCount) {\n    const boxCounts = { s: 1, p: 3, d: 5, f: 7 };\n    return getElectronSubshells(atomicNumber, electronCount).map(({ n, orbital, electrons }) => ({\n      name: \`${'${n}${orbital}'}\`,\n      n,\n      type: orbital,\n      count: electrons,\n      boxes: boxCounts[orbital],\n    }));\n  }`;

  html = replaceSection(
    html,
    '  function getSubshellElectronConfig(num) {',
    '  function renderOrbitalDiagram(num) {',
    orbitalAdapter,
    'orbital configuration adapter',
  );

  html = replaceExpected(
    html,
    'function renderOrbitalDiagram(num) {',
    'function renderOrbitalDiagram(electronCount, atomicNumber = electronCount) {',
    1,
    'orbital renderer signature',
  );
  html = replaceExpected(html, 'if (num === 0) {', 'if (electronCount === 0) {', 1, 'zero-electron orbital state');
  html = replaceExpected(
    html,
    'const config = getSubshellElectronConfig(num);',
    'const config = getSubshellElectronConfig(electronCount, atomicNumber);',
    1,
    'orbital renderer chemistry source',
  );
  html = replaceExpected(html, 'if (num >= 18) noble =', 'if (electronCount >= 18) noble =', 1, 'argon core label');
  html = replaceExpected(html, 'else if (num >= 10) noble =', 'else if (electronCount >= 10) noble =', 1, 'neon core label');
  html = replaceExpected(html, 'else if (num >= 2) noble =', 'else if (electronCount >= 2) noble =', 1, 'helium core label');

  const renderAtomCompositionCounter = `      const countMap = {};
      mol.atoms.forEach(a => {
        countMap[a.elem] = (countMap[a.elem] || 0) + 1;
      });`;

  html = replaceExpected(
    html,
    renderAtomCompositionCounter,
    '      const countMap = parseFormula(mol.formula);',
    2,
    'synthesis formula composition source',
  );

  const legacyThermometer = `    const temp = isIonic ? 450 : (isGas ? 95 : 180);
    document.getElementById('thermo-fill-el').style.width = '85%';
    document.getElementById('thermo-temp-text').innerText = \`${'${temp}'}°C\`;`;

  const hardenedThermometer = `    const reactionFacts = makeReactionFacts(mol.reactionFacts || {});
    const thermochemistry = describeThermochemistry(reactionFacts);
    const thermochemistrySummary = thermochemistry.status === 'known'
      ? formatThermochemistryForResult(thermochemistry)
      : 'ไม่มีข้อมูลเทอร์โมเคมีของปฏิกิริยาเฉพาะ';
    const thermoFill = document.getElementById('thermo-fill-el');
    const thermoTempText = document.getElementById('thermo-temp-text');
    if (reactionFacts.temperatureC === null) {
      if (thermoFill) thermoFill.style.width = '0%';
      if (thermoTempText) thermoTempText.innerText = 'ไม่ระบุ';
    } else {
      const displayPercent = Math.max(0, Math.min(100, (reactionFacts.temperatureC / 500) * 100));
      if (thermoFill) thermoFill.style.width = \`${'${displayPercent}'}%\`;
      if (thermoTempText) thermoTempText.innerText = \`${'${reactionFacts.temperatureC}'}°C\`;
    }`;

  html = replaceExpected(
    html,
    legacyThermometer,
    hardenedThermometer,
    1,
    'synthesis thermochemistry facts',
  );

  html = replaceExpected(
    html,
    '<span class="detail-val" style="color:var(--accent-rose);">คายความร้อน (Exothermic, ΔH < 0)</span>',
    '<span class="detail-val" style="color:var(--accent-rose);">${thermochemistrySummary}</span>',
    1,
    'synthesis thermochemistry presentation',
  );

  const compositionFormatter = `  function formatEquation(elemMap, mol) {
    const composition = Object.entries(elemMap)
      .map(([sym, count]) => \`${'${sym}'}:${'${count}'}\`)
      .join(' • ');
    return \`สัดส่วนองค์ประกอบ: ${'${composition}'} &nbsp;|&nbsp; สูตรที่ได้: <b>${'${mol.formula}'}</b>\`;
  }`;

  html = replaceSection(
    html,
    '  function formatEquation(elemMap, mol) {',
    '  function viewSynthesizedIn3D(moleculeId) {',
    compositionFormatter,
    'compound-builder result formatter',
  );

  html = replaceExpected(
    html,
    '    const neutrons = Math.max(0, Math.round(elem.mass) - elem.num);',
    "    const neutronNotice = 'จำนวนนิวตรอนขึ้นกับไอโซโทป';",
    1,
    'periodic-table neutron semantics',
  );
  html = replaceExpected(
    html,
    '<span><span style="color:#38bdf8; font-weight:bold;">●</span> นิวตรอน: <b>${neutrons}</b> n⁰</span>',
    '<span><span style="color:#38bdf8; font-weight:bold;">●</span> นิวตรอน: <b>${neutronNotice}</b></span>',
    1,
    'periodic-table neutron display',
  );
  html = replaceExpected(
    html,
    '          <span><span style="color:#fbbf24; font-weight:bold;">●</span> อิเล็กตรอน: <b>${elem.num}</b> e⁻</span>\n        </div>\n      </div>',
    '          <span><span style="color:#fbbf24; font-weight:bold;">●</span> อิเล็กตรอน: <b>${elem.num}</b> e⁻</span>\n        </div>\n        <div style="margin-top:0.45rem; font-size:0.7rem; color:var(--text-dim); text-align:center;">ℹ️ ภาพนิวเคลียสเป็นแผนภาพเชิงสัญลักษณ์ ไม่ได้แทนจำนวน n จริง; ต้องระบุเลขมวลของไอโซโทปก่อนจึงคำนวณนิวตรอนได้</div>\n      </div>',
    1,
    'periodic-table isotope disclaimer',
  );
  html = replaceExpected(
    html,
    'onclick="openInAtomStudio(${elem.num}, ${elem.mass})"',
    'onclick="openInAtomStudio(${elem.num})"',
    1,
    'Atom Studio launch without inferred isotope',
  );

  const legacyNucleusCounts = `      const pCount = el.num;
      const nCount = Math.max(0, Math.round(el.mass) - el.num);
      const totalNucleons = pCount + nCount;
      const nucleusRadius = Math.min(22, Math.max(12, Math.sqrt(totalNucleons) * 2.2));`;

  const schematicNucleusCounts = `      const pCount = el.num;
      // Schematic nucleus only: the periodic-table record does not identify a nuclide.
      // Radius/dots preserve the visual treatment without encoding a fabricated neutron count.
      const schematicNucleons = Math.max(2, pCount * 2);
      const nucleusRadius = Math.min(22, Math.max(12, Math.sqrt(schematicNucleons) * 2.2));`;

  html = replaceExpected(
    html,
    legacyNucleusCounts,
    schematicNucleusCounts,
    1,
    'periodic-table schematic nucleus',
  );
  html = replaceExpected(
    html,
    'const maxDrawNucleons = Math.min(24, totalNucleons);',
    'const maxDrawNucleons = Math.min(24, schematicNucleons);',
    1,
    'schematic nucleon rendering',
  );

  const atomStudioLaunch = `  function openInAtomStudio(num) {
    closeElemModal();
    atomState.p = num;
    atomState.n = 0;
    atomState.e = num;
    switchTab('atom');
    setTimeout(() => {
      updateAtomUI();
      drawAtomCanvas();
      const stabTitle = document.getElementById('stability-title');
      const stabDesc = document.getElementById('stability-desc');
      if (stabTitle) {
        stabTitle.style.color = 'var(--accent-cyan)';
        stabTitle.innerHTML = '🧪 เลือกไอโซโทปใน Atom Studio';
      }
      if (stabDesc) {
        stabDesc.innerText = 'ตั้งค่าโปรตอนและอิเล็กตรอนตามธาตุแล้ว แต่ยังไม่กำหนดจำนวนนิวตรอน กรุณาปรับ n⁰ เพื่อเลือกเลขมวล/ไอโซโทปที่ต้องการศึกษา';
      }
    }, 80);
  }`;

  html = replaceSection(
    html,
    '  function openInAtomStudio(num, mass) {',
    '  function closeElemModal(e) {',
    atomStudioLaunch,
    'Atom Studio isotope-safe launch',
  );

  const stabilityModel = `    const inSimpleBand = (atomState.p <= 20 && npRatio >= 0.8 && npRatio <= 1.25) || (atomState.p > 20 && npRatio >= 1.0 && npRatio <= 1.55);
    const stabTitle = document.getElementById('stability-title');
    const stabDesc = document.getElementById('stability-desc');

    if (inSimpleBand) {
      stabTitle.style.color = 'var(--accent-emerald)';
      stabTitle.innerHTML = '🧭 แนวโน้มตามแบบจำลองอย่างง่าย: อยู่ในช่วง Band of Stability';
      stabDesc.innerText = \`n/p = ${'${npRatio.toFixed(2)}'} อยู่ในช่วงแนวโน้มของแบบจำลอง n/p อย่างง่าย ใช้เพื่อสังเกตแนวโน้มเท่านั้น ไม่ใช่การยืนยันว่าไอโซโทปเสถียรหรือกัมมันตรังสี; การสรุปจริงต้องอ้างอิงข้อมูลนิวไคลด์และการสลายตัว\`;
    } else {
      stabTitle.style.color = 'var(--accent-amber)';
      stabTitle.innerHTML = '🧭 แนวโน้มตามแบบจำลองอย่างง่าย: อยู่นอกช่วง Band of Stability';
      stabDesc.innerText = \`n/p = ${'${npRatio.toFixed(2)}'} อยู่นอกช่วงแนวโน้มของแบบจำลอง n/p อย่างง่าย ใช้เพื่อสังเกตแนวโน้มเท่านั้น ไม่ใช่การยืนยันว่าไอโซโทปเสถียรหรือกัมมันตรังสี; การสรุปจริงต้องอ้างอิงข้อมูลนิวไคลด์และการสลายตัว\`;
    }
  }`;

  html = replaceSection(
    html,
    '    const isStable = (atomState.p <= 20 && npRatio >= 0.8 && npRatio <= 1.25) || (atomState.p > 20 && npRatio >= 1.0 && npRatio <= 1.55);',
    '  function sendAtomToMoleculeLab() {',
    stabilityModel,
    'nuclear stability disclaimer',
  );

  return html;
}

export async function writeBuiltApp(outputPath = join(PROJECT_ROOT, 'dist', 'index.html')) {
  const html = await buildAppHtml();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
  return outputPath;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const requestedPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : undefined;
  const outputPath = await writeBuiltApp(requestedPath);
  console.log(outputPath);
}
