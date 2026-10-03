import { applyReactionLab } from '../../../../scripts/reaction-lab-build.mjs';
import { applyReactionSourceUi } from '../../../../scripts/reaction-source-ui-build.mjs';
import { applyCompoundBuilderSemantics } from '../../../../scripts/compound-builder-semantics-build.mjs';

/**
 * Transitional Phase 3 feature boundary.
 *
 * The build orchestrator imports the Lab feature as one unit. The underlying
 * adapters remain at their legacy script paths for now so this slice changes
 * ownership/dependency shape without also changing implementation code.
 * Later Phase 3 slices can move those adapters behind this boundary while the
 * orchestrator and preservation tests stay unchanged.
 */
export const LAB_BUILD_TRANSFORMS = Object.freeze([
  applyReactionLab,
  applyReactionSourceUi,
  applyCompoundBuilderSemantics,
]);
