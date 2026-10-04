# Phase 4 Acceptance — UX + Accessibility

Phase 4 improves navigation, mobile ergonomics and inclusive interaction without replacing ChemLab 3D's accepted visual language, 3D experience, effects, simulations or learning features.

## Accepted outcomes

### Accessibility foundation

- keyboard-visible focus treatment is available without changing the default visual appearance;
- a skip link reaches the primary learning content;
- non-native clickable controls receive keyboard activation semantics where native controls are not already used;
- modal surfaces receive dialog semantics, focus entry, focus trapping, Escape handling and focus return;
- reduced-motion preferences suppress non-essential motion while preserving the default animated experience for other users.

### Grade-filter scope

The header grade selector is explicitly presented as a molecule-library filter. Its implementation continues to filter the molecule list only; it is no longer presented as an application-wide learning-level switch.

### Mobile navigation

- the original top-level navigation remains intact;
- a mobile learning overview provides a grouped route to all seven top-level destinations;
- the full periodic table remains available, with mobile jump controls for groups 1–2, 3–12 and 13–18;
- horizontal scroll regions remain scrollable while gaining keyboard/assistive-technology affordances.

### Mobile 3D viewer

- the existing molecule library, rendering modes, measurement, dipole, isomer, reaction-pathway, export and view controls remain available;
- on narrow screens, secondary analysis/view controls are collapsed by default behind an explicit “เพิ่มเติม” control to reclaim 3D viewport space;
- desktop presentation remains fully expanded;
- the accepted Three.js canvas, auto-rotation, effects and information bar are preserved.

### Readability

- the dim-text token was raised from `#64748b` to `#7c8aa0`; the revised token clears a 4.5:1 contrast floor against the common opaque card reference surface `#101828`;
- small periodic-table labels and mobile quick-navigation text receive modest mobile-only size increases;
- touch-oriented viewer controls receive larger minimum control height on narrow screens.

## Preservation gates

Phase 4 is not accepted unless both automated gates pass on the final implementation state:

1. `Chemistry / build regression`
2. `Preserve 3D / effects / UX (desktop + mobile)`

Implementation commit `db936f41f4978285955f2b3fcb0b5151008dd9e0` passed both gates. The browser suite covers the accepted desktop/mobile experience together with the new accessibility, mobile-navigation and viewer-UX behavior.

## Explicit non-goals

Phase 4 does **not**:

- replace the established dark scientific visual identity;
- remove or globally disable animation/effects as an accessibility shortcut;
- replace the desktop 3D toolbar with a reduced-capability interface;
- convert the molecule grade filter into an application-wide curriculum profile without a separate product/design decision;
- certify curriculum alignment. Curriculum mapping remains Phase 6 work.

## Result

Phase 4 is accepted when this record is merged to `main`. Phase 5 then becomes the active roadmap item: performance and offline/classroom resilience.
