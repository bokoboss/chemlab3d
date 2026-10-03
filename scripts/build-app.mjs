import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { PROJECT_ROOT } from './baseline.mjs';
import { buildAppHtml as buildCoreAppHtml } from './build-app-core.mjs';
import { applyReactionLab } from './reaction-lab-build.mjs';
import { applyReactionSourceUi } from './reaction-source-ui-build.mjs';
import { applyCompoundBuilderSemantics } from './compound-builder-semantics-build.mjs';

/**
 * Stable current-app build entrypoint.
 *
 * Phase-specific implementation details stay behind this boundary so npm,
 * browser tests, deployment and future refactors do not need to know which
 * historical phase introduced a transform. The ordered transforms are kept
 * explicit because their output is preservation-tested byte-for-byte.
 */
export async function buildAppHtml() {
  const coreHtml = await buildCoreAppHtml();
  const reactionLabHtml = applyReactionLab(coreHtml);
  const sourcedReactionLabHtml = applyReactionSourceUi(reactionLabHtml);
  return applyCompoundBuilderSemantics(sourcedReactionLabHtml);
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
