import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { restoreAcceptedBaseline } from '../scripts/baseline.mjs';
import { buildAppHtml as buildCurrentAppHtml } from '../scripts/build-app.mjs';
import { buildEducationalQaInventory, extractJsonConst } from '../src/education/qa/inventory.mjs';
import { EDUCATIONAL_QA_SOURCES } from '../src/education/qa/sources.mjs';
import { QUEST_DESCRIPTION_PATCHES } from '../src/education/qa/content-review.mjs';
import { reviewMoleculeLibrary, summarizeMoleculeReview } from '../src/education/qa/molecule-review.mjs';
import { applyEducationalQa } from '../src/features/education-qa/build/index.mjs';

test('accepted content inventory remains explicit and reviewable', async () => {
  const html = (await restoreAcceptedBaseline()).toString('utf8');
  const inventory = buildEducationalQaInventory(html);

  assert.deepEqual(inventory.counts, {
    elements: 118,
    molecules: 86,
    quests: 16,
    atomQuiz: 4,
  });
  assert.equal(inventory.flags.questReactionLanguage.length, 16);
  assert.equal(inventory.flags.rawGuideTexExpressions, 17);
  assert.equal(inventory.flags.authoritativeCurriculumHeading, true);
  assert.equal(inventory.flags.numericDipoleClaims.length, 23);
  assert.equal(inventory.flags.missingElectronegativity.length, 24);
  assert.equal(inventory.flags.moleculeRecordsWithReviewableClaims.length, 86);
});

test('every accepted quest has a reviewed Compound Builder description', async () => {
  const html = (await restoreAcceptedBaseline()).toString('utf8');
  const baseline = buildEducationalQaInventory(html);
  assert.equal(Object.keys(QUEST_DESCRIPTION_PATCHES).length, baseline.counts.quests);

  const reviewed = applyEducationalQa(html);
  const inventory = buildEducationalQaInventory(reviewed);
  assert.deepEqual(inventory.flags.questReactionLanguage, []);
  assert.match(reviewed, /ประกอบแบบจำลองสูตรน้ำ \(H₂O\)/);
  assert.match(reviewed, /expanded valence ในแบบจำลองลิวอิสระดับมัธยม/);
  assert.doesNotMatch(reviewed, /"desc":"สังเคราะห์/);
});

test('reviewed guide removes premature curriculum certification and misconception-prone shorthand', async () => {
  const reviewed = applyEducationalQa((await restoreAcceptedBaseline()).toString('utf8'));
  const inventory = buildEducationalQaInventory(reviewed);

  assert.equal(inventory.flags.authoritativeCurriculumHeading, false);
  assert.equal(inventory.flags.rawGuideTexExpressions, 0);
  assert.match(reviewed, /อยู่ระหว่างการตรวจเทียบกับเอกสารหลักสูตรทางการ/);
  assert.match(reviewed, /กฎออกเตตเป็นแนวทางที่มีประโยชน์/);
  assert.match(reviewed, /0 °C และ 100 kPa มีค่าประมาณ 22\.7 L\/mol/);
  assert.match(reviewed, /กรอบ Brønsted–Lowry/);
  assert.doesNotMatch(reviewed, /อิเล็กตรอน \(e⁻\) วิ่งอยู่โดยรอบ/);
});

test('molecule representation QA distinguishes formula units, context-dependent structures and discrete molecules', async () => {
  const html = (await restoreAcceptedBaseline()).toString('utf8');
  const summary = summarizeMoleculeReview(extractJsonConst(html, 'MOLECULES_DATA'));
  assert.deepEqual(summary.byKind, {
    molecule: 69,
    'ionic-formula-unit': 14,
    'context-dependent': 3,
  });
  assert.equal(summary.renderCompositionIncomplete.length, 25);
  assert.equal(summary.dipoleVectorSupported.length, 46);
  assert.equal(summary.numericDipoleClaimsRemoved.length, 23);
});

test('molecule review removes unsourced numeric dipole values without fabricating replacements', async () => {
  const html = (await restoreAcceptedBaseline()).toString('utf8');
  const reviewed = reviewMoleculeLibrary(extractJsonConst(html, 'MOLECULES_DATA'));
  const byId = Object.fromEntries(reviewed.map((entry) => [entry.id, entry]));

  assert.equal(byId.chcl3.polarity, 'โมเลกุลมีขั้ว (Polar)');
  assert.equal(byId.c2h6.polarity, 'ไม่มีขั้ว (Non-polar)');
  assert.equal(byId.chcl3.educationalQa.numericDipoleClaimRemoved, true);
  assert.equal(byId.nacl.educationalQa.representationKind, 'ionic-formula-unit');
  assert.equal(byId.nacl.educationalQa.dipoleVectorSupported, false);
  assert.equal(byId.alcl3.educationalQa.representationKind, 'context-dependent');
  assert.equal(byId.becl2.educationalQa.representationKind, 'context-dependent');
});

test('learner-facing dipole tool is qualitative and does not impute unknown electronegativity', async () => {
  const reviewed = applyEducationalQa((await restoreAcceptedBaseline()).toString('utf8'));
  assert.doesNotMatch(reviewed, /len \* 0\.9/);
  assert.doesNotMatch(reviewed, /e1 \? e1\.en : 2\.5/);
  assert.match(reviewed, /แนวโน้มมีขั้ว \(qualitative\)/);
  assert.match(reviewed, /ไม่ใช่ค่า dipole moment ที่วัดได้/);
  assert.match(reviewed, /ไม่ใช้ molecular dipole กับหน่วยสูตร\/โครงผลึกไอออนิก/);
  assert.match(reviewed, /const saysPolar = polarityText\.includes\('มีขั้ว'\) && !polarityText\.includes\('ไม่มีขั้ว'\)/);
});

test('educational QA evidence registry identifies official curriculum and metrology sources', () => {
  assert.equal(Object.keys(EDUCATIONAL_QA_SOURCES).length, 5);
  assert.match(EDUCATIONAL_QA_SOURCES['obec-science-core-2560'].url, /academic\.obec\.go\.th/);
  assert.match(EDUCATIONAL_QA_SOURCES['ipst-chemistry-guide-2560'].url, /scimath\.org/);
  assert.match(EDUCATIONAL_QA_SOURCES['bipm-si-mole-2026'].url, /bipm\.org/);
  assert.match(EDUCATIONAL_QA_SOURCES['iupac-stp-goldbook-2025'].url, /goldbook\.iupac\.org/);
});

test('production build pipeline applies educational QA before offline packaging', async () => {
  const source = await readFile(new URL('../scripts/build-app.mjs', import.meta.url), 'utf8');
  assert.match(source, /applyEducationalQa\(await buildAppHtml\(\)\)/);

  const html = applyEducationalQa(await buildCurrentAppHtml());
  assert.ok(html.includes('CHEMLAB_EDUCATIONAL_QA_V1'));
  assert.ok(html.includes('CHEMLAB_MOLECULE_QA_PRESENTATION'));
  assert.ok(html.includes('แนวทางทบทวนเคมีระดับมัธยม'));
  assert.ok(html.includes('โครงสร้าง 3D'));
});

test('education QA feature stays independent from scripts layer', async () => {
  const source = await readFile(new URL('../src/features/education-qa/build/index.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /from\s+['"][^'"]*scripts\//);
});
