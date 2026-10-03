import { parseFormula, sameComposition } from './composition.mjs';
import { makeReactionFacts } from './reaction-facts.mjs';

const VALID_STATES = new Set(['s', 'l', 'g', 'aq']);
const ASCII_TO_SUBSCRIPT = Object.freeze({
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
});

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }
  return value.trim();
}

function normalizeSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new TypeError('Reaction identity/equation requires at least one source.');
  }
  return Object.freeze(sources.map((source, index) => requireNonEmptyString(source, `reaction.sources[${index}]`)));
}

function normalizeCoefficient(value) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError('Reaction coefficient must be a positive integer.');
  }
  return value;
}

function normalizeState(value) {
  if (value === null || value === undefined || value === '') return null;
  if (!VALID_STATES.has(value)) {
    throw new TypeError(`Reaction state must be one of: ${[...VALID_STATES].join(', ')}.`);
  }
  return value;
}

function normalizeSpecies(entry, side, index) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new TypeError(`${side}[${index}] must be a reaction species object.`);
  }

  const formula = requireNonEmptyString(entry.formula, `${side}[${index}].formula`);
  // Parsing here guarantees every accepted species uses the same formula grammar
  // as the Phase 1 chemistry-composition core.
  parseFormula(formula);

  const state = normalizeState(entry.state);
  const hasStateSource = entry.stateSource !== null && entry.stateSource !== undefined;
  if (state !== null && !hasStateSource) {
    throw new TypeError(`${side}[${index}].stateSource is required when a physical state is provided.`);
  }
  if (state === null && hasStateSource) {
    throw new TypeError(`${side}[${index}].stateSource must not be supplied without a physical state.`);
  }
  const stateSource = state === null
    ? null
    : requireNonEmptyString(entry.stateSource, `${side}[${index}].stateSource`);

  return Object.freeze({
    formula,
    coefficient: normalizeCoefficient(entry.coefficient),
    state,
    stateSource,
  });
}

function normalizeSide(entries, side) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError(`Reaction ${side} must contain at least one species.`);
  }
  return Object.freeze(entries.map((entry, index) => normalizeSpecies(entry, side, index)));
}

function normalizeSourcedClaim(claim, fieldName) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
    throw new TypeError(`${fieldName} must be an object with text/label and source.`);
  }
  const textField = fieldName === 'catalyst' ? 'label' : 'text';
  return Object.freeze({
    [textField]: requireNonEmptyString(claim[textField], `${fieldName}.${textField}`),
    source: requireNonEmptyString(claim.source, `${fieldName}.source`),
  });
}

function normalizeConditions(conditions) {
  if (conditions === null || conditions === undefined) return Object.freeze([]);
  if (!Array.isArray(conditions)) {
    throw new TypeError('Reaction conditions must be an array.');
  }
  return Object.freeze(conditions.map((claim, index) => normalizeSourcedClaim(claim, `conditions[${index}]`)));
}

function normalizeCurriculum(curriculum) {
  if (curriculum === null || curriculum === undefined) {
    return Object.freeze({ levels: Object.freeze([]), topics: Object.freeze([]) });
  }
  if (typeof curriculum !== 'object' || Array.isArray(curriculum)) {
    throw new TypeError('curriculum must be an object.');
  }

  const normalizeList = (value, fieldName) => {
    if (value === null || value === undefined) return Object.freeze([]);
    if (!Array.isArray(value)) throw new TypeError(`curriculum.${fieldName} must be an array.`);
    return Object.freeze(value.map((item, index) => requireNonEmptyString(item, `curriculum.${fieldName}[${index}]`)));
  };

  return Object.freeze({
    levels: normalizeList(curriculum.levels, 'levels'),
    topics: normalizeList(curriculum.topics, 'topics'),
  });
}

function addComposition(target, composition, coefficient) {
  for (const [symbol, count] of Object.entries(composition)) {
    target[symbol] = (target[symbol] ?? 0) + count * coefficient;
  }
}

function aggregateSide(entries) {
  const total = {};
  for (const entry of entries) {
    addComposition(total, parseFormula(entry.formula), entry.coefficient);
  }
  return total;
}

export function reactionBalance(reaction) {
  if (!reaction || !Array.isArray(reaction.reactants) || !Array.isArray(reaction.products)) {
    throw new TypeError('reactionBalance requires reaction reactants and products.');
  }

  const reactants = aggregateSide(reaction.reactants);
  const products = aggregateSide(reaction.products);
  return Object.freeze({
    balanced: sameComposition(reactants, products),
    reactants: Object.freeze(reactants),
    products: Object.freeze(products),
  });
}

export function makeReaction({
  id,
  sources,
  reactants,
  products,
  conditions = null,
  catalyst = null,
  facts = null,
  curriculum = null,
} = {}) {
  const normalized = {
    id: requireNonEmptyString(id, 'reaction.id'),
    sources: normalizeSources(sources),
    reactants: normalizeSide(reactants, 'reactants'),
    products: normalizeSide(products, 'products'),
    conditions: normalizeConditions(conditions),
    catalyst: catalyst === null || catalyst === undefined ? null : normalizeSourcedClaim(catalyst, 'catalyst'),
    facts: makeReactionFacts(facts ?? {}),
    curriculum: normalizeCurriculum(curriculum),
  };

  const balance = reactionBalance(normalized);
  if (!balance.balanced) {
    throw new Error(`Reaction '${normalized.id}' is not balanced.`);
  }

  return Object.freeze(normalized);
}

function displayFormula(formula) {
  return formula.replace(/\d/g, (digit) => ASCII_TO_SUBSCRIPT[digit]);
}

function formatSpecies(species) {
  const coefficient = species.coefficient === 1 ? '' : String(species.coefficient);
  const state = species.state ? `(${species.state})` : '';
  return `${coefficient}${displayFormula(species.formula)}${state}`;
}

export function formatReactionEquation(reaction) {
  const left = reaction.reactants.map(formatSpecies).join(' + ');
  const right = reaction.products.map(formatSpecies).join(' + ');
  return `${left} → ${right}`;
}
