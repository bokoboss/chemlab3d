# ChemLab 3D — Scientific Data Source Policy

This document defines the preferred evidence hierarchy for chemistry reference data used by ChemLab 3D.

## Principles

1. Prefer primary/evaluated scientific reference sources over unsourced tables.
2. Store provenance with datasets or document the exact source/version used.
3. Distinguish measured/evaluated data from predictions, simplified teaching models, and illustrative simulation parameters.
4. Do not silently replace missing data with plausible-looking numbers.
5. When authoritative sources disagree or use different conventions, document the convention chosen by the app.

## Source hierarchy

### Atomic electronic structure

**Primary:** NIST Physical Measurement Laboratory / NIST SP 966 and Atomic Spectra Database.

- NIST Periodic Table — Atomic Properties of the Elements, SP 966, June 2024.
- NIST Atomic Spectra Database (ASD), ground states / configurations.

For the Phase 1 neutral-atom electron configuration core, NIST SP 966 (June 2024) is the reference convention. This matters for cases where older or secondary sources differ. Example: NIST lists Lawrencium ground-state configuration as `[Rn]5f14 7s2 7p1`.

### Standard atomic weights

**Primary:** IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW).

- Use standard atomic weight as a distinct property.
- Do not derive a neutron count by rounding a standard atomic weight.
- For elements without a standard atomic weight, use an explicitly identified isotope/mass number only when that is the intended property.

### Isotopes / nuclear stability / decay

**Primary:** IAEA LiveChart / ENSDF-backed evaluated nuclear data where practical.

- Stability is a nuclide property, not a property that can be determined exactly from a coarse neutron/proton-ratio threshold.
- A band-of-stability visualization may be retained as an explicitly labelled simplified teaching model.

### Secondary aggregation / cross-checking

**PubChem Elements / Periodic Table** may be used as a convenient secondary source and cross-check because it exposes provenance from NIST, IUPAC, IAEA, U.S. national laboratories, and other scientific sources.

When PubChem and the current NIST reference convention differ for a property owned by NIST, prefer the current NIST value/convention and document the difference if it is educationally relevant.

## Current references

- NIST Periodic Table of the Elements: https://www.nist.gov/pml/periodic-table-elements
- NIST SP 966 June 2024 PDF: https://www.nist.gov/system/files/documents/2024/06/25/NIST_periodictable_June24_iupac.pdf
- NIST Atomic Spectra Database: https://www.nist.gov/pml/atomic-spectra-database
- IUPAC Periodic Table: https://iupac.org/what-we-do/periodic-table-of-elements/
- CIAAW Standard Atomic Weights: https://ciaaw.org/atomic-weights.htm
- IAEA LiveChart of Nuclides: https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html
- PubChem Periodic Table: https://pubchem.ncbi.nlm.nih.gov/periodic-table/
- PubChem periodic-table PUG REST endpoint: https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON
