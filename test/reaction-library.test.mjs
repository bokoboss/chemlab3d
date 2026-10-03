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

function assertSourceSupports(sourceId, support, context) {
  const source = REACTION_SOURCES[sourceId];
  assert.ok(source, `${context}: unknown source ${sourceId}`);
  assert.ok(source.supports.includes(support), `${context}: ${sourceId} must support ${support}`);
}

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

test('source registry entries are learner-linkable and declare supported claim types', () => {
  for (const [sourceId, source] of Object.entries(REACTION_SOURCES)) {
    assert.match(source.url, /^https:\/\//, `${sourceId}: source URL must be HTTPS`);
    assert.equal(typeof source.title, 'string', `${sourceId}: title is required`);
    assert.ok(source.title.trim().length > 0, `${sourceId}: title is required`);
    assert.equal(typeof source.publisher, 'string', `${sourceId}: publisher is required`);
    assert.ok(source.publisher.trim().length > 0, `${sourceId}: publisher is required`);
    assert.ok(Array.isArray(source.supports) && source.supports.length > 0, `${sourceId}: supports is required`);
  }
});

test('every reaction identity and physical-state claim has a source that explicitly supports that claim', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.ok(reaction.sources.length > 0, `${reaction.id}: missing reaction source`);
    for (const sourceId of reaction.sources) {
      assertSourceSupports(sourceId, 'reaction', `${reaction.id}/reaction`);
    }

    for (const species of [...reaction.reactants, ...reaction.products]) {
      assert.ok(species.state, `${reaction.id}/${species.formula}: starter state should be sourced`);
      assertSourceSupports(species.stateSource, 'states', `${reaction.id}/${species.formula}/state`);
    }
  }
});

test('optional reaction claims are either unknown or backed by a source that declares the matching support type', () => {
  for (const reaction of REACTION_LIBRARY) {
    for (const condition of reaction.conditions) {
      assertSourceSupports(condition.source, 'conditions', `${reaction.id}/condition`);
    }
    if (reaction.catalyst) {
      assertSourceSupports(reaction.catalyst.source, 'catalyst', `${reaction.id}/catalyst`);
    }
    if (reaction.facts.temperatureSource) {
      assertSourceSupports(reaction.facts.temperatureSource, 'temperature', `${reaction.id}/temperature`);
    }
    if (reaction.facts.thermochemistrySource) {
      assertSourceSupports(reaction.facts.thermochemistrySource, 'thermochemistry', `${reaction.id}/thermochemistry`);
    }

    assert.equal(reaction.facts.temperatureC, null, `${reaction.id}: temperature remains unknown until sourced`);
    assert.equal(reaction.facts.enthalpyKJMol, null, `${reaction.id}: enthalpy remains unknown until sourced`);
  }
});

test('calcium carbonate decomposition is the only starter reaction with a sourced condition so far', () => {
  const withConditions = REACTION_LIBRARY.filter((reaction) => reaction.conditions.length > 0);
  assert.deepEqual(withConditions.map((reaction) => reaction.id), ['calcium-carbonate-decomposition']);
  assert.match(withConditions[0].conditions[0].text, /thermal decomposition/i);
  assertSourceSupports(withConditions[0].conditions[0].source, 'conditions', 'calcium-carbonate-decomposition/condition');
});

test('starter reactions carry learning metadata without pretending to be final curriculum certification', () => {
  for (const reaction of REACTION_LIBRARY) {
    assert.ok(reaction.curriculum.levels.length > 0, `${reaction.id}: missing learning level`);
    assert.ok(reaction.curriculum.topics.length > 0, `${reaction.id}: missing learning topic`);
  }
});
