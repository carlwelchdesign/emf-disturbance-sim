# Contributing

## Constitution

This project follows the principles defined in `.specify/memory/constitution.md`. All contributions must align with:

- **Feature-Boundary Architecture**: Keep feature logic isolated
- **SOLID Delivery**: Single responsibility, dependency inversion
- **Test and Validation Gates**: Validate math, rendering, and behavior
- **Design System Compliance**: Use MUI consistently, ensure accessibility
- **Observable, Safe Operations**: Handle edge cases, instrument performance
- **Visualization Quality**: Maximize data-ink ratio, minimize chartjunk, maintain graphical integrity

**For EMF visualization features specifically**: Follow Constitution Principle VI—show the data directly using truthful, low-clutter particle-cloud or vector representations. Avoid decorative effects that don't encode field information.

## Project structure

The lab uses a modular layout:

- Components are split by concern (`Canvas3D`, `ControlPanel`, `Analysis`, `shared`)
- Hooks encapsulate store interaction and recurring behaviors
- `lib/` contains pure helpers for math, validation, and rendering
- `modules/` contains simulation and backend abstractions
- `types/` defines shared domain models and defaults

## Workflow

1. Keep changes focused and avoid cross-cutting edits unless required.
2. Add or update tests alongside behavior changes.
3. Run:

```bash
npm test
npm run type-check
npm run lint
```

4. Prefer accessible controls, keyboard support, and sanitized inputs.

## UI guidance

- Use MUI components for consistency.
- Preserve visible focus states and ARIA labels.
- Add tooltips for controls that need extra context.

## Notes

- Keep production code free of stray console output.
- Prefer small, composable modules over large monolithic components.
