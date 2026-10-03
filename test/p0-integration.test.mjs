import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAppHtml } from '../scripts/build-app.mjs';

function section(html, start, end) {
  const startIndex = html.indexOf(start);
  assert.notEqual(startIndex, -1, `missing section start: ${start}`);
  const endIndex = html.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing section end: ${end}`);
  return html.slice(startIndex, endIndex);
}

test('compound synthesis uses formula composition instead of 3D render atoms', async () => {
  const html = await buildAppHtml();
  const synthesis = section(html, 'function runSynthesis()', 'function handleSynthesisSuccess');

  assert.ok(html.includes('function parseFormula('));
  assert.ok(synthesis.includes('parseFormula(mol.formula)'));
  assert.equal(synthesis.includes('mol.atoms.forEach'), false);

  // The current sandbox is still a compound builder in Phase 1. Do not present
  // selected atoms as a balanced chemical reaction equation.
  const formatter = section(html, 'function formatEquation(', 'function viewSynthesizedIn3D');
  assert.ok(formatter.includes('สัดส่วนองค์ประกอบ'));
  assert.equal(formatter.includes("join(' + ')"), false);
});

test('synthesis keeps celebratory effects but does not fabricate thermochemistry', async () => {
  const html = await buildAppHtml();
  const success = section(html, 'function handleSynthesisSuccess', 'function handleRatioMismatch');

  assert.ok(success.includes("confetti({ particleCount: 90"));
  assert.ok(success.includes("spawnBeakerFX('bubbles')"));
  assert.ok(success.includes("spawnBeakerFX('crystal')"));
  assert.ok(success.includes("spawnBeakerFX('flame')"));

  assert.equal(success.includes('const temp = isIonic ? 450'), false);
  assert.equal(success.includes('คายความร้อน (Exothermic, ΔH < 0)'), false);
  assert.ok(success.includes('ไม่มีข้อมูลเทอร์โมเคมีของปฏิกิริยาเฉพาะ'));
});

test('periodic table does not infer a nuclide from standard atomic weight', async () => {
  const html = await buildAppHtml();

  assert.equal(html.includes('Math.round(elem.mass) - elem.num'), false);
  assert.equal(html.includes('Math.round(el.mass) - el.num'), false);
  assert.equal(html.includes('Math.round(mass) - num'), false);
  assert.ok(html.includes('จำนวนนิวตรอนขึ้นกับไอโซโทป'));
  assert.ok(html.includes('ภาพนิวเคลียสเป็นแผนภาพเชิงสัญลักษณ์'));
});

test('nuclear stability UI clearly labels the n/p rule as a simplified model', async () => {
  const html = await buildAppHtml();
  const stability = section(html, 'const npRatio =', 'function sendAtomToMoleculeLab');

  assert.ok(stability.includes('แบบจำลองอย่างง่าย'));
  assert.ok(stability.includes('ไม่ใช่การยืนยันว่าไอโซโทปเสถียรหรือกัมมันตรังสี'));
  assert.equal(stability.includes('อะตอมไม่สลายตัวแผ่รังสี'), false);
  assert.equal(stability.includes('นิวเคลียสไม่เสถียรและจะสลายตัวให้รังสี'), false);
});
