function optionalFiniteNumber(value, fieldName) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${fieldName} must be a finite number or null.`);
  }
  return value;
}

function optionalSource(value, fieldName) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${fieldName} must be a non-empty source string or null.`);
  }
  return value.trim();
}

export function makeReactionFacts({
  temperatureC = null,
  temperatureSource = null,
  enthalpyKJMol = null,
  thermochemistrySource = null,
} = {}) {
  const normalizedTemperature = optionalFiniteNumber(temperatureC, 'temperatureC');
  const normalizedTemperatureSource = optionalSource(temperatureSource, 'temperatureSource');
  const normalizedEnthalpy = optionalFiniteNumber(enthalpyKJMol, 'enthalpyKJMol');
  const normalizedThermochemistrySource = optionalSource(thermochemistrySource, 'thermochemistrySource');

  if (normalizedTemperature !== null && normalizedTemperatureSource === null) {
    throw new TypeError('Temperature data requires a temperature source.');
  }
  if (normalizedTemperature === null && normalizedTemperatureSource !== null) {
    throw new TypeError('temperatureSource must not be supplied without temperatureC.');
  }
  if (normalizedEnthalpy !== null && normalizedThermochemistrySource === null) {
    throw new TypeError('Enthalpy data requires a thermochemistry source.');
  }
  if (normalizedEnthalpy === null && normalizedThermochemistrySource !== null) {
    throw new TypeError('thermochemistrySource must not be supplied without enthalpyKJMol.');
  }

  return Object.freeze({
    temperatureC: normalizedTemperature,
    temperatureSource: normalizedTemperatureSource,
    enthalpyKJMol: normalizedEnthalpy,
    thermochemistrySource: normalizedThermochemistrySource,
  });
}

export function describeThermochemistry(facts) {
  const normalized = makeReactionFacts(facts);
  if (normalized.enthalpyKJMol === null) {
    return Object.freeze({ status: 'unknown' });
  }

  let type = 'thermoneutral';
  if (normalized.enthalpyKJMol < 0) type = 'exothermic';
  if (normalized.enthalpyKJMol > 0) type = 'endothermic';

  return Object.freeze({
    status: 'known',
    type,
    enthalpyKJMol: normalized.enthalpyKJMol,
    source: normalized.thermochemistrySource,
  });
}
