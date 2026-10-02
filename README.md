# ChemLab 3D

Interactive chemistry learning web app for Thai secondary-school students (ม.1–ม.6).

## Product goal

Build a chemistry learning experience that is:

- **Interactive and engaging** — students learn by exploring, manipulating, experimenting, and practicing rather than only reading.
- **Academically correct** — chemistry facts, equations, models, terminology, and simulations must be validated and must clearly distinguish exact science from simplified teaching models.
- **Visually distinctive** — preserve and improve the existing 3D, animation, effects, interaction design, and polished dark scientific UI.
- **Useful across secondary school** — connect atomic structure, periodic trends, bonding, molecules, reactions, laboratory concepts, and practice into one coherent learning journey.

## Non-negotiable preservation rule

Refactoring or correcting the chemistry core must **not** reduce the existing product experience. The current 3D models, visual effects, animations, sound, interactive controls, quests, mini-games, responsive behavior, and UI polish are treated as regression-protected product capabilities.

A change is not accepted merely because the code is cleaner or the chemistry calculation is more correct. It must also preserve or improve the existing functional and visual experience.

## Development plan

1. **P0 Chemistry Core Hardening**
2. **Reaction Architecture**
3. **Codebase Refactor**
4. **UX + Accessibility**
5. **Performance + Offline**
6. **Educational QA**

See [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md) for the project direction, preservation contract, quality gates, and detailed six-phase roadmap.

## Source-of-truth policy

GitHub repository history, accepted baselines, tests, and project documentation are the source of truth. Major refactors should be incremental and regression-protected; avoid a big-bang rewrite.
