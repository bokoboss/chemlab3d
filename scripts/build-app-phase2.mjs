import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { PROJECT_ROOT } from './baseline.mjs';
import { buildAppHtml as buildPhase1AppHtml } from './build-app.mjs';
import { applyReactionLab } from './reaction-lab-build.mjs';
import { applyReactionSourceUi } from './reaction-source-ui-build.mjs';
import { applyCompoundBuilderSemantics } from './compound-builder-semantics-build.mjs';

/**
 * Phase 2 deliberately wraps the accepted Phase 1 build rather than editing
 * the already-validated Phase 1 transformation pipeline. This keeps the
 * preservation boundary explicit and makes each Phase 2 concern easy to
 * isolate, test, and roll back.
 */
export async function buildAppHtml() {
  const phase1Html = await buildPhase1AppHtml();
  const reactionLabHtml = applyReactionLab(phase1Html);
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
