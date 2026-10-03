import { applyReactionLab } from './reaction-lab.mjs';
import { applyReactionSourceUi } from './reaction-source-ui.mjs';
import { applyCompoundBuilderSemantics } from '../../../../scripts/compound-builder-semantics-build.mjs';

/**
 * Transitional Phase 3 feature boundary.
 *
 * The build orchestrator imports the Lab feature as one unit. Implementations
 * migrate behind this boundary one seam at a time; compatibility shims keep
 * existing imports working while browser and byte-equivalence gates protect
 * the learner experience.
 */
export const LAB_BUILD_TRANSFORMS = Object.freeze([
  applyReactionLab,
  applyReactionSourceUi,
  applyCompoundBuilderSemantics,
]);
