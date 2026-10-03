# Phase 1 Acceptance — P0 Chemistry Core Hardening

## Decision

Phase 1 is accepted when the branch CI is green for both the chemistry/build regression job and the browser preservation job.

## What changed

### Chemistry truth separated from rendering
- Molecular formula composition is parsed independently from 3D render atoms/bonds.
- All 86 accepted molecule formulas are parseable.
- Known render/composition mismatches such as NaCl lattice, glucose, aspirin and naphthalene are explicitly regression-tested so render geometry cannot silently become chemistry truth again.

### Electron configuration
- Sequential Bohr shell-capacity filling was replaced by subshell-based ground-state configurations.
- Neutral atom support covers Z = 1–118 with electron-count conservation tests.
- Ion/species shell populations are derived from the electronic configuration rather than naive shell filling.
- Atom Studio consumes the hardened configuration logic without removing its canvas animation or orbital presentation.

### Isotope / neutron semantics
- Standard atomic weight is no longer rounded and presented as a specific nuclide mass number.
- Periodic-table nucleus visuals are labelled schematic where isotope identity is not known.
- Neutron count requires an explicitly selected mass number / neutron count in Atom Studio.

### Nuclear stability
- The legacy n/p heuristic is no longer presented as a factual stable/radioactive determination.
- Where retained for learning, it is explicitly labelled as a simplified trend model.

### Reaction facts
- Synthesis results no longer fabricate fixed temperatures by compound class.
- Universal exothermic claims were removed.
- Temperature and enthalpy values require explicit provenance before being treated as facts.
- Existing confetti, flame, bubbles and crystal effects remain intact.
- The current sandbox is presented as a composition/compound builder rather than pretending selected atoms form a balanced reaction equation.

## Preservation baseline

The accepted prototype is stored as a compressed base64 archive and reconstructed byte-for-byte. SHA-256:

`3fd0d17583d07ccfdded08daed5d753f2adaf232a8da6a0a995bef1afcf6220f`

Regression checks cover baseline reconstruction, generated-script syntax, critical module integration and browser behavior.

## Browser preservation gate

Playwright runs both desktop and mobile projects and verifies the continued presence and operation of:

- Atom Studio canvas;
- all 118 periodic-table elements and element modal;
- Three.js/WebGL 3D molecule viewer;
- Sandbox station navigation and beaker particle canvas;
- Quests;
- curriculum guide;
- absence of uncaught page/console errors during the tested core flow.

Screenshots/reports are retained as CI artifacts for inspection.

## Explicitly deferred to Phase 2+

- balanced, evidence-backed Reaction Lab architecture;
- comprehensive curated reaction database;
- large-scale modularization of the legacy UI;
- accessibility redesign;
- performance/offline work;
- full curriculum and chemistry-content QA.

Those are deferred deliberately, not omitted. The Phase 1 objective is to make the dangerous P0 scientific assumptions safe while preserving the accepted learning experience.
