const AUFBAU_ORDER = Object.freeze([
  ['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6],
  ['4s', 2], ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10],
  ['5p', 6], ['6s', 2], ['4f', 14], ['5d', 10], ['6p', 6],
  ['7s', 2], ['5f', 14], ['6d', 10], ['7p', 6],
]);

// Occupancy corrections to the simple Madelung/Aufbau fill for neutral atoms.
// Values follow the ground-state configurations in NIST SP 966 (June 2024).
// Only subshells whose occupancy differs from the simple fill need to be listed.
const GROUND_STATE_OVERRIDES = Object.freeze({
  24: { '4s': 1, '3d': 5 },                    // Cr
  29: { '4s': 1, '3d': 10 },                   // Cu
  41: { '5s': 1, '4d': 4 },                    // Nb
  42: { '5s': 1, '4d': 5 },                    // Mo
  44: { '5s': 1, '4d': 7 },                    // Ru
  45: { '5s': 1, '4d': 8 },                    // Rh
  46: { '5s': 0, '4d': 10 },                   // Pd
  47: { '5s': 1, '4d': 10 },                   // Ag
  57: { '4f': 0, '5d': 1, '6s': 2 },          // La
  58: { '4f': 1, '5d': 1, '6s': 2 },          // Ce
  64: { '4f': 7, '5d': 1, '6s': 2 },          // Gd
  78: { '6s': 1, '5d': 9 },                    // Pt
  79: { '6s': 1, '5d': 10 },                   // Au
  89: { '5f': 0, '6d': 1, '7s': 2 },          // Ac
  90: { '5f': 0, '6d': 2, '7s': 2 },          // Th
  91: { '5f': 2, '6d': 1, '7s': 2 },          // Pa
  92: { '5f': 3, '6d': 1, '7s': 2 },          // U
  93: { '5f': 4, '6d': 1, '7s': 2 },          // Np
  96: { '5f': 7, '6d': 1, '7s': 2 },          // Cm
  103: { '6d': 0, '7p': 1, '7s': 2, '5f': 14 }, // Lr
  110: { '7s': 1, '6d': 9 },                   // Ds
  111: { '7s': 1, '6d': 10 },                  // Rg
});

function assertAtomicNumber(z) {
  if (!Number.isInteger(z) || z < 1 || z > 118) {
    throw new RangeError('Atomic number must be an integer from 1 through 118.');
  }
}

function parseSubshell(label) {
  const match = /^(\d)([spdf])$/.exec(label);
  if (!match) throw new Error(`Invalid subshell label: ${label}`);
  return { n: Number(match[1]), orbital: match[2] };
}

function simpleAufbauOccupancy(z) {
  let remaining = z;
  const occupancy = new Map();

  for (const [label, capacity] of AUFBAU_ORDER) {
    if (remaining <= 0) break;
    const electrons = Math.min(remaining, capacity);
    occupancy.set(label, electrons);
    remaining -= electrons;
  }

  return occupancy;
}

export function getGroundStateSubshells(z) {
  assertAtomicNumber(z);
  const occupancy = simpleAufbauOccupancy(z);
  const override = GROUND_STATE_OVERRIDES[z];

  if (override) {
    for (const [label, electrons] of Object.entries(override)) {
      if (electrons === 0) occupancy.delete(label);
      else occupancy.set(label, electrons);
    }
  }

  const result = [];
  for (const [label] of AUFBAU_ORDER) {
    const electrons = occupancy.get(label) ?? 0;
    if (electrons <= 0) continue;
    const { n, orbital } = parseSubshell(label);
    result.push({ n, orbital, electrons });
  }
  return result;
}

export function countElectrons(subshells) {
  return subshells.reduce((sum, subshell) => sum + subshell.electrons, 0);
}

export function getBohrShellPopulation(z) {
  const shells = new Map();
  for (const { n, electrons } of getGroundStateSubshells(z)) {
    shells.set(n, (shells.get(n) ?? 0) + electrons);
  }

  const highestShell = Math.max(...shells.keys());
  return Array.from({ length: highestShell }, (_, index) => shells.get(index + 1) ?? 0);
}

export function formatElectronConfiguration(z) {
  return getGroundStateSubshells(z)
    .map(({ n, orbital, electrons }) => `${n}${orbital}${electrons}`)
    .join(' ');
}
