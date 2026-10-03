# Phase 3 — Codebase Refactor

Phase 3 progressively turns the accepted legacy application and its phase-coded build chain into stable engineering boundaries without changing the learner experience.

## Preservation rule

Architecture work is accepted only when it preserves the established 3D, effects, animation, interaction, responsive UX/UI and learning surfaces. No big-bang rewrite or framework migration is planned.

## Slice 1 — Stable build boundary

The first slice removes phase numbers from the default application build path:

- `scripts/build-app-core.mjs` retains the already-validated Phase 1 chemistry/core adapter;
- `scripts/build-app.mjs` becomes the stable current application orchestrator;
- the historical `scripts/build-app-phase2.mjs` entrypoint is removed;
- `npm run build`, syntax checks, integration tests and browser tests all exercise the current application through the stable entrypoint;
- a byte-equivalence test proves that the new orchestrator applies the accepted Phase 2 transforms in exactly the same order and produces exactly the same HTML.

This slice deliberately does **not** move the large transform implementations yet. Moving implementation files and changing their relative imports at the same time would enlarge the regression surface unnecessarily.

## Next slices

1. Extract shared build-transform utilities used by the legacy/core and lab adapters.
2. Move feature-specific adapters toward `src/features/atom`, `src/features/periodic-table`, `src/features/lab`, `src/features/molecule-viewer`, and `src/features/practice` one seam at a time.
3. Keep chemistry domain modules under `src/chemistry` and validated records under `src/data` independent from visual/rendering concerns.
4. Continue to require chemistry/build regression plus desktop/mobile browser-preservation gates for every accepted slice.

## Exit criteria for Phase 3

- the default build path no longer depends on historical phase naming;
- major feature areas have explicit ownership boundaries;
- duplicated transform plumbing is reduced;
- scientific domain logic does not move back into UI code;
- existing accepted behaviour remains available and regression protected.
