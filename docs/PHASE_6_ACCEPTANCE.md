# Phase 6 Acceptance — Educational QA

## Decision

**ACCEPTED for the ChemLab 3D v1 playable educational release.**

This is a **risk-based release acceptance**, not a claim that every scientific field in the historical prototype has complete item-level provenance or that the app is formally certified against the Thai curriculum.

The release is accepted because high-risk misconception paths were corrected, unsupported quantitative claims were removed or downgraded to qualitative models, representation context is made explicit, unknown values are not fabricated, and the remaining gaps are documented as limitations rather than presented as verified ground truth.

## Accepted QA surface

The Phase 6 inventory covers the complete accepted prototype surface:

- 118 element records;
- 86 molecule / compound / structure records;
- 16 Compound Builder quests;
- 4 Atomic Quick Check questions.

The release pipeline applies the educational QA transform before offline packaging, so the reviewed content is part of the production build rather than a separate documentation-only audit.

## Corrections and safeguards accepted

### Learner wording and misconception control

- Compound Builder tasks use model-construction language rather than implying that the UI simulates chemical synthesis.
- The Guide no longer claims authoritative curriculum alignment while item-level mapping is incomplete.
- Raw TeX-like notation that was not rendered by the app is replaced with readable chemistry notation.
- Electron-shell illustrations are explicitly treated as teaching models rather than literal orbital paths.
- The octet rule is described as a useful guideline with exceptions, not a universal law.
- Ionic bonding language distinguishes electrostatic attraction, ions and formula units from an over-generalized electron-transfer story.
- Mole and ideal-gas examples state the relevant definition / conditions instead of presenting an ambiguous STP shortcut.
- Acid–base wording distinguishes Arrhenius and Brønsted–Lowry framing.

### Molecule / material representation

The 86 records are classified into representation contexts instead of treating every entry as a discrete molecule:

- 69 discrete-molecule records;
- 14 ionic formula-unit / lattice-context records;
- 3 context-dependent records.

The QA layer also identifies 25 records whose displayed atom coordinates do not represent the complete formula. Those models remain usable as illustrations but are not used to claim a quantitative molecular dipole.

### Quantitative-claim control

- 23 unsourced numeric dipole-moment claims are removed rather than replaced with invented values.
- The 3D dipole helper is explicitly qualitative and no longer converts its internal visualization magnitude into Debye.
- Missing electronegativity values are not silently imputed. The accepted dataset contains 24 such element records and the viewer reports the limitation instead of forcing a calculation.
- Ionic formula units are not described using a molecular dipole model.

## Evidence baseline

The machine-readable evidence registry includes authoritative sources for the release-level corrections, including:

- Thai basic-education science curriculum material published by OBEC;
- IPST upper-secondary additional chemistry guidance;
- lower-secondary science curriculum guidance;
- BIPM SI material for the mole / Avogadro constant;
- IUPAC Gold Book material for standard gas conditions / STP terminology.

Source metadata is maintained in `src/education/qa/sources.mjs`.

## Automated acceptance gates

Phase 6 is regression-protected by unit/integration and browser tests that verify, among other things:

- the accepted inventory counts remain explicit;
- all 16 quests receive reviewed descriptions;
- misconception-prone Guide wording does not regress;
- molecule representation classification remains deterministic;
- unsourced numeric dipole claims remain removed;
- unknown electronegativity is not imputed;
- learner-facing dipole output remains qualitative;
- educational QA remains in the production build pipeline;
- desktop/mobile 3D, effects, interaction and offline behavior remain preserved.

At project closeout, the latest `main` test workflow passed both **Chemistry / build regression** and **Preserve 3D / effects / UX (desktop + mobile)** gates.

## Release boundary and known limitations

The following items are **not blockers for the v1 playable release**, but must not be represented as completed work:

1. Not every element-property or molecule-description field has an item-level primary-source citation.
2. Grade labels are learning-path recommendations, not a completed concept-by-concept certification against official learning outcomes.
3. 3D structures are educational visualizations; geometry and coordinate data are not guaranteed to be research-grade molecular structures.
4. Context-dependent species can vary by phase, charge state, aggregation or environment; the UI presents one learning context and labels that limitation where relevant.
5. The application is an educational learning tool, not a laboratory procedure, safety manual, analytical chemistry package or substitute for instructor judgment.

If the project is reopened for a higher-assurance academic edition, the next sensible work would be item-level provenance, a formal curriculum-outcome matrix, and exhaustive terminology / assessment validation. Those are a **new assurance scope**, not unfinished blockers for this v1 closeout.

## Preservation rule

No Phase 6 correction is accepted if it removes or materially degrades the established 3D rendering, effects, animation, interaction richness, responsive UX, quests or learning surfaces without an intentionally approved replacement.
