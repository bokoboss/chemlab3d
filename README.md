# ChemLab 3D

Interactive chemistry learning web app for secondary-school learners (ม.1–ม.6).

## Product goal

Build a chemistry learning experience that is:

- **interactive and visually engaging** — 3D, animation, effects, simulations, quests and mini-games remain first-class learning tools;
- **academically trustworthy** — chemistry facts and calculations must be evidence-based, validated, or clearly labelled as simplified / illustrative models;
- **progressively maintainable** — scientific domain logic is separated from rendering/UI so correctness can improve without sacrificing the accepted experience.

The project follows the six-phase plan in [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md).

## Release status

**Project closeout: accepted for the v1 playable educational release.**

All six planned phases are complete for this release boundary. The app does **not** claim formal curriculum certification or exhaustive item-level scientific provenance. Where validation is incomplete, the release uses explicit scope labels, preserves unknown values as unknown, and avoids presenting illustrative 3D output as measured chemical ground truth.

See:

- [`docs/PHASE_6_ACCEPTANCE.md`](docs/PHASE_6_ACCEPTANCE.md) — educational QA acceptance and release boundary;
- [`docs/PROJECT_CLOSEOUT.md`](docs/PROJECT_CLOSEOUT.md) — final status, maintenance policy and known limitations;
- [`docs/EDUCATIONAL_QA_BASELINE.md`](docs/EDUCATIONAL_QA_BASELINE.md) — QA inventory, findings and evidence baseline.

## Current architecture

The accepted single-file prototype is preserved byte-for-byte as a regression baseline. The current app is generated from that baseline through tested feature boundaries for hardened chemistry, Reaction Lab / Compound Builder semantics, mobile UX, viewer UX, performance/offline packaging, accessibility and educational QA.

This preserves the original interaction-rich experience while allowing scientific and product corrections to be layered on without flattening the established 3D/effects/UX design.

```bash
npm test             # chemistry, build, architecture and regression tests
npm run build        # reconstruct accepted prototype + apply validated feature transforms and PWA packaging
npm run test:browser # desktop/mobile preservation, lifecycle, educational UI and offline interaction suite
```

## Non-regression rule

Maintenance must not remove or materially degrade existing 3D rendering, effects, animation, interaction richness, responsive behavior, UX/UI polish, quests, simulations or other accepted learning capabilities unless an intentional product decision explicitly replaces them with something demonstrably better.

## Phase status

- **Phase 1 — P0 Chemistry Core Hardening:** accepted.
- **Phase 2 — Reaction Architecture:** accepted.
- **Phase 3 — Codebase Refactor:** accepted.
- **Phase 4 — UX + Accessibility:** accepted.
- **Phase 5 — Performance + Offline:** accepted.
- **Phase 6 — Educational QA:** accepted for the v1 release boundary, with documented limitations and no claim of formal curriculum certification.

Acceptance records:

- [`docs/PHASE_1_ACCEPTANCE.md`](docs/PHASE_1_ACCEPTANCE.md)
- [`docs/PHASE_4_ACCEPTANCE.md`](docs/PHASE_4_ACCEPTANCE.md)
- [`docs/PHASE_5_ACCEPTANCE.md`](docs/PHASE_5_ACCEPTANCE.md)
- [`docs/PHASE_6_ACCEPTANCE.md`](docs/PHASE_6_ACCEPTANCE.md)

## Deployment

The GitHub Pages workflow is intentionally manual at project closeout. GitHub Pages must first be enabled once at repository level with **Settings → Pages → Build and deployment → Source: GitHub Actions**. After that, run **Deploy GitHub Pages** from the Actions tab.

This repository-level switch cannot be performed by the workflow's default `GITHUB_TOKEN`, so it is kept outside the release quality gate. The application build and test gates remain independent of hosting configuration.

## Maintenance state

The project is considered **closed / maintenance-only** after the closeout merge. Reopen development only for a reproducible defect, security/dependency issue, material scientific correction, browser-platform breakage, or an explicitly approved new product phase.
