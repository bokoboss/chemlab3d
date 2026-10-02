import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReactionFacts, describeThermochemistry } from '../src/chemistry/reaction-facts.mjs';

test('missing thermochemistry remains unknown instead of becoming a fabricated value', () => {
  const facts = makeReactionFacts({});
  assert.deepEqual(facts, {
    temperatureC: null,
    enthalpyKJMol: null,
    thermochemistrySource: null,
  });
  assert.equal(describeThermochemistry(facts).status, 'unknown');
});

test('validated enthalpy can be classified without inventing temperature', () => {
  const facts = makeReactionFacts({ enthalpyKJMol: -285.83, thermochemistrySource: 'reference:test' });
  assert.equal(facts.temperatureC, null);
  assert.deepEqual(describeThermochemistry(facts), {
    status: 'known',
    type: 'exothermic',
    enthalpyKJMol: -285.83,
    source: 'reference:test',
  });
});

test('positive enthalpy is endothermic and zero is thermoneutral', () => {
  assert.equal(describeThermochemistry(makeReactionFacts({ enthalpyKJMol: 50, thermochemistrySource: 'x' })).type, 'endothermic');
  assert.equal(describeThermochemistry(makeReactionFacts({ enthalpyKJMol: 0, thermochemistrySource: 'x' })).type, 'thermoneutral');
});

test('enthalpy data requires provenance', () => {
  assert.throws(() => makeReactionFacts({ enthalpyKJMol: -50 }), /source/i);
});

test('rejects non-finite factual values', () => {
  assert.throws(() => makeReactionFacts({ temperatureC: Number.NaN }), /temperature/i);
  assert.throws(() => makeReactionFacts({ enthalpyKJMol: Infinity, thermochemistrySource: 'x' }), /enthalpy/i);
});
