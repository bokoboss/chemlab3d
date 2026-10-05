import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { PROJECT_ROOT } from './baseline.mjs';
import { buildAppHtml as buildCoreAppHtml } from './build-app-core.mjs';
import { applyBuildTransforms } from './build-transform-pipeline.mjs';
import { LAB_BUILD_TRANSFORMS } from '../src/features/lab/build/index.mjs';
import { MOBILE_UX_BUILD_TRANSFORMS } from '../src/features/mobile-ux/build/index.mjs';
import { VIEWER_UX_BUILD_TRANSFORMS } from '../src/features/viewer-ux/build/index.mjs';
import { PERFORMANCE_BUILD_TRANSFORMS } from '../src/features/performance/build/index.mjs';
import { applyEducationalQa } from '../src/features/education-qa/build/index.mjs';
import { applyOfflineShell, writeOfflineAssets } from '../src/features/offline/build/index.mjs';
import { ACCESSIBILITY_BUILD_TRANSFORMS } from '../src/features/accessibility/build/index.mjs';

export const CURRENT_APP_TRANSFORMS = Object.freeze([
  ...LAB_BUILD_TRANSFORMS,
  ...MOBILE_UX_BUILD_TRANSFORMS,
  ...VIEWER_UX_BUILD_TRANSFORMS,
  ...PERFORMANCE_BUILD_TRANSFORMS,
  ...ACCESSIBILITY_BUILD_TRANSFORMS,
]);

/**
 * Stable current-app build entrypoint.
 *
 * Feature-specific implementation details stay behind feature boundaries so npm,
 * browser tests, deployment and future refactors do not need to know which
 * historical phase introduced a transform. Transform order is explicit and
 * regression tested.
 */
export async function buildAppHtml() {
  const coreHtml = await buildCoreAppHtml();
  return applyBuildTransforms(coreHtml, CURRENT_APP_TRANSFORMS);
}

export async function writeBuiltApp(outputPath = join(PROJECT_ROOT, 'dist', 'index.html')) {
  const reviewedHtml = applyEducationalQa(await buildAppHtml());
  const html = applyOfflineShell(reviewedHtml);
  const outputDir = dirname(outputPath);
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, html, 'utf8');
  await writeOfflineAssets(outputDir);
  return outputPath;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const requestedPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : undefined;
  const outputPath = await writeBuiltApp(requestedPath);
  console.log(outputPath);
}
