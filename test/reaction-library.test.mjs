import test from 'node:test';
import assert from 'node:assert/strict';
import { REACTION_LIBRARY } from '../src/data/reactions.mjs';
import { reactionBalance, formatReactionEquation } from '../src/chemistry/reactions.mjs';

const EXPECTED_EQUATIONS = new Map([
  ['water-formation', '2H₂ + O₂ → 2H₂O'],
  ['methane-combustion', 'CH₄ + 2O₂ → CO₂ + 2H₂O'],
  ['hydrochloric-acid-sodium-hydroxide', 'HCl + NaOH → NaCl + H₂O'],
  ['zinc-hydrochloric-acid', 'Zn + 2HCl → ZnCl₂ + H₂'],
  ['silver-nitrate-sodium-chloride', 'AgNO₃ + NaCl → AgCl + NaNO₃'],
  ['calcium-carbonate-decomposition', 'CaCO₃ → CaO + CO₂'],
  ['ammonia-formation', 'N₂ + 3H₂ → 2NH₃'],
  ['aluminium-oxide-formation', '4Al + 3O₂ → 2Al₂O₃'],
]);

test('starter reaction library contains representative secondary-school equations', () => {
  assert.equal(REACTION_LIBRARY.length, EXPECTED_EQUATIONS.size);

  const ids = new Set(REACTION_LIBRARY.map((reaction) => reaction.id));
  assert.equal(ids.size, REACTION_LIBRARY.length, 'reaction ids must be unique');

  for (const id of EXPECTED_EQUATIONS.keys()) {
    assert.ok(ids.has(id), `missing reaction ${id}`);
  }
});

test('every starter reaction is balanced and formats as its accepted stoichiometric equation', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.equal(reactionBalance(reaction).balanced, true, reaction.id);
    assert.equal(formatReactionEquation(reaction), EXPECTED_EQUATIONS.get(reaction.id), reaction.id);
  }
});

test('starter library does not invent unsourced reaction-specific conditions or thermochemistry', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.deepEqual(reaction.conditions, [], `${reaction.id}: conditions must remain unknown until sourced`);
    assert.equal(reaction.catalyst, null, `${reaction.id}: catalyst must remain unknown until sourced`);
    assert.equal(reaction.facts.temperatureC, null, `${reaction.id}: temperature must remain unknown until sourced`);
    assert.equal(reaction.facts.enthalpyKJMol, null, `${reaction.id}: enthalpy must remain unknown until sourced`);
  }
});

test('starter reactions carry learning metadata without pretending to be final curriculum certification', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.ok(reaction.curriculum.levels.length > 0, `${reaction.id}: missing learning level`);
    assert.ok(reaction.curriculum.topics.length > 0, `${reaction.id}: missing learning topic`);
  }
});
