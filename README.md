# ChemLab 3D

ChemLab 3D is being developed into an interactive, engaging, academically trustworthy chemistry learning web app for secondary-school students.

## Product direction

The project follows a preserve-first strategy: improve scientific correctness, maintainability, accessibility, and performance **without sacrificing the accepted prototype's 3D, visual effects, animation, interaction richness, UX/UI polish, responsive behavior, or feature breadth**.

The current roadmap is documented in [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md).

## Six-phase roadmap

1. P0 Chemistry Core Hardening
2. Reaction Architecture
3. Codebase Refactor
4. UX + Accessibility
5. Performance + Offline
6. Educational QA

## Development rule

Visual and interaction capability are regression gates. Refactoring is accepted only when chemistry correctness improves while the learning experience is preserved or improved.

## Testing

```bash
npm test
```

The project intentionally starts with a zero-dependency Node test setup for the chemistry-domain layer.
