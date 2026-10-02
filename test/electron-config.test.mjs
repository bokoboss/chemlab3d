import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getGroundStateSubshells,
  getBohrShellPopulation,
  countElectrons,
} from '../src/chemistry/electron-config.mjs';

const shellCases = [
  [1, [1]],
  [2, [2]],
  [6, [2, 4]],
  [10, [2, 8]],
  [11, [2, 8, 1]],
  [18, [2, 8, 8]],
  [19, [2, 8, 8, 1]],
  [20, [2, 8, 8, 2]],
  [24, [2, 8, 13, 1]],
  [26, [2, 8, 14, 2]],
  [29, [2, 8, 18, 1]],
  [36, [2, 8, 18, 8]],
  [54, [2, 8, 18, 18, 8]],
  [79, [2, 8, 18, 32, 18, 1]],
  [92, [2, 8, 18, 32, 21, 9, 2]],
  [103, [2, 8, 18, 32, 32, 8, 3]],
  [110, [2, 8, 18, 32, 32, 17, 1]],
  [118, [2, 8, 18, 32, 32, 18, 8]],
];

for (const [z, expected] of shellCases) {
  test(`Z=${z} has correct principal-shell population`, () => {
    assert.deepEqual(getBohrShellPopulation(z), expected);
  });
}

test('every neutral element Z=1..118 conserves electron count', () => {
  for (let z = 1; z <= 118; z += 1) {
    assert.equal(countElectrons(getGroundStateSubshells(z)), z, `Z=${z}`);
  }
});

test('known anomalous ground-state configurations are represented explicitly', () => {
  const asMap = (z) => Object.fromEntries(
    getGroundStateSubshells(z).map(({ n, orbital, electrons }) => [`${n}${orbital}`, electrons])
  );

  assert.deepEqual(asMap(24), {
    '1s': 2, '2s': 2, '2p': 6, '3s': 2, '3p': 6, '4s': 1, '3d': 5,
  });
  assert.equal(asMap(46)['5s'] ?? 0, 0);
  assert.equal(asMap(46)['4d'], 10);
  assert.equal(asMap(78)['6s'], 1);
  assert.equal(asMap(78)['5d'], 9);
  assert.equal(asMap(103)['7p'], 1);
  assert.equal(asMap(103)['6d'] ?? 0, 0);
  assert.equal(asMap(110)['7s'], 1);
  assert.equal(asMap(110)['6d'], 9);
});

test('rejects atomic numbers outside the supported neutral-element range', () => {
  assert.throws(() => getGroundStateSubshells(0), /atomic number/i);
  assert.throws(() => getGroundStateSubshells(119), /atomic number/i);
  assert.throws(() => getGroundStateSubshells(1.5), /atomic number/i);
});
