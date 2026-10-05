# Phase 5 Acceptance — Performance + Offline

## Status

Accepted when the final Phase 5 implementation commit passes both required CI gates:

- Chemistry / build regression
- Preserve 3D / effects / UX (desktop + mobile)

## Scope completed

### Runtime lifecycle

Continuous rendering/animation work is gated by the learner's current context rather than being allowed to run indefinitely in hidden modules.

Tracked loops now pause when their owning experience is not active and resume when the learner returns:

- Atom Studio canvas animation
- main Three.js molecule viewer
- beaker particle effects
- historical atomic-model 3D view
- Collision Theory simulator
- Galvanic Cell simulator
- element-modal animation while hidden
- isomer 3D animation while closed/hidden

Static learning surfaces such as the periodic table and curriculum guide are covered by an operational budget test requiring zero tracked continuous loops.

### Lazy resource initialization

- the main molecule-viewer WebGL renderer is created on the first Viewer visit, not on application startup;
- the historical-atom WebGL renderer is created on the first History visit, not while the Atom Studio subtab is active;
- the isomer animation can close and reopen without remaining frozen.

### Offline / classroom resilience

The packaged `dist` application:

- self-hosts Three.js r128, OrbitControls r128 and canvas-confetti 1.6.0 from pinned npm dependencies;
- retains third-party license files beside the vendored runtime assets;
- includes a web-app manifest, SVG app icon and service worker;
- pre-caches the app shell and critical runtime scripts;
- is browser-tested to reload while the browser context is offline after the first successful online visit.

Google Fonts remain a progressive enhancement: the existing CSS fallback stack remains available if the font request cannot be satisfied offline.

## Preservation contract

Phase 5 does **not** achieve performance by globally disabling animation, effects, WebGL quality or advanced learning tools. The accepted 3D/effects/UX preservation suite remains the release gate.

## What the performance budget means

The automated budget is deliberately operational rather than a fragile CI wall-clock benchmark:

- static tabs: 0 tracked continuous animation loops;
- active rich modules: only the loop(s) required by the currently visible experience may run;
- hidden WebGL renderers are not eagerly initialized.

Device-specific frame-rate and energy profiling can be added later against representative school hardware without weakening these deterministic lifecycle guarantees.

## Remaining external dependencies

Non-critical remote resources such as Google Fonts may still be requested when online. They are not required for core chemistry interactions or 3D runtime availability after the app has been cached.

## Completion

Phase 6 — Educational QA was completed for the v1 release boundary after this phase. Its acceptance decision and documented limitations are recorded in [`PHASE_6_ACCEPTANCE.md`](PHASE_6_ACCEPTANCE.md), and the overall project is closed in [`PROJECT_CLOSEOUT.md`](PROJECT_CLOSEOUT.md).
