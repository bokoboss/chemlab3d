import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(MODULE_DIR, '..');
export const BASELINE_ARCHIVE_DIR = join(PROJECT_ROOT, 'baseline', 'archive');
export const BASELINE_FILENAME = 'ChemLab_3D_Interactive_App.html';

const PART_PREFIX = `${BASELINE_FILENAME}.gz.b64.part-`;
const BASELINE_PARTS = Object.freeze([
  `${PART_PREFIX}00`, `${PART_PREFIX}01`, `${PART_PREFIX}02`, `${PART_PREFIX}03`,
  `${PART_PREFIX}04a`, `${PART_PREFIX}04b`, `${PART_PREFIX}04c`, `${PART_PREFIX}04d`,
  `${PART_PREFIX}05`, `${PART_PREFIX}06`, `${PART_PREFIX}07`, `${PART_PREFIX}08`,
  `${PART_PREFIX}09`, `${PART_PREFIX}10`, `${PART_PREFIX}11`,
  `${PART_PREFIX}12a`, `${PART_PREFIX}12b`, `${PART_PREFIX}12c`, `${PART_PREFIX}12d`,
  `${PART_PREFIX}13a`, `${PART_PREFIX}13b`, `${PART_PREFIX}13c`,
]);

export async function restoreAcceptedBaseline() {
  const chunks = await Promise.all(
    BASELINE_PARTS.map(async (name) => (await readFile(join(BASELINE_ARCHIVE_DIR, name), 'utf8')).replace(/\s+/g, '')),
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
