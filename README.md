# ChemLab 3D

Interactive chemistry learning web app for secondary-school learners (ม.1–ม.6).

## Product goal

Build a chemistry learning experience that is:

- **interactive and visually engaging** — 3D, animation, effects, simulations, quests and mini-games remain first-class learning tools;
- **academically trustworthy** — chemistry facts and calculations must be evidence-based, validated, or clearly labelled as simplified models;
- **progressively maintainable** — scientific domain logic is separated from rendering/UI so correctness can improve without sacrificing the accepted experience.

The project follows a six-phase plan documented in [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md).

## Current architecture

The accepted single-file prototype is preserved byte-for-byte as a regression baseline. The current app is generated from that baseline through tested feature boundaries for hardened chemistry, Reaction Lab/Compound Builder semantics, mobile UX, viewer UX, performance/offline packaging and accessibility. This preserves the original interaction-rich experience while allowing the scientific and product layers to improve incrementally.

```bash
npm test             # chemistry, build, architecture and regression tests
npm run build        # reconstruct accepted prototype + apply validated feature transforms and PWA packaging
npm run test:browser # desktop/mobile preservation, lifecycle and offline interaction suite
```

## Non-regression rule

Refactoring must not remove or materially degrade existing 3D rendering, effects, animation, interaction richness, responsive behavior, UX/UI polish, quests, simulations, or other accepted learning capabilities unless an intentional product decision explicitly replaces them with something better.

## Phase status

- **Phase 1 — P0 Chemistry Core Hardening:** accepted.
- **Phase 2 — Reaction Architecture:** accepted.
- **Phase 3 — Codebase Refactor:** accepted; stable build/feature boundaries and architecture guardrails are in place.
- **Phase 4 — UX + Accessibility:** accepted; keyboard/dialog/reduced-motion support, scoped grade filtering, mobile learning navigation, periodic-table navigation and mobile 3D ergonomics are regression-protected.
- **Phase 5 — Performance + Offline:** accepted; hidden continuous loops are lifecycle-gated, major WebGL resources initialize on demand, critical 3D/effects runtime assets are self-hosted and first-visit offline reload is browser-tested.
- **Phase 6 — Educational QA:** next — full content validation, provenance, terminology, curriculum mapping and final educational release criteria.

Acceptance records:

- [`docs/PHASE_1_ACCEPTANCE.md`](docs/PHASE_1_ACCEPTANCE.md)
- [`docs/PHASE_4_ACCEPTANCE.md`](docs/PHASE_4_ACCEPTANCE.md)
- [`docs/PHASE_5_ACCEPTANCE.md`](docs/PHASE_5_ACCEPTANCE.md)
