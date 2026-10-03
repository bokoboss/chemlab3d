import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(MODULE_DIR, '..');
export const BASELINE_ARCHIVE_DIR = join(PROJECT_ROOT, 'baseline', 'archive');
export const BASELINE_FILENAME = 'ChemLab_3D_Interactive_App.html';

const PART_PREFIX = `${BASELINE_FILENAME}.gz.b64.part-`;
const EXPECTED_PART_COUNT = 14;

export async function restoreAcceptedBaseline() {
  const names = (await readdir(BASELINE_ARCHIVE_DIR))
    .filter((name) => name.startsWith(PART_PREFIX))
    .sort();

  if (names.length !== EXPECTED_PART_COUNT) {
    throw new Error(`Expected ${EXPECTED_PART_COUNT} baseline archive parts, found ${names.length}`);
  }

  const expectedNames = Array.from(
    { length: EXPECTED_PART_COUNT },
    (_, index) => `${PART_PREFIX}${String(index).padStart(2, '0')}`,
  );

  for (let index = 0; index < expectedNames.length; index += 1) {
    if (names[index] !== expectedNames[index]) {
      throw new Error(`Baseline archive sequence mismatch at part ${index}: ${names[index] ?? 'missing'}`);
    }
  }

  const chunks = await Promise.all(
    names.map(async (name) => (await readFile(join(BASELINE_ARCHIVE_DIR, name), 'utf8')).replace(/\s+/g, '')),
  );

  const gzipBytes = Buffer.from(chunks.join(''), 'base64');
  return gunzipSync(gzipBytes);
}

export async function writeAcceptedBaseline(outputPath = join(PROJECT_ROOT, 'baseline', 'restored', BASELINE_FILENAME)) {
  const bytes = await restoreAcceptedBaseline();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);
  return outputPath;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const requestedPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : undefined;
  const outputPath = await writeAcceptedBaseline(requestedPath);
  console.log(outputPath);
}
