function optionalFiniteNumber(value, label) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number or null.`);
  }
  return value;
}

export function makeReactionFacts({
  temperatureC = null,
  enthalpyKJMol = null,
  thermochemistrySource = null,
} = {}) {
  const temperature = optionalFiniteNumber(temperatureC, 'Temperature');
  const enthalpy = optionalFiniteNumber(enthalpyKJMol, 'Enthalpy');

  if (enthalpy !== null && (typeof thermochemistrySource !== 'string' || thermochemistrySource.trim() === '')) {
    throw new Error('Thermochemistry source is required when enthalpy data is provided.');
  }

  return Object.freeze({
    temperatureC: temperature,
    enthalpyKJMol: enthalpy,
    thermochemistrySource: enthalpy === null ? null : thermochemistrySource.trim(),
  });
}

export function describeThermochemistry(facts) {
  if (!facts || facts.enthalpyKJMol === null || facts.enthalpyKJMol === undefined) {
    return Object.freeze({ status: 'unknown' });
  }

  const enthalpy = facts.enthalpyKJMol;
  const type = enthalpy < 0 ? 'exothermic' : enthalpy > 0 ? 'endothermic' : 'thermoneutral';
  return Object.freeze({
    status: 'known',
    type,
    enthalpyKJMol: enthalpy,
    source: facts.thermochemistrySource,
  });
}
