# ChemLab 3D — Project Charter

Status: **Accepted project direction**  
Target audience: Thai secondary-school students (ม.1–ม.6)  
Primary product principle: **Improve correctness and architecture without sacrificing the existing interactive experience.**

---

## 1. Product vision

ChemLab 3D will become an interactive chemistry learning web app for secondary-school students that is more engaging, more coherent, and more academically reliable than the current prototype while preserving the prototype's strongest qualities.

The intended learning journey is:

**Atom → Element / Periodic Trends → Bonding → Molecule → Reaction → Experiment → Practice → Mastery**

The app should make chemistry concepts manipulable and observable, not merely convert textbook pages into a website.

### Product outcomes

The mature product should:

1. let students explore atoms, orbitals, elements, molecules, bonding, and reactions interactively;
2. use 2D/3D visualisation and animation where they materially improve understanding;
3. provide experiments and simulations with explicit assumptions and scientifically defensible models;
4. connect exploration to quests, quizzes, flashcards, and concept mastery;
5. map learning content to Thai secondary-school chemistry learning expectations after formal educational QA;
6. remain usable on common desktop, notebook, tablet, and mobile devices;
7. distinguish validated scientific facts from simplified teaching models and illustrative simulations.

---

## 2. Preservation contract — regression-protected product capabilities

The current application's visual and interactive quality is an accepted baseline. Refactoring is **preserve-first**.

The following are regression-protected unless an accepted replacement is demonstrably better:

- interactive 3D molecule viewer;
- molecule rotation, zoom, camera controls, representations, labels, atom interaction, and information panels;
- Atomic Structure Studio visualisation and animation;
- periodic-table interaction and visualisation modes;
- all existing laboratory/sandbox stations and their usable workflows;
- particle and reaction effects such as bubbles, flame, crystal effects, confetti, transitions, motion, and sound;
- quests, scoring, flashcards, mini-games, and other engagement mechanics;
- responsive/mobile behaviour that currently works;
- the dark scientific visual identity, glow treatment, cards, panels, typography hierarchy, and motion language;
- existing discoverability and useful interaction shortcuts;
- feature richness already present in the accepted baseline.

### Refactoring rule

Do **not** perform a big-bang rewrite solely to obtain a cleaner architecture.

Preferred sequence:

`accepted baseline → characterize behavior → add regression protection → extract one seam → verify → commit → continue`

A change that improves internal architecture but materially degrades UX, effects, 3D, responsiveness, interaction quality, or capability is **not accepted**.

---

## 3. Quality gates

Each phase and significant change must pass four gates.

### Gate A — Academic correctness

- Chemistry output must be scientifically defensible for its declared level of simplification.
- Exact data, derived calculations, heuristics, and teaching simplifications must not be conflated.
- Unsupported values must be represented as unknown/not simulated rather than fabricated.
- Key chemistry datasets and algorithms require validation tests.

### Gate B — Functional regression

- Existing supported workflows remain functional.
- Cross-feature links continue to work (for example synthesis → 3D viewer).
- Saved/local progress behavior is not silently broken.
- Existing feature capability is removed only by an explicit product decision.

### Gate C — Visual and interaction regression

- 3D, animation, effects, sound, transitions, and interaction affordances are preserved or improved.
- Desktop and mobile layouts are checked at representative viewport sizes.
- Any intentional visual change must improve clarity, learning, accessibility, or usability rather than merely simplify implementation.

### Gate D — Performance

- Hidden modules should not consume unnecessary CPU/GPU.
- Improvements should target wasted work before reducing visual quality.
- Performance optimisation must not indiscriminately remove effects or downgrade 3D fidelity.

---

## 4. Six-phase development plan

## Phase 1 — P0 Chemistry Core Hardening

Goal: make foundational chemistry data and calculations trustworthy without redesigning the experience.

Priority work:

- separate chemical composition from 3D render atoms/bonds;
- stop using render geometry as the chemistry source of truth;
- establish validated element data contracts;
- implement correct electron configurations for Z=1–118 from validated ground-truth data;
- derive Bohr shell populations from electron configurations rather than shell-capacity filling;
- distinguish standard atomic weight from isotope mass number;
- correct neutron/isotope handling;
- replace binary nuclear-stability claims based on simple n/p thresholds with appropriately qualified logic/data;
- remove fabricated or heuristic reaction temperature / enthalpy claims from factual result panels;
- add automated chemistry validation and regression tests;
- preserve current UI and effects while replacing the underlying chemistry logic.

Exit criteria:

- P0 chemistry defects identified in the initial audit are fixed or explicitly isolated behind a labelled simplified model;
- core chemistry tests pass;
- current key visual and interactive workflows still operate.

---

## Phase 2 — Reaction Architecture

Goal: distinguish formula/bonding construction from real chemical reactions.

Introduce two explicit concepts:

### Compound Builder

Used to learn:

- composition ratios;
- ions and charge neutrality;
- oxidation state reasoning where appropriate;
- formulas;
- bonding concepts;
- molecular/ionic representations.

### Reaction Lab

Uses curated reaction records containing, as applicable:

- actual reactants and products;
- balanced equation;
- physical states;
- conditions;
- catalyst;
- reaction class;
- energy data when validated;
- safety/educational notes;
- references/provenance.

Preservation requirement: keep the existing beaker interaction, visual effects, transitions, and satisfying feedback, but drive them from a correct reaction model.

Exit criteria:

- formula construction is no longer presented as a balanced chemical reaction;
- supported Reaction Lab examples use validated balanced equations;
- Compound Builder and Reaction Lab have clear learning purposes.

---

## Phase 3 — Codebase Refactor

Goal: reduce single-file structural debt incrementally without changing the accepted product experience.

Target conceptual structure:

