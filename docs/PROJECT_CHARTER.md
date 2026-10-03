# ChemLab 3D — Product Charter & Six-Phase Development Plan

## Product vision

ChemLab 3D is an interactive chemistry learning web application for secondary-school learners (ม.1–ม.6). The target is not merely a digital textbook or a 3D molecule viewer. It should become a coherent learning environment where students can explore atomic structure, periodic trends, bonding, molecules, reactions and laboratory concepts through direct manipulation, visualisation, simulation, practice and feedback.

The end state must satisfy three requirements simultaneously:

1. **Academically trustworthy** — chemistry facts, formulas, calculations, models and explanations are correct, evidence-based and traceable; simplified teaching models are identified as simplified models.
2. **Interactive and engaging** — the existing 3D, effects, animation, simulations, quests, mini-games and responsive interactions remain first-class learning mechanisms.
3. **Maintainable and extensible** — chemistry domain logic, validated data and presentation code are progressively separated so scientific improvements do not require sacrificing the accepted experience.

## Preservation contract

The accepted prototype is a product asset, not disposable scaffolding. Refactoring is allowed only when the resulting application preserves or intentionally improves the accepted experience.

The following are regression gates throughout the project:

- 3D molecule rendering, rotation, zoom and camera interaction;
- atom/particle animation and orbital visualisation;
- periodic-table interaction and visual modes;
- sandbox/lab stations and their visual feedback;
- particles, bubbles, flame, crystal, confetti, transitions and sound where already present;
- quests, flashcards, mini-games and scoring/progress interactions;
- responsive desktop/mobile behaviour;
- established dark scientific visual identity, typography, glow/glass treatment and motion language;
- existing user workflows unless an explicit product decision replaces them with a demonstrably better workflow.

A refactor that makes the code cleaner but makes the product less capable, less engaging or visually poorer is not accepted.

## Quality gates

Every phase must be evaluated against four gates:

### 1. Academic correctness
Scientific outputs are correct for the intended model, or the simplification/uncertainty is explicitly disclosed.

### 2. Functional regression
Existing critical learning workflows continue to operate.

### 3. Visual / interaction regression
3D, effects, motion, responsive behaviour and UX/UI capability do not materially regress.

### 4. Performance
Changes do not introduce unacceptable CPU/GPU, loading or interaction regressions. Later optimisation phases may improve performance without removing learning value.

---

# Phase 1 — P0 Chemistry Core Hardening

**Status: accepted / implemented**

Purpose: eliminate scientifically dangerous assumptions before expanding the feature set.

Scope:

- separate formula/composition truth from 3D render geometry;
- validated electron-configuration logic for Z=1–118 and ion/species shell populations;
- derive Bohr shell populations from electronic configuration rather than shell-capacity filling;
- distinguish standard atomic weight from explicit nuclide mass number;
- remove fabricated neutron counts from periodic-table displays;
- qualify the legacy n/p stability heuristic as a simplified trend model rather than a binary scientific determination;
- remove unsupported synthesis temperatures and universal exothermic claims;
- require provenance for reaction temperature/enthalpy facts;
- preserve reaction visual effects while replacing unsupported scientific claims;
- preserve the accepted prototype byte-for-byte as a reconstruction baseline;
- add chemistry/build tests and desktop/mobile browser-preservation tests.

Acceptance record: [`PHASE_1_ACCEPTANCE.md`](PHASE_1_ACCEPTANCE.md)

---

# Phase 2 — Reaction Architecture

Purpose: turn the current visually strong sandbox into two scientifically distinct learning tools without losing the existing satisfying interaction.

## Compound Builder

For learning:

- element/ion composition;
- valence and charge balance;
- ionic formula ratios;
- molecular formula construction;
- bonding concepts;
- 3D product exploration.

The current beaker interaction, particles and success feedback should be preserved and refined rather than discarded.

## Reaction Lab

Introduce a separate evidence-backed reaction model built from actual reactants/products rather than treating selected atoms as a chemical equation.

Target capabilities:

- balanced chemical equations;
- physical states where relevant;
- reaction conditions and catalyst data with provenance;
- optional reaction enthalpy only where validated;
- reaction classes appropriate to secondary-school chemistry;
- links from reaction products to the 3D molecule/material views;
- learning explanations that distinguish symbolic equations from particle-level visual models.

Reaction Lab must be data-driven so new reactions can be added without embedding special-case chemistry inside UI code.

---

# Phase 3 — Codebase Refactor

Purpose: progressively extract the legacy single-file application into maintainable modules without a big-bang rewrite.

Target boundaries:

```text
src/
  chemistry/
  data/
  features/
    atom/
    periodic-table/
    molecule-viewer/
    lab/
    practice/
  ui/
  styles/
```

Rules:

- preserve accepted behaviour first;
- characterise/test a seam before extracting it;
- refactor incrementally;
- do not rewrite the entire application into a new framework merely for architectural aesthetics;
- framework adoption, if any, must have a concrete product/engineering benefit and preservation evidence.

---

# Phase 4 — UX + Accessibility

Purpose: improve navigation and inclusivity while preserving the established visual identity.

Focus areas:

- clarify the scope of grade-level filtering or convert it into an application-wide learning profile;
- rationalise top-level information architecture as feature breadth grows;
- improve mobile navigation and mobile periodic-table exploration;
- simplify dense mobile 3D controls using drawers/bottom sheets without reducing capability;
- semantic HTML for interactive controls;
- keyboard navigation and `:focus-visible` states;
- accessible dialog semantics and focus management;
- ARIA labelling where native semantics are insufficient;
- `prefers-reduced-motion` support;
- contrast/text-size review.

---

# Phase 5 — Performance + Offline

Purpose: make the rich experience efficient and classroom-friendly.

Focus areas:

- lazy-initialise expensive modules;
- pause animation/render loops for hidden modules;
- avoid unnecessary simultaneous Canvas/WebGL work;
- retain effects rather than globally disabling them as an optimisation shortcut;
- self-host critical runtime dependencies where appropriate;
- offline/PWA strategy for classroom use;
- performance budgets for representative lower-powered student devices.

---

# Phase 6 — Educational QA

Purpose: make the finished product defensible as a secondary-school chemistry learning resource.

Focus areas:

- full chemistry-content review;
- systematic validation of element, molecule, reaction, thermochemistry and isotope data;
- provenance coverage and source freshness;
- terminology consistency in Thai and English;
- curriculum mapping by level, topic and intended learning outcome;
- distinction between core/basic science and advanced/additional chemistry where relevant;
- concept progression and prerequisite review;
- misconception review;
- assessment/quest validity;
- cross-module consistency;
- final educational release checklist.

## Source policy

Authoritative/primary scientific sources should be preferred where available. Source roles and provenance expectations are documented in [`DATA_SOURCES.md`](DATA_SOURCES.md).

## Definition of the final product

The project succeeds when a secondary-school learner can move coherently through a loop such as:

**Atom → periodic trend → valence/bonding → molecule/compound → reaction → experiment/simulation → practice → mastery feedback**

and the application remains visually compelling while the scientific statements behind that experience are inspectable, testable and trustworthy.
