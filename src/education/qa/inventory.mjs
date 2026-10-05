const MOLECULE_REVIEW_FIELDS = Object.freeze([
  'geometry', 'vsepr', 'bondType', 'polarity', 'deltaEN', 'descTh', 'realWorld',
]);

export function extractJsonConst(html, name) {
  const marker = `const ${name} = `;
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error(`${name}: dataset marker not found`);
  const start = markerIndex + marker.length;
  const terminator = html.indexOf(';\n', start);
  if (terminator === -1) throw new Error(`${name}: dataset terminator not found`);
  return JSON.parse(html.slice(start, terminator));
}

export function replaceJsonConst(html, name, value) {
  const marker = `const ${name} = `;
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error(`${name}: dataset marker not found`);
  const start = markerIndex + marker.length;
  const terminator = html.indexOf(';\n', start);
  if (terminator === -1) throw new Error(`${name}: dataset terminator not found`);
  return `${html.slice(0, start)}${JSON.stringify(value)}${html.slice(terminator)}`;
}

export function buildEducationalQaInventory(html) {
  const elements = extractJsonConst(html, 'ELEMENTS_DATA');
  const molecules = extractJsonConst(html, 'MOLECULES_DATA');
  const quests = extractJsonConst(html, 'QUESTS_DATA');
  const atomQuiz = extractJsonConst(html, 'ATOM_QUIZ');

  const guideStart = html.indexOf('<section class="tab-content" id="tab-guide">');
  const guideEnd = guideStart === -1 ? -1 : html.indexOf('</section>', guideStart);
  const guide = guideStart === -1 || guideEnd === -1 ? '' : html.slice(guideStart, guideEnd);

  const numericDipoleClaims = molecules.filter((entry) => /(?:μ\s*=|\bD\))/.test(entry.polarity || ''));
  const ionicMoleculeSchema = molecules.filter((entry) =>
    entry.category === 'ionic' || /(?:ไอออน|ionic)/i.test(entry.bondType || ''),
  );
  const missingElectronegativity = elements.filter((entry) => entry.en == null);
  const questReactionLanguage = quests.filter((entry) => /^(?:สังเคราะห์|ผสม|สร้าง)/.test((entry.desc || '').trim()));
  const moleculeClaimsNeedingReview = molecules.filter((entry) =>
    MOLECULE_REVIEW_FIELDS.some((field) => String(entry[field] ?? '').trim().length > 0),
  );

  return Object.freeze({
    counts: Object.freeze({
      elements: elements.length,
      molecules: molecules.length,
      quests: quests.length,
      atomQuiz: atomQuiz.length,
    }),
    flags: Object.freeze({
      numericDipoleClaims: numericDipoleClaims.map((entry) => entry.id),
      ionicMoleculeSchema: ionicMoleculeSchema.map((entry) => entry.id),
      missingElectronegativity: missingElectronegativity.map((entry) => entry.sym),
      questReactionLanguage: questReactionLanguage.map((entry) => entry.id),
      rawGuideTexExpressions: (guide.match(/\$[^$]+\$/g) || []).length,
      authoritativeCurriculumHeading: guide.includes('สรุปเนื้อหาเคมีตามหลักสูตรแกนกลาง'),
      moleculeRecordsWithReviewableClaims: moleculeClaimsNeedingReview.map((entry) => entry.id),
    }),
  });
}

export const EDUCATIONAL_QA_REVIEW_FIELDS = MOLECULE_REVIEW_FIELDS;
