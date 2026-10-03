import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeReaction,
  reactionBalance,
  formatReactionEquation,
} from '../src/chemistry/reactions.mjs';

function waterFormation(overrides = {}) {
  return {
    id: 'water-formation',
    reactants: [
      { formula: 'H2', coefficient: 2 },
      { formula: 'O2', coefficient: 1 },
    ],
    products: [
      { formula: 'H2O', coefficient: 2 },
    ],
    ...overrides,
  };
}

test('accepts a balanced reaction and conserves every element', () => {
  const reaction = makeReaction(waterFormation());
  const balance = reactionBalance(reaction);

  assert.equal(balance.balanced, true);
  assert.deepEqual(balance.reactants, { H: 4, O: 2 });
  assert.deepEqual(balance.products, { H: 4, O: 2 });
});

test('rejects an unbalanced reaction', () => {
  assert.throws(
    () => makeReaction(waterFormation({
      reactants: [
        { formula: 'H2', coefficient: 1 },
        { formula: 'O2', coefficient: 1 },
      ],
    })),
    /not balanced/i,
  );
});

test('coefficients must be positive integers', () => {
  for (const coefficient of [0, -1, 1.5, Number.NaN]) {
    assert.throws(
      () => makeReaction(waterFormation({
        reactants: [
          { formula: 'H2', coefficient },
          { formula: 'O2', coefficient: 1 },
        ],
      })),
      /coefficient/i,
    );
  }
});

test('formats a balanced equation without showing coefficient 1', () => {
  const reaction = makeReaction(waterFormation());
  assert.equal(formatReactionEquation(reaction), '2H₂ + O₂ → 2H₂O');
});

test('formats optional physical states but does not require them', () => {
  const reaction = makeReaction(waterFormation({
    reactants: [
      { formula: 'H2', coefficient: 2, state: 'g' },
      { formula: 'O2', coefficient: 1, state: 'g' },
    ],
    products: [
      { formula: 'H2O', coefficient: 2, state: 'l' },
    ],
  }));

  assert.equal(formatReactionEquation(reaction), '2H₂(g) + O₂(g) → 2H₂O(l)');
});

test('rejects unsupported physical-state labels', () => {
  assert.throws(
    () => makeReaction(waterFormation({
      reactants: [
        { formula: 'H2', coefficient: 2, state: 'gas' },
        { formula: 'O2', coefficient: 1 },
      ],
    })),
    /state/i,
  );
});

test('condition and catalyst claims require provenance', () => {
  assert.throws(
    () => makeReaction(waterFormation({
      conditions: [{ text: 'ให้ความร้อน' }],
    })),
    /source/i,
  );

  assert.throws(
    () => makeReaction(waterFormation({
      catalyst: { label: 'ตัวเร่งปฏิกิริยา' },
    })),
    /source/i,
  );
});

test('keeps sourced optional claims and curriculum metadata', () => {
  const reaction = makeReaction(waterFormation({
    conditions: [{ text: 'ตัวอย่างเงื่อนไขที่มีหลักฐาน', source: 'SOURCE-ID' }],
    catalyst: { label: 'ตัวอย่างตัวเร่ง', source: 'SOURCE-ID' },
    curriculum: { levels: ['ม.ต้น'], topics: ['สมการเคมี'] },
  }));

  assert.equal(reaction.conditions[0].source, 'SOURCE-ID');
  assert.equal(reaction.catalyst.source, 'SOURCE-ID');
  assert.deepEqual(reaction.curriculum.levels, ['ม.ต้น']);
});
