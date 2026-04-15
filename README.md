# EMF Visualizer

Interactive EMF/RF disturbance lab built with Next.js, React Three Fiber, MUI, and Zustand.

## Quickstart

```bash
npm install
npm run dev
```

Open `http://localhost:3000/lab`.

## Scripts

- `npm run dev` — start the app
- `npm run test` — run the test suite
- `npm run type-check` — run TypeScript checks
- `npm run build` — production build

## Features

- 3D source visualization
- Source add/remove/selection controls
- Frequency, power, and phase controls
- Environment and visualization settings
- Measurement capture and field readouts
- FPS monitoring and adaptive LOD
- WebGL error handling and accessibility labels

## Operator Sidebar Workflow

The `/lab` sidebar is organized for operator flow in fixed order:

1. **Simulation Setup**: add/clear sources and apply presets
2. **Active Entities**: inventory of sources and selection surface
3. **Selected Entity**: focused editing for selected source(s)
4. **Visualization Controls**: global rendering and display toggles
5. **Analysis / Measurements**: measurement capture and readouts
6. **System / View**: environment utilities, camera reset, FPS monitor

### Usage notes

- Use **Active Entities** to select; use **Selected Entity** to edit.
- Advanced source controls are collapsed by default for progressive disclosure.
- Precision parameters support dual-mode interaction (slider + numeric entry).
- Global sections do not mutate source-local settings.

## Architecture

The lab is organized into small modules:

- `app/lab/components/` — UI, control panel, analysis overlays, and 3D scene wrappers
- `app/lab/hooks/` — stateful hooks for camera, FPS monitoring, and field calculation
- `app/lab/lib/` — math, validation, camera, and visualization helpers
- `app/lab/modules/` — simulation and source/compute abstractions
- `app/lab/types/` — shared domain types and defaults

State lives in a Zustand store so UI controls and the 3D scene stay synchronized.

## Testing

Integration and component tests live under `__tests__/` and `app/lab/__tests__/`.
Run `npm test` before merging changes.

## Maxwell Full-Wave Solver

The lab includes a full-wave time-domain Maxwell FDTD solver for electromagnetic simulation beyond quasi-static approximations.

### Features
- **FDTD Solver**: Yee-grid Finite-Difference Time-Domain solver with CFL-stable leap-frog time stepping
- **12+ Validation Scenarios**: Correctness validated against analytical reference cases
- **Browser Safety**: Memory budget gating, auto-degrade, OOM protection, run cap enforcement
- **Derived Metrics**: Poynting vector magnitude and electromagnetic energy density
- **Accessibility**: Full keyboard-only navigation (A11Y-001 compliant)

### Running a Simulation
1. Open the lab at `/lab`
2. Expand the **Maxwell Solver** section in the control panel
3. Configure domain, materials, and boundary conditions
4. Submit run and monitor status transitions: `queued → running → validated`

### Troubleshooting
- **CFL violation**: Set `timeStepHint = 0` for auto-CFL time step
- **Memory exceeded**: Reduce grid resolution or use a coarser scenario class
- **Instability detected**: Reduce time step or check material property values
- **Run queue full**: Wait for a run to complete or cancel a queued run

### Verification
```bash
npm test           # Run all tests
npm run type-check # TypeScript validation
npm run build      # Production build
```
