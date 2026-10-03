import { applyReactionLab } from './reaction-lab.mjs';
import { applyReactionSourceUi } from './reaction-source-ui.mjs';
import { applyCompoundBuilderSemantics } from './compound-builder-semantics.mjs';

/**
 * Phase 3 Lab build boundary.
 *
 * The current app imports the Lab feature as one unit. All three Lab build
 * adapters now live behind this feature boundary; compatibility shims keep
 * historical script imports working during the remainder of Phase 3.
 */
export const LAB_BUILD_TRANSFORMS = Object.freeze([
  applyReactionLab,
  applyReactionSourceUi,
  applyCompoundBuilderSemantics,
]);