```text
src/
  data/
    elements.*
    isotopes.*
    molecules.*
    reactions.*
  chemistry/
    electron-config.*
    formula.*
    stoichiometry.*
    reaction-engine.*
  features/
    atom/
    periodic-table/
    molecule-viewer/
    lab/
    practice/
  ui/
  styles/
```

This is a direction, not permission for a one-shot rewrite. Extract one validated boundary at a time.

Exit criteria:

- chemistry domain logic is no longer tightly coupled to 3D rendering;
- major feature modules have explicit boundaries;
- regression tests protect extracted behavior;
- visual experience remains equivalent or improved.

---

## Phase 4 — UX + Accessibility

Goal: make the application easier to navigate and accessible without flattening its distinctive design.

Priority work:

- clarify the scope of grade-level filtering and ultimately make it a coherent learning-level system if appropriate;
- rationalise top-level information architecture as feature count grows;
- improve mobile navigation and control density;
- provide a better mobile periodic-table exploration pattern;
- optimise 3D controls for small screens;
- semantic HTML for interactive controls;
- keyboard operation;
- visible focus states;
- dialog semantics and focus management;
- useful labels for icon-only controls;
- reduced-motion support;
- accessibility-aware alternatives for canvas/3D interactions;
- contrast and small-text review.

Exit criteria:

- major workflows are keyboard-operable where feasible;
- critical dialogs and controls have appropriate semantics;
- mobile learning flows no longer feel like compressed desktop screens;
- existing visual identity remains recognisably ChemLab 3D.

---

## Phase 5 — Performance + Offline

Goal: make the experience efficient and resilient, especially for student hardware and school connectivity.

Priority work:

- lazy initialise expensive feature modules;
- pause/resume requestAnimationFrame loops based on active feature visibility;
- avoid rendering hidden 3D/canvas scenes;
- investigate self-hosting critical runtime dependencies;
- establish offline/PWA strategy where useful;
- cache static learning data/assets appropriately;
- test representative lower-power hardware profiles.

Optimisation order:

1. eliminate wasted work;
2. reduce unnecessary updates/draw calls;
3. improve asset/runtime loading;
4. only reduce fidelity when evidence shows it is necessary.

Exit criteria:

- hidden modules do not continuously consume significant rendering resources;
- first-use and tab-switch experience is acceptable on representative student devices;
- core learning experience degrades gracefully under poor connectivity.

---

## Phase 6 — Educational QA

Goal: qualify the product for credible secondary-school learning use.

Priority work:

- validate chemistry datasets and terminology;
- audit formulas, molecular geometries, VSEPR descriptions, polarity, bonding, trends, equations, solution calculations, electrochemistry, kinetics, equilibrium, acids/bases, organic content, and laboratory simulations;
- add source/provenance metadata for authoritative scientific data where practical;
- distinguish factual reference data from explanatory simplifications;
- map content to Thai secondary-school curriculum/learning expectations using the relevant official curriculum sources;
- identify content that belongs to lower-secondary, upper-secondary core science, and additional chemistry courses;
- perform teacher/subject-matter review before claiming curriculum alignment.

Exit criteria:

- no known P0 scientific misinformation remains;
- curriculum claims are supported by an explicit mapping;
- simplified models disclose their assumptions/limits;
- a documented content-review process exists.

---

## 5. Baseline identity

The accepted pre-refactor application supplied at project start is:

- source file: `ChemLab_3D_Interactive_App.html`
- line count: **9,540**
- byte size: **644,997 bytes**
- SHA-256: `3fd0d17583d07ccfdded08daed5d753f2adaf232a8da6a0a995bef1afcf6220f`

This checksum is the reference for the original accepted prototype supplied on 2026-10-02.

The baseline is valuable not because every scientific output is correct, but because it captures the accepted product capabilities, visual language, interaction richness, and feature breadth that subsequent engineering work must preserve.

---

## 6. Known P0 findings from the initial audit

These findings define the starting technical risk register.

1. **Render atoms are used as chemistry composition truth.** 3D representation data must be decoupled from chemical formula composition.
2. **Bohr shell calculation uses sequential shell capacities (2, 8, 18, 32, ...).** This gives incorrect shell populations for cases such as potassium and beyond.
3. **Subshell configuration coverage is incomplete for the full periodic table.** A validated Z=1–118 dataset/engine is required.
4. **Standard atomic weight is rounded and used to infer neutron count.** Atomic weight must not be treated as a specific isotope mass number.
5. **Nuclear stability is inferred from a coarse n/p-ratio threshold.** This may be used only as a clearly labelled trend model, not isotope truth.
6. **The current synthesis display can format atom counts as though they were chemical equations.** Compound construction and balanced reactions must be separated.
7. **Synthesis result panels can assign heuristic temperatures and label products as exothermic without reaction-specific evidence.** Unsupported thermochemical claims must be removed or replaced by validated data.
8. **Grade selection appears global but currently affects a narrower part of the application.** Scope and behavior must be made consistent.
9. **Accessibility semantics and keyboard support require systematic work.**
10. **Multiple continuously running animation/render loops may consume resources while their modules are hidden.**

---

## 7. Engineering decision principles

When trade-offs arise, use this order:

1. safety and academic correctness;
2. preservation of learning value and interaction capability;
3. clarity for students;
4. regression safety;
5. maintainability;
6. performance efficiency;
7. implementation elegance.

Code cleanliness alone is not a sufficient reason to remove a valuable product behavior.

---

## 8. Definition of the final product

ChemLab 3D succeeds when a secondary-school student can use it to **see, manipulate, test, and practise chemistry concepts**, receives scientifically reliable feedback appropriate to the declared teaching model, and finds the experience compelling enough to keep exploring.
