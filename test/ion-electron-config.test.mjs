import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getElectronSubshells,
  getSpeciesShellPopulation,
  countElectrons,
} from '../src/chemistry/electron-config.mjs';

function asMap(atomicNumber, electronCount) {
  return Object.fromEntries(
    getElectronSubshells(atomicNumber, electronCount)
      .map(({ n, orbital, electrons }) => [`${n}${orbital}`, electrons]),
  );
}

test('common main-group ions reach the expected noble-gas configurations', () => {
  assert.deepEqual(getSpeciesShellPopulation(11, 10), [2, 8]); // Na+
  assert.deepEqual(getSpeciesShellPopulation(12, 10), [2, 8]); // Mg2+
  assert.deepEqual(getSpeciesShellPopulation(8, 10), [2, 8]);  // O2-
  assert.deepEqual(getSpeciesShellPopulation(17, 18), [2, 8, 8]); // Cl-
});

test('transition-metal cations remove outer ns electrons before (n-1)d electrons', () => {
  const fe2 = asMap(26, 24);
  assert.equal(fe2['4s'] ?? 0, 0);
  assert.equal(fe2['3d'], 6);

  const fe3 = asMap(26, 23);
  assert.equal(fe3['4s'] ?? 0, 0);
  assert.equal(fe3['3d'], 5);

  const cu1 = asMap(29, 28);
  assert.equal(cu1['4s'] ?? 0, 0);
  assert.equal(cu1['3d'], 10);

  const cu2 = asMap(29, 27);
  assert.equal(cu2['4s'] ?? 0, 0);
  assert.equal(cu2['3d'], 9);
});

test('neutral species stay identical to validated neutral ground states', () => {
  assert.deepEqual(getSpeciesShellPopulation(19, 19), [2, 8, 8, 1]);
  assert.deepEqual(getSpeciesShellPopulation(29, 29), [2, 8, 18, 1]);
});

test('zero-electron species are represented without inventing occupied shells', () => {
  assert.deepEqual(getElectronSubshells(6, 0), []);
  assert.deepEqual(getSpeciesShellPopulation(6, 0), []);
});

test('species configuration conserves the requested electron count', () => {
  const cases = [
    [1, 0], [1, 1], [8, 10], [11, 10], [17, 18],
    [24, 21], [26, 23], [26, 24], [29, 27], [29, 28],
    [57, 54], [79, 78], [92, 89], [103, 100], [118, 118],
  ];

  for (const [z, electrons] of cases) {
    assert.equal(countElectrons(getElectronSubshells(z, electrons)), electrons, `Z=${z}, e=${electrons}`);
  }
});

test('species API validates atomic number and electron-count bounds', () => {
  assert.throws(() => getElectronSubshells(0, 0), /atomic number/i);
  assert.throws(() => getElectronSubshells(119, 1), /atomic number/i);
  assert.throws(() => getElectronSubshells(6, -1), /electron count/i);
  assert.throws(() => getElectronSubshells(6, 119), /electron count/i);
  assert.throws(() => getElectronSubshells(6, 1.5), /electron count/i);
});
