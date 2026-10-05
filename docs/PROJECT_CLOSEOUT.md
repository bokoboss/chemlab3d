# ChemLab 3D — Project Closeout

## Closeout status

ChemLab 3D is accepted as a **v1 playable educational release** and moves to **maintenance-only** status after this closeout is merged to `main`.

The six-phase development plan is complete for the agreed release boundary:

1. P0 Chemistry Core Hardening — accepted.
2. Reaction Architecture — accepted.
3. Codebase Refactor — accepted.
4. UX + Accessibility — accepted.
5. Performance + Offline — accepted.
6. Educational QA — accepted for the v1 release boundary with documented limitations.

## What is frozen

The accepted product identity includes:

- the established 3D visual experience;
- particle/effect treatment and animation richness;
- responsive desktop/mobile UX;
- interactive atom, periodic-table, compound/reaction and 3D learning surfaces;
- quests, checks and educational interactions;
- offline/PWA packaging;
- accessibility improvements and reduced-motion behavior;
- the current feature-boundary architecture and regression protection.

These should be treated as the release baseline, not as disposable prototype behavior.

## Verification state at closeout

The latest tested `main` revision before closeout passed both repository quality gates:

- **Chemistry / build regression** — passed;
- **Preserve 3D / effects / UX (desktop + mobile)** — passed.

The production build is generated through `npm run build`, and browser preservation is covered by `npm run test:browser`.

## Known limitations accepted at release

- The app is not formally certified against the Thai national curriculum.
- Grade labels are learning-path recommendations unless explicitly mapped to an official outcome.
- Not every historical scientific data field has an item-level primary-source citation.
- Some 3D structures are simplified or partial educational representations rather than research-grade molecular coordinates.
- Quantitative dipole claims that lacked adequate sourcing were removed; the remaining 3D dipole visualization is qualitative.
- Unknown electronegativity values remain unknown instead of being imputed.
- The app is not a laboratory safety/procedure system or analytical chemistry tool.

These limitations are release constraints, not hidden defects. A future higher-assurance academic edition would be a new project phase.

## Deployment state

The application build is release-ready. GitHub Pages deployment requires one repository-level configuration step that cannot be performed by the default workflow token:

1. Open repository **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Run the **Deploy GitHub Pages** workflow manually from the Actions tab.

The deploy workflow is intentionally manual at closeout so a repository setting does not keep `main` red. Hosting configuration is not treated as a chemistry/build regression failure.

## Maintenance policy

Do not reopen feature development by default. Reopen only for one of the following:

- reproducible functional defect;
- material scientific error or misleading educational claim;
- security or dependency issue;
- browser/runtime compatibility break;
- accessibility regression;
- explicitly approved new product phase.

For any behavioral change, add a failing regression test first, implement the smallest correction, and run the full chemistry/build and browser preservation gates before acceptance.

## Project completion rule

The project is considered closed when:

- this closeout documentation is merged;
- open phase issues are closed with the accepted release boundary recorded;
- `main` quality gates are green;
- no open pull request remains for the six-phase plan.

Public hosting is optional operational follow-through and does not change the release acceptance decision.
