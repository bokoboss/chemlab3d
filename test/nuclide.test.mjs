import test from 'node:test';
import assert from 'node:assert/strict';
import { neutronCountForNuclide, makeNuclide, makeElementMassReference } from '../src/chemistry/nuclide.mjs';

test('neutron count is derived only from an explicit nuclide mass number', () => {
  assert.equal(neutronCountForNuclide(6, 12), 6);
  assert.equal(neutronCountForNuclide(6, 14), 8);
  assert.equal(neutronCountForNuclide(92, 238), 146);
});

test('a nuclide keeps mass number distinct from standard atomic weight', () => {
  assert.deepEqual(makeNuclide({ atomicNumber: 17, massNumber: 35, symbol: 'Cl' }), {
    atomicNumber: 17,
    massNumber: 35,
    symbol: 'Cl',
    protonCount: 17,
    neutronCount: 18,
  });
  assert.deepEqual(makeElementMassReference({ atomicNumber: 17, symbol: 'Cl', standardAtomicWeight: 35.45 }), {
    atomicNumber: 17,
    symbol: 'Cl',
    standardAtomicWeight: 35.45,
  });
});

test('standard atomic weight cannot be passed as a nuclide mass number', () => {
  assert.throws(() => neutronCountForNuclide(17, 35.45), /mass number/i);
  assert.throws(() => makeNuclide({ atomicNumber: 17, massNumber: 35.45, symbol: 'Cl' }), /mass number/i);
});

test('rejects physically impossible or malformed nuclides', () => {
  assert.throws(() => neutronCountForNuclide(0, 1), /atomic number/i);
  assert.throws(() => neutronCountForNuclide(6, 5), /mass number/i);
  assert.throws(() => neutronCountForNuclide(6, -12), /mass number/i);
});
