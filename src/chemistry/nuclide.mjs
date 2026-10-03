function assertAtomicNumber(atomicNumber) {
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    throw new RangeError('Atomic number must be an integer from 1 through 118.');
  }
}

function assertMassNumber(atomicNumber, massNumber) {
  if (!Number.isInteger(massNumber) || massNumber < atomicNumber) {
    throw new RangeError('Mass number must be an integer greater than or equal to the atomic number.');
  }
}

function assertSymbol(symbol) {
  if (typeof symbol !== 'string' || !/^[A-Z][a-z]?$/.test(symbol)) {
    throw new Error('Element symbol must be a valid one- or two-letter symbol.');
  }
}

export function neutronCountForNuclide(atomicNumber, massNumber) {
  assertAtomicNumber(atomicNumber);
  assertMassNumber(atomicNumber, massNumber);
  return massNumber - atomicNumber;
}

export function makeNuclide({ atomicNumber, massNumber, symbol }) {
  assertAtomicNumber(atomicNumber);
  assertMassNumber(atomicNumber, massNumber);
  assertSymbol(symbol);
  return Object.freeze({
    atomicNumber,
    massNumber,
    symbol,
    protonCount: atomicNumber,
    neutronCount: massNumber - atomicNumber,
  });
}

export function makeElementMassReference({ atomicNumber, symbol, standardAtomicWeight }) {
  assertAtomicNumber(atomicNumber);
  assertSymbol(symbol);
  if (standardAtomicWeight !== null && standardAtomicWeight !== undefined) {
    if (typeof standardAtomicWeight !== 'number' || !Number.isFinite(standardAtomicWeight) || standardAtomicWeight <= 0) {
      throw new Error('Standard atomic weight must be a positive finite number or null.');
    }
  }
  return Object.freeze({ atomicNumber, symbol, standardAtomicWeight: standardAtomicWeight ?? null });
}
