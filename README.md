# ChemLab 3D

Interactive chemistry learning web app for secondary-school learners (ม.1–ม.6).

## Product goal

Build a chemistry learning experience that is:

- **interactive and visually engaging** — 3D, animation, effects, simulations, quests and mini-games remain first-class learning tools;
- **academically trustworthy** — chemistry facts and calculations must be evidence-based, validated, or clearly labelled as simplified models;
- **progressively maintainable** — scientific domain logic is separated from rendering/UI so correctness can improve without sacrificing the accepted experience.

The project follows a six-phase plan documented in [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md).

## Current architecture

The accepted single-file prototype is preserved byte-for-byte as a regression baseline. The production build is generated from that baseline and applies tested chemistry-domain corrections without rewriting the visual experience.

```bash
npm test            # chemistry, build and regression tests
npm run build       # reconstruct accepted prototype + apply hardened chemistry adapters
npm run test:browser # desktop/mobile Playwright preservation suite
```

## Non-regression rule

Refactoring must not remove or materially degrade existing 3D rendering, effects, animation, interaction richness, responsive behavior, UX/UI polish, quests, simulations, or other accepted learning capabilities unless an intentional product decision explicitly replaces them with something better.

## Phase status

- **Phase 1 — P0 Chemistry Core Hardening:** accepted on branch/PR completion; chemistry core, exact baseline restoration, browser preservation gates, and P0 UI integration are in place.
- **Phase 2 — Reaction Architecture:** next — separate Compound Builder from evidence-backed Reaction Lab while preserving the current beaker/effects experience.
- Phase 3 — Codebase Refactor
- Phase 4 — UX + Accessibility
- Phase 5 — Performance + Offline
- Phase 6 — Educational QA
