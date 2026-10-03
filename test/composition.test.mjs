import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFormula, sameComposition } from '../src/chemistry/composition.mjs';

const cases = [
  ['H2O', { H: 2, O: 1 }],
  ['NaCl', { Na: 1, Cl: 1 }],
  ['C6H12O6', { C: 6, H: 12, O: 6 }],
  ['Ca(OH)2', { Ca: 1, O: 2, H: 2 }],
  ['Al2(SO4)3', { Al: 2, S: 3, O: 12 }],
  ['K4[Fe(CN)6]', { K: 4, Fe: 1, C: 6, N: 6 }],
  ['CuSO4·5H2O', { Cu: 1, S: 1, O: 9, H: 10 }],
  ['CuSO4.5H2O', { Cu: 1, S: 1, O: 9, H: 10 }],
  ['(NH4)2SO4', { N: 2, H: 8, S: 1, O: 4 }],
];

for (const [formula, expected] of cases) {
  test(`parses ${formula}`, () => {
    assert.deepEqual(parseFormula(formula), expected);
  });
}

test('accepts Unicode subscript digits used by ChemLab display formulas', () => {
  assert.deepEqual(parseFormula('H₂SO₄'), { H: 2, S: 1, O: 4 });
  assert.deepEqual(parseFormula('C₆H₁₂O₆'), { C: 6, H: 12, O: 6 });
});

test('sameComposition compares chemistry independently of object key order', () => {
  assert.equal(sameComposition({ H: 2, O: 1 }, { O: 1, H: 2 }), true);
  assert.equal(sameComposition({ H: 2, O: 1 }, { H: 1, O: 1 }), false);
});

test('rejects malformed or unsupported formulas instead of guessing', () => {
  for (const formula of ['', '2', 'H0O', 'Mg(OH', 'Na+Cl-', 'Ca(OH)2)']) {
    assert.throws(() => parseFormula(formula), /formula/i, formula);
  }
});
