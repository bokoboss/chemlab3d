import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { PROJECT_ROOT, restoreAcceptedBaseline } from './baseline.mjs';

const ELECTRON_CORE_PATH = join(PROJECT_ROOT, 'src', 'chemistry', 'electron-config.mjs');

function countOccurrences(source, needle) {
  if (!needle) return 0;
  return source.split(needle).length - 1;
}

function replaceExpected(source, needle, replacement, expectedCount, label) {
  const actualCount = countOccurrences(source, needle);
  if (actualCount !== expectedCount) {
    throw new Error(`${label}: expected ${expectedCount} occurrence(s), found ${actualCount}`);
  }
  return source.split(needle).join(replacement);
}

function replaceSection(source, startMarker, endMarker, replacement, label) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`${label}: start marker not found`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`${label}: end marker not found`);
  if (source.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error(`${label}: start marker is not unique`);
  }
  return `${source.slice(0, start)}${replacement}\n\n${source.slice(end)}`;
}

function toClassicBrowserSource(moduleSource) {
  return moduleSource.replace(/^export\s+/gm, '');
}

export async function buildAppHtml() {
  let html = (await restoreAcceptedBaseline()).toString('utf8');
  const electronCore = toClassicBrowserSource(await readFile(ELECTRON_CORE_PATH, 'utf8'));

  const coreAnchor = '  // GLOBAL BOHR SHELL CALCULATOR (Accessible Everywhere)';
  const injectedCore = [
    '  // CHEMLAB_CHEMISTRY_CORE_BEGIN — generated from tested domain modules',
    electronCore.split('\n').map((line) => `  ${line}`).join('\n'),
    '  // CHEMLAB_CHEMISTRY_CORE_END',
    '',
    coreAnchor,
  ].join('\n');

  html = replaceExpected(html, coreAnchor, injectedCore, 1, 'chemistry-core injection');

  const legacyBohr = `  function calculateBohrShells(num) {\n    const maxCapacity = [2, 8, 18, 32, 50];\n    let remaining = num;\n    const shells = [];\n    for (const max of maxCapacity) {\n      if (remaining <= 0) break;\n      const count = Math.min(remaining, max);\n      shells.push(count);\n      remaining -= count;\n    }\n    return shells;\n  }`;

  const hardenedBohr = `  function calculateBohrShells(electronCount, atomicNumber = electronCount) {\n    if (electronCount === 0) return [];\n    return getSpeciesShellPopulation(atomicNumber, electronCount);\n  }`;

  html = replaceExpected(html, legacyBohr, hardenedBohr, 1, 'Bohr shell adapter');
  html = replaceExpected(
    html,
    'const shells = calculateBohrShells(atomState.e);',
    'const shells = calculateBohrShells(atomState.e, atomState.p);',
    2,
    'Atom Studio shell call sites',
  );
  html = replaceExpected(
    html,
    'renderOrbitalDiagram(atomState.e);',
    'renderOrbitalDiagram(atomState.e, atomState.p);',
    1,
    'Atom Studio orbital call site',
  );

  const orbitalAdapter = `  function getSubshellElectronConfig(electronCount, atomicNumber = electronCount) {\n    const boxCounts = { s: 1, p: 3, d: 5, f: 7 };\n    return getElectronSubshells(atomicNumber, electronCount).map(({ n, orbital, electrons }) => ({\n      name: \`${'${n}${orbital}'}\`,\n      n,\n      type: orbital,\n      count: electrons,\n      boxes: boxCounts[orbital],\n    }));\n  }`;

  html = replaceSection(
    html,
    '  function getSubshellElectronConfig(num) {',
    '  function renderOrbitalDiagram(num) {',
    orbitalAdapter,
    'orbital configuration adapter',
  );

  html = replaceExpected(
    html,
    'function renderOrbitalDiagram(num) {',
    'function renderOrbitalDiagram(electronCount, atomicNumber = electronCount) {',
    1,
    'orbital renderer signature',
  );
  html = replaceExpected(html, 'if (num === 0) {', 'if (electronCount === 0) {', 1, 'zero-electron orbital state');
  html = replaceExpected(
    html,
    'const config = getSubshellElectronConfig(num);',
    'const config = getSubshellElectronConfig(electronCount, atomicNumber);',
    1,
    'orbital renderer chemistry source',
  );
  html = replaceExpected(html, 'if (num >= 18) noble =', 'if (electronCount >= 18) noble =', 1, 'argon core label');
  html = replaceExpected(html, 'else if (num >= 10) noble =', 'else if (electronCount >= 10) noble =', 1, 'neon core label');
  html = replaceExpected(html, 'else if (num >= 2) noble =', 'else if (electronCount >= 2) noble =', 1, 'helium core label');

  return html;
}

export async function writeBuiltApp(outputPath = join(PROJECT_ROOT, 'dist', 'index.html')) {
  const html = await buildAppHtml();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
  return outputPath;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const requestedPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : undefined;
  const outputPath = await writeBuiltApp(requestedPath);
  console.log(outputPath);
}
