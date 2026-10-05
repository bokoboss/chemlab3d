import { parseFormula, sameComposition } from '../../chemistry/composition.mjs';

export const IONIC_FORMULA_UNIT_IDS = Object.freeze(new Set([
  'nacl', 'cacl2', 'mgo', 'naoh', 'nahco3', 'na2co3', 'caco3',
  'naclo', 'cao', 'ca_oh_2', 'fe2o3', 'mg_oh_2', 'naf', 'caso4',
]));

export const CONTEXT_DEPENDENT_IDS = Object.freeze(new Set([
  'becl2', 'alcl3', 'glycine',
]));

const IONIC_NOTE = 'รายการนี้แสดงหน่วยสูตรหรือส่วนหนึ่งของโครงผลึก ไม่ใช่โมเลกุลเดี่ยว จึงไม่ใช้โมเมนต์ไดโพลของโมเลกุลเป็นคำอธิบายหลัก';
const CONTEXT_NOTE = 'โครงสร้างหรือสภาพประจุของสารนี้อาจเปลี่ยนตามเฟสและสภาวะ โมเดล 3D เป็นภาพประกอบหนึ่งบริบทและต้องพิจารณาบริบทเมื่ออธิบายสมบัติ';
const INCOMPLETE_NOTE = 'โมเดล 3D รายการนี้เป็นภาพประกอบแบบย่อและไม่ได้แสดงอะตอมครบตามสูตร จึงไม่ใช้พิกัดของโมเดลนี้คำนวณไดโพลเชิงปริมาณ';

export function renderAtomComposition(molecule) {
  return (molecule.atoms || []).reduce((composition, atom) => {
    composition[atom.elem] = (composition[atom.elem] ?? 0) + 1;
    return composition;
  }, {});
}

export function stripUnsourcedNumericDipole(polarity = '') {
  return String(polarity)
    .replace(/,?\s*μ\s*=\s*[0-9.]+\s*D/g, '')
    .replace(/\s+,/g, ',')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\(\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function classifyRepresentation(molecule) {
  if (IONIC_FORMULA_UNIT_IDS.has(molecule.id)) return 'ionic-formula-unit';
  if (CONTEXT_DEPENDENT_IDS.has(molecule.id)) return 'context-dependent';
  return 'molecule';
}

export function reviewMoleculeRecord(molecule) {
  const representationKind = classifyRepresentation(molecule);
  const formulaComposition = parseFormula(molecule.formula);
  const renderCompositionComplete = sameComposition(formulaComposition, renderAtomComposition(molecule));
  const reviewedPolarity = stripUnsourcedNumericDipole(molecule.polarity || '');
  const numericDipoleClaimRemoved = reviewedPolarity !== (molecule.polarity || '');

  const representationLabel = representationKind === 'ionic-formula-unit'
    ? 'หน่วยสูตร / ส่วนหนึ่งของโครงผลึกไอออนิก'
    : representationKind === 'context-dependent'
      ? 'โครงสร้างขึ้นกับเฟสหรือชนิดอนุภาค'
      : 'โมเลกุล';

  const representationNote = representationKind === 'ionic-formula-unit'
    ? IONIC_NOTE
    : representationKind === 'context-dependent'
      ? CONTEXT_NOTE
      : renderCompositionComplete ? '' : INCOMPLETE_NOTE;

  const dipoleVectorSupported = representationKind === 'molecule' && renderCompositionComplete;

  return Object.freeze({
    ...molecule,
    polarity: reviewedPolarity,
    educationalQa: Object.freeze({
      representationKind,
      representationLabel,
      representationNote,
      renderCompositionComplete,
      dipoleVectorSupported,
      numericDipoleClaimRemoved,
      claimStatus: 'needs-item-level-source-review',
    }),
  });
}

export function reviewMoleculeLibrary(molecules) {
  return molecules.map(reviewMoleculeRecord);
}

export function summarizeMoleculeReview(molecules) {
  const reviewed = reviewMoleculeLibrary(molecules);
  const byKind = reviewed.reduce((counts, molecule) => {
    const kind = molecule.educationalQa.representationKind;
    counts[kind] = (counts[kind] ?? 0) + 1;
    return counts;
  }, {});
  return Object.freeze({
    total: reviewed.length,
    byKind: Object.freeze(byKind),
    renderCompositionIncomplete: reviewed.filter(m => !m.educationalQa.renderCompositionComplete).map(m => m.id),
    dipoleVectorSupported: reviewed.filter(m => m.educationalQa.dipoleVectorSupported).map(m => m.id),
    numericDipoleClaimsRemoved: reviewed.filter(m => m.educationalQa.numericDipoleClaimRemoved).map(m => m.id),
  });
}
