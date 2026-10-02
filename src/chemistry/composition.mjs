const SUBSCRIPT_TO_ASCII = Object.freeze({
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
});

function normalizeFormula(formula) {
  if (typeof formula !== 'string' || formula.trim() === '') {
    throw new Error('Formula must be a non-empty string.');
  }
  return formula.trim().replace(/[₀-₉]/g, (digit) => SUBSCRIPT_TO_ASCII[digit]);
}

function addCount(target, symbol, count) {
  target[symbol] = (target[symbol] ?? 0) + count;
}

function mergeScaled(target, source, multiplier) {
  for (const [symbol, count] of Object.entries(source)) {
    addCount(target, symbol, count * multiplier);
  }
}

function readPositiveInteger(text, state, defaultValue = 1) {
  const start = state.index;
  while (state.index < text.length && /\d/.test(text[state.index])) state.index += 1;
  if (state.index === start) return defaultValue;
  const value = Number(text.slice(start, state.index));
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error('Formula multipliers must be positive integers.');
  }
  return value;
}

function parseGroup(text, state, expectedCloser = null) {
  const composition = {};

  while (state.index < text.length) {
    const char = text[state.index];

    if (expectedCloser && char === expectedCloser) {
      state.index += 1;
      return composition;
    }

    if (char === '(' || char === '[') {
      state.index += 1;
      const closer = char === '(' ? ')' : ']';
      const nested = parseGroup(text, state, closer);
      const multiplier = readPositiveInteger(text, state);
      mergeScaled(composition, nested, multiplier);
      continue;
    }

    if (char === ')' || char === ']') {
      throw new Error(`Formula contains an unexpected '${char}'.`);
    }

    if (/[A-Z]/.test(char)) {
      let symbol = char;
      state.index += 1;
      if (state.index < text.length && /[a-z]/.test(text[state.index])) {
        symbol += text[state.index];
        state.index += 1;
      }
      const multiplier = readPositiveInteger(text, state);
      addCount(composition, symbol, multiplier);
      continue;
    }

    throw new Error(`Formula contains an unsupported token '${char}'.`);
  }

  if (expectedCloser) {
    throw new Error(`Formula is missing closing '${expectedCloser}'.`);
  }
  return composition;
}

function parseSegment(segment) {
  if (!segment) throw new Error('Formula contains an empty hydrate segment.');
  const state = { index: 0 };
  const coefficient = readPositiveInteger(segment, state);
  if (state.index >= segment.length) {
    throw new Error('Formula segment cannot contain only a coefficient.');
  }
  const body = segment.slice(state.index);
  const bodyState = { index: 0 };
  const composition = parseGroup(body, bodyState);
  if (bodyState.index !== body.length) {
    throw new Error('Formula could not be parsed completely.');
  }
  const scaled = {};
  mergeScaled(scaled, composition, coefficient);
  return scaled;
}

export function parseFormula(formula) {
  const normalized = normalizeFormula(formula);
  const segments = normalized.split(/[·.]/);
  const composition = {};

  for (const segment of segments) {
    mergeScaled(composition, parseSegment(segment), 1);
  }

  if (Object.keys(composition).length === 0) {
    throw new Error('Formula must contain at least one element.');
  }
  return composition;
}

export function sameComposition(left, right) {
  const leftEntries = Object.entries(left).filter(([, count]) => count !== 0).sort(([a], [b]) => a.localeCompare(b));
  const rightEntries = Object.entries(right).filter(([, count]) => count !== 0).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(leftEntries) === JSON.stringify(rightEntries);
}
