# ChemLab 3D — Project Charter

## Product vision

Build an interactive, engaging, academically trustworthy chemistry learning web app for secondary-school students. The product should help learners explore, experiment, connect concepts, and practise chemistry through rich visual and interactive experiences rather than static textbook pages.

## Non-negotiable preservation contract

The accepted prototype already has unusually strong visual and interaction qualities. Development must improve scientific correctness and engineering quality **without losing those strengths**.

The following are regression gates, not optional decoration:

- 3D molecule viewing and manipulation
- visual effects and particle feedback
- animations and motion cues
- sound and satisfying feedback where already present
- Atom Studio visual interaction
- interactive periodic table modes
- Sandbox stations and their visual identity
- Quest, flashcard and mini-game experiences
- responsive/mobile behaviour
- dark scientific visual identity, glow/glass treatment and typography hierarchy
- feature breadth and discoverability

A refactor is not accepted merely because the code becomes cleaner. It must preserve or improve the user-facing learning experience.

## Development method

Use preserve-first, incremental refactoring with explicit regression protection:

1. Characterize current behaviour.
2. Add tests/baselines before changing logic.
3. Extract or replace one seam at a time.
4. Verify scientific correctness.
5. Verify functional behaviour.
6. Verify visual/interaction preservation.
7. Verify performance has not materially regressed.

Avoid a big-bang rewrite or framework migration that attempts to recreate the experience from memory.

## Quality gates

Every phase must pass all four gates:

1. **Academic correctness** — chemistry output is correct, sourced, or explicitly labelled as a simplified model.
2. **Functional regression** — existing learning workflows still operate.
3. **Visual/interaction regression** — 3D, effects, animation, responsive layout and UI capability are preserved.
4. **Performance** — changes do not introduce material CPU/GPU/startup regressions.

## Six-phase roadmap

### Phase 1 — P0 Chemistry Core Hardening

Correct the foundational chemistry model before expanding features.

Priority work:

- separate chemical composition from 3D rendering geometry
- ground-state electron configurations for Z=1–118
- derive Bohr/principal-shell populations from validated configurations
- distinguish standard atomic weight from isotope mass number
- remove or qualify coarse nuclear-stability heuristics
- remove unsupported/fabricated temperature and enthalpy claims
- add automated chemistry validation

This phase should change the scientific layer first and minimise presentation changes.

### Phase 2 — Reaction Architecture

Separate two learning models that are currently conflated:

- **Compound Builder** — construct formulas / ratios / ions / bonding
- **Reaction Lab** — choose real reactants and use validated balanced reactions, conditions, states, products and supported thermochemical facts

Preserve the current beaker, effects, animation and satisfying interactions while replacing the scientific model underneath.

### Phase 3 — Codebase Refactor

Incrementally extract the large single-file prototype into maintainable domains after behaviour is protected by tests.

Target conceptual structure:

- `data/`
- `chemistry/`
- `features/atom/`
- `features/periodic-table/`
- `features/molecule-viewer/`
- `features/lab/`
- `features/practice/`
- `ui/`
- `styles/`

No big-bang rewrite.

### Phase 4 — UX + Accessibility

Improve information architecture and accessibility without flattening the visual personality.

Priority work:

- clarify grade-filter scope
- improve mobile navigation and mobile periodic-table exploration
- simplify crowded 3D controls on small screens
- semantic controls, keyboard navigation, focus management and dialogs
- ARIA where appropriate
- `prefers-reduced-motion`
- contrast and small-text review

### Phase 5 — Performance + Offline

Make the rich experience efficient and robust.

Priority work:

- lazy initialise heavy modules
- pause animation loops for hidden modules
- avoid unnecessary rendering work
- self-host or robustly cache critical dependencies
- offline/PWA strategy for classroom use

Performance work should optimise execution rather than indiscriminately remove visual effects.

### Phase 6 — Educational QA

Validate the application as an educational system, not just a working program.

Priority work:

- chemistry dataset review
- source/provenance coverage
- terminology consistency
- curriculum mapping with explicit curriculum/version references
- learning progression and prerequisite review
- cross-module consistency
- mastery/assessment validity

## Intended long-term product model

### Explore

Atom Studio, Periodic Table, Molecules, Orbitals, Atomic Models and Isomerism.

### Experiment

Compound Builder, Reaction Lab, Titration, Electrochemistry, Equilibrium, Kinetics and Solution Lab.

### Learn & Practice

Curriculum paths, Quests, quizzes, Flashcards, mini-games and eventually concept-mastery tracking.

The strongest product loop connects these surfaces rather than treating them as unrelated pages—for example: inspect K in the Periodic Table → understand 4s¹ in Atom Studio → connect valence behaviour → build KCl → study an appropriate real reaction → practise the concept in a Quest.

## Current P0 risks identified from the accepted prototype

- render atoms are used as chemical-composition truth in synthesis matching
- simplified sequential shell filling gives wrong shell populations from K onward
- subshell support is incomplete for heavier elements
- standard atomic weight is rounded to infer neutron count
- nuclear stability is presented from a coarse n/p-ratio heuristic
- synthesis results can display unsupported exact-looking temperatures
- synthesis results can imply all successful synthesis is exothermic
- formula building and chemical reaction modelling are conceptually mixed

These are scientific-model issues. Their repair should preserve the product's existing visual strengths.
