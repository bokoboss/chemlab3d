import { applyRuntimeLifecycle as applyPrimaryRuntimeLifecycle } from './runtime-lifecycle.mjs';
import { applySecondaryRuntimeLifecycle } from './secondary-lifecycle.mjs';

export function applyRuntimeLifecycle(html) {
  return applySecondaryRuntimeLifecycle(applyPrimaryRuntimeLifecycle(html));
}

export { applySecondaryRuntimeLifecycle };

export const PERFORMANCE_BUILD_TRANSFORMS = Object.freeze([applyRuntimeLifecycle]);
