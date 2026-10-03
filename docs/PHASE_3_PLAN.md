# Phase 3 — Codebase Refactor

Phase 3 converts the accepted legacy application and its phase-coded build chain into stable engineering boundaries without changing the learner experience.

## Preservation rule

Architecture work is accepted only when it preserves the established 3D, effects, animation, interaction, responsive UX/UI and learning surfaces. No big-bang rewrite or framework migration is used.

## Delivered slices

### 1. Stable current-app build boundary
- `scripts/build-app.mjs` is the stable build entrypoint used by npm, CI and browser tests.
- the previously validated chemistry/core legacy adapter is quarantined behind `scripts/build-app-core.mjs`.
- historical `build-app-phase2.mjs` naming is retired.
- byte-equivalence testing protects the accepted transform order.

### 2. Validated transform pipeline
- current application transforms run through a small ordered pipeline;
- invalid transforms and non-string outputs fail fast;
- current output remains byte-equivalent to the accepted composition of transforms.

### 3. Lab feature ownership boundary
All Lab build adapters now live under:

`src/features/lab/build/`

- `reaction-lab.mjs`
- `reaction-source-ui.mjs`
- `compound-builder-semantics.mjs`
- `index.mjs`

The application orchestrator consumes the Lab feature as one unit rather than knowing its internal transforms. Transitional compatibility shims were removed after parity tests moved to the feature paths.

### 4. Architecture invariants
Automated tests prevent structural backsliding:
- deprecated phase-coded / compatibility entrypoints must stay absent;
- Lab feature code must not depend back on `scripts/`;
- `src/chemistry` must remain independent from feature/UI and script layers;
- the stable app build must consume the Lab feature boundary.

## Intentional boundary

`scripts/build-app-core.mjs` remains a quarantined legacy adapter because it spans Atom Studio, Periodic Table and several accepted UI patches. Splitting that file further in the same phase would enlarge the regression surface without improving the learner experience. Future extraction can proceed from characterised seams under the same preservation gates when there is a product or maintenance reason to do so.

## Phase 3 exit criteria

- default build path no longer depends on historical phase naming: **met**
- current Lab feature has explicit ownership boundaries: **met**
- scientific domain logic remains separate from UI/build ownership: **met**
- duplicated historical Lab entrypoints are removed: **met**
- chemistry/build regression and desktop/mobile preservation stay green: **required for merge**
- accepted learner behaviour remains unchanged for architecture-only slices: **protected by byte-equivalence and browser gates**

Phase 4 can therefore focus on UX and accessibility improvements rather than continuing architecture work for its own sake.
