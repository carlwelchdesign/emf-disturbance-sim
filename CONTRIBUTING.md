# Contributing

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
```

4. Prefer accessible controls, keyboard support, and sanitized inputs.

## UI guidance

- Use MUI components for consistency.
- Preserve visible focus states and ARIA labels.
- Add tooltips for controls that need extra context.

## Notes

- Keep production code free of stray console output.
- Prefer small, composable modules over large monolithic components.
