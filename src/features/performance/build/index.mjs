import { applyRuntimeLifecycle as applyPrimaryRuntimeLifecycle } from './runtime-lifecycle.mjs';
import { applySecondaryRuntimeLifecycle } from './secondary-lifecycle.mjs';
import { applyResourceLifecycle } from './resource-lifecycle.mjs';

export function applyRuntimeLifecycle(html) {
  return applyResourceLifecycle(applySecondaryRuntimeLifecycle(applyPrimaryRuntimeLifecycle(html)));
}

export { applySecondaryRuntimeLifecycle, applyResourceLifecycle };

export const PERFORMANCE_BUILD_TRANSFORMS = Object.freeze([applyRuntimeLifecycle]);
