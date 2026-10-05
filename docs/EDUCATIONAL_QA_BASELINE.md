# Educational QA Baseline

## Purpose

This record starts Phase 6 by separating four kinds of learner-facing content:

1. **verified fact** — a factual claim reviewed against an identifiable authoritative or academic source;
2. **simplified teaching model** — intentionally simplified, explicitly labelled, and not contradictory to the underlying chemistry;
3. **illustrative visualization** — visual/interaction support that is not treated as chemical ground truth;
4. **needs review / source** — existing content that remains visible only where it is not known to be wrong, but must not be promoted as fully validated.

Unknown information remains unknown rather than being inferred.

## Accepted-content inventory

The byte-preserved prototype contains:

- 118 element records;
- 86 molecule/compound records;
- 16 Compound Builder quests;
- 4 Atomic Quick Check questions.

All 86 molecule/compound records contain learner-facing fields for geometry, VSEPR/model description, bond type, polarity, electronegativity difference, explanatory text and a real-world example. These fields are therefore part of the educational QA surface, not merely UI metadata.

## Baseline flags discovered

The initial machine-readable audit identifies:

- 16/16 quests whose descriptions begin with reaction-like verbs such as “ผสม”, “สร้าง” or “สังเคราะห์”, although the activity is a Compound Builder rather than a reaction simulation;
- 17 raw `$...$` TeX-style expressions in the curriculum guide even though the app does not render TeX there;
- a guide heading that presents the content as a curriculum summary before item-level mapping has been completed;
- 23 molecule records with numerical dipole-moment claims requiring source/condition review;
- 24 elements with no electronegativity value in the accepted data — these are retained as unknown rather than imputed;
- ionic solids and other non-discrete species represented inside a molecule-oriented schema, requiring representation-specific review rather than automatic “molecular polarity/VSEPR” assumptions.

## Batch 1 corrections

Phase 6 Batch 1 intentionally makes only high-confidence, high-impact corrections:

- Compound Builder quests are rewritten as **model-construction tasks**, not synthesis claims;
- the Guide no longer claims authoritative curriculum alignment while mapping is incomplete;
- unsupported raw TeX notation is replaced with readable Unicode chemistry notation;
- the atom explanation no longer describes electrons as particles following literal circular paths;
- the octet rule is identified as a useful guideline with exceptions, rather than a universal law;
- ionic bonding wording distinguishes electrostatic attraction / formula units from a universal electron-transfer story;
- the mole definition uses the exact SI Avogadro constant;
- gas molar volume is tied to explicit temperature/pressure conditions instead of calling 22.4 L “STP” without qualification;
- acid–base wording distinguishes the Arrhenius and Brønsted–Lowry models.

## Curriculum baseline

For this QA pass, Thai secondary-school curriculum mapping is anchored to the official science curriculum framework under the Basic Education Core Curriculum B.E. 2551 (2008), revised science indicators/content B.E. 2560 (2017), plus the IPST upper-secondary additional chemistry curriculum guide.

The newer B.E. 2568 curriculum materials currently published in the same OBEC collection are for early childhood and primary grades 1–3; they are not used here as a replacement secondary chemistry framework.

A grade label in ChemLab 3D remains an **app learning-path recommendation** until each concept is mapped to a specific official learning outcome/indicator.

## Evidence registry

Machine-readable source metadata is kept in `src/education/qa/sources.mjs`. Batch 1 includes:

- OBEC science core indicators/content (revised B.E. 2560);
- IPST additional chemistry curriculum guide for M.4–M.6;
- OBEC lower-secondary science curriculum guide;
- BIPM SI definition of the mole / Avogadro constant;
- IUPAC Gold Book definition of STP / standard gas conditions.

## Next QA slices

1. element-property provenance and description review;
2. molecule geometry/VSEPR/polarity/dipole review with representation context;
3. Reaction Lab equation/state/condition provenance completeness;
4. curriculum outcome matrix by concept, not merely by grade label;
5. quest/flashcard/quiz validity and misconception review;
6. Thai/English terminology consistency and final educational release gate.
