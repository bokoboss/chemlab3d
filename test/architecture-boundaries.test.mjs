import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function mjsFilesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await mjsFilesUnder(path));
    else if (entry.isFile() && entry.name.endsWith('.mjs')) files.push(path);
  }
  return files;
}

test('deprecated phase-coded and Lab compatibility build entrypoints stay retired', async () => {
  const retired = [
    'scripts/build-app-phase2.mjs',
    'scripts/reaction-lab-build.mjs',
    'scripts/reaction-source-ui-build.mjs',
    'scripts/compound-builder-semantics-build.mjs',
  ];
  for (const path of retired) {
    assert.equal(await exists(join(ROOT, path)), false, `${path} must remain retired`);
  }
});

test('feature build boundaries do not depend back on scripts', async () => {
  const featureBuildDirs = [
    join(ROOT, 'src', 'features', 'lab', 'build'),
    join(ROOT, 'src', 'features', 'mobile-ux', 'build'),
    join(ROOT, 'src', 'features', 'accessibility', 'build'),
  ];
  for (const directory of featureBuildDirs) {
    for (const path of await mjsFilesUnder(directory)) {
      const source = await readFile(path, 'utf8');
      assert.doesNotMatch(source, /from\s+['"][^'"]*scripts\//, `${relative(ROOT, path)} must not import scripts/`);
    }
  }
});

test('chemistry domain stays independent from feature and script layers', async () => {
  const chemistryDir = join(ROOT, 'src', 'chemistry');
  for (const path of await mjsFilesUnder(chemistryDir)) {
    const source = await readFile(path, 'utf8');
    assert.doesNotMatch(source, /from\s+['"][^'"]*(features|scripts)\//, `${relative(ROOT, path)} must remain domain-only`);
  }
});

test('stable app entrypoint consumes feature boundaries rather than implementation files', async () => {
  const source = await readFile(join(ROOT, 'scripts', 'build-app.mjs'), 'utf8');
  assert.match(source, /src\/features\/lab\/build\/index\.mjs/);
  assert.match(source, /src\/features\/mobile-ux\/build\/index\.mjs/);
  assert.match(source, /src\/features\/accessibility\/build\/index\.mjs/);
  assert.doesNotMatch(source, /reaction-lab-build|reaction-source-ui-build|compound-builder-semantics-build/);
});
