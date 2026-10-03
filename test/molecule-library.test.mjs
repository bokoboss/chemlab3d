import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreAcceptedBaseline } from '../scripts/baseline.mjs';
import { parseFormula, sameComposition } from '../src/chemistry/composition.mjs';

function acceptedMolecules(html) {
  const marker = 'const MOLECULES_DATA = ';
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, 'MOLECULES_DATA marker missing from accepted baseline');
  const jsonStart = start + marker.length;
  const end = html.indexOf(';\n', jsonStart);
  assert.notEqual(end, -1, 'MOLECULES_DATA terminator missing from accepted baseline');
  return JSON.parse(html.slice(jsonStart, end));
}

function renderAtomComposition(molecule) {
  return molecule.atoms.reduce((composition, atom) => {
    composition[atom.elem] = (composition[atom.elem] ?? 0) + 1;
    return composition;
  }, {});
}

test('all 86 accepted molecule formulas have parseable chemical compositions', async () => {
  const html = (await restoreAcceptedBaseline()).toString('utf8');
  const molecules = acceptedMolecules(html);

  assert.equal(molecules.length, 86);
  for (const molecule of molecules) {
    assert.doesNotThrow(() => parseFormula(molecule.formula), `${molecule.id}: ${molecule.formula}`);
  }
});

test('render geometry is explicitly not treated as composition truth', async () => {
  const html = (await restoreAcceptedBaseline()).toString('utf8');
  const molecules = acceptedMolecules(html);

  const examples = {
    nacl: { Na: 1, Cl: 1 },
    glucose: { C: 6, H: 12, O: 6 },
    aspirin: { C: 9, H: 8, O: 4 },
    naphthalene: { C: 10, H: 8 },
  };

  for (const [id, expected] of Object.entries(examples)) {
    const molecule = molecules.find((entry) => entry.id === id);
    assert.ok(molecule, `missing accepted molecule: ${id}`);
    const formulaComposition = parseFormula(molecule.formula);
    assert.deepEqual(formulaComposition, expected);
    assert.equal(
      sameComposition(formulaComposition, renderAtomComposition(molecule)),
      false,
      `${id} must demonstrate why render atoms cannot be chemistry truth`,
    );
  }
});
