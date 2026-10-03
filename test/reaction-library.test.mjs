import test from 'node:test';
import assert from 'node:assert/strict';
import { REACTION_LIBRARY } from '../src/data/reactions.mjs';
import { REACTION_SOURCES } from '../src/data/reaction-sources.mjs';
import { reactionBalance, formatReactionEquation } from '../src/chemistry/reactions.mjs';

const EXPECTED_EQUATIONS = new Map([
  ['water-formation', '2H₂(g) + O₂(g) → 2H₂O(l)'],
  ['methane-combustion', 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)'],
  ['hydrochloric-acid-sodium-hydroxide', 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)'],
  ['zinc-hydrochloric-acid', 'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)'],
  ['silver-nitrate-sodium-chloride', 'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)'],
  ['calcium-carbonate-decomposition', 'CaCO₃(s) → CaO(s) + CO₂(g)'],
  ['ammonia-formation', 'N₂(g) + 3H₂(g) → 2NH₃(g)'],
  ['aluminium-oxide-formation', '4Al(s) + 3O₂(g) → 2Al₂O₃(s)'],
]);

test('starter reaction library contains representative secondary-school equations', () => {
  assert.equal(REACTION_LIBRARY.length, EXPECTED_EQUATIONS.size);

  const ids = new Set(REACTION_LIBRARY.map((reaction) => reaction.id));
  assert.equal(ids.size, REACTION_LIBRARY.length, 'reaction ids must be unique');

  for (const id of EXPECTED_EQUATIONS.keys()) {
    assert.ok(ids.has(id), `missing reaction ${id}`);
  }
});

test('every starter reaction is balanced and formats as its accepted sourced equation', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.equal(reactionBalance(reaction).balanced, true, reaction.id);
    assert.equal(formatReactionEquation(reaction), EXPECTED_EQUATIONS.get(reaction.id), reaction.id);
  }
});

test('every reaction identity and every physical-state claim resolves to the source registry', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.ok(reaction.sources.length > 0, `${reaction.id}: missing reaction source`);
    for (const sourceId of reaction.sources) {
      assert.ok(REACTION_SOURCES[sourceId], `${reaction.id}: unknown source ${sourceId}`);
      assert.match(REACTION_SOURCES[sourceId].url, /^https:\/\//, `${sourceId}: source URL must be HTTPS`);
    }

    for (const species of [...reaction.reactants, ...reaction.products]) {
      assert.ok(species.state, `${reaction.id}/${species.formula}: starter state should be sourced`);
      assert.ok(REACTION_SOURCES[species.stateSource], `${reaction.id}/${species.formula}: unknown state source`);
    }
  }
});

test('optional reaction claims are either unknown or explicitly sourced', () => {
  for (const reaction of REACTION_LIBRARY) {
    for (const condition of reaction.conditions) {
      assert.ok(REACTION_SOURCES[condition.source], `${reaction.id}: unknown condition source`);
    }
    if (reaction.catalyst) {
      assert.ok(REACTION_SOURCES[reaction.catalyst.source], `${reaction.id}: unknown catalyst source`);
    }

    assert.equal(reaction.facts.temperatureC, null, `${reaction.id}: temperature remains unknown until sourced`);
    assert.equal(reaction.facts.enthalpyKJMol, null, `${reaction.id}: enthalpy remains unknown until sourced`);
  }
});

test('calcium carbonate decomposition is the only starter reaction with a sourced condition so far', () => {
  const withConditions = REACTION_LIBRARY.filter((reaction) => reaction.conditions.length > 0);
  assert.deepEqual(withConditions.map((reaction) => reaction.id), ['calcium-carbonate-decomposition']);
  assert.match(withConditions[0].conditions[0].text, /thermal decomposition/i);
});

test('starter reactions carry learning metadata without pretending to be final curriculum certification', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.ok(reaction.curriculum.levels.length > 0, `${reaction.id}: missing learning level`);
    assert.ok(reaction.curriculum.topics.length > 0, `${reaction.id}: missing learning topic`);
  }
});
