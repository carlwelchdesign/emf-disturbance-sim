# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server

# Build & Type checking
npm run build        # Production build
npm run type-check   # Run tsc --noEmit (no output files)

# Linting
npm run lint         # ESLint on .ts/.tsx files

# Tests
npm test             # Run all Jest tests
npm run test:watch   # Jest in watch mode

# Run a single test file
npx jest app/lab/__tests__/lib/field-math.test.ts
```

## Architecture

This is a **Next.js 14 App Router** application for visualizing electromagnetic fields in 3D. The entire application lives under `app/lab/`.

### Data Flow

```
User Input (ControlPanel)
  → useLabStore (Zustand)
  → SimulationEngine / field math functions
  → FieldVisualization (R3F meshes)
  → Canvas3D (React Three Fiber)
```

### Layer Boundaries

| Layer | Path | Responsibility |
|-------|------|----------------|
| State | `app/lab/hooks/useLabStore.ts` | Single Zustand store; all mutable state lives here |
| Math | `app/lab/lib/` | Pure functions — no React, no side effects |
| Simulation | `app/lab/modules/` | `SimulationEngine` delegates to `IComputeBackend` (CPU backend today; GPU-ready interface) |
| Components | `app/lab/components/` | Dumb renderers; read from store via selectors, dispatch via store actions |
| Types | `app/lab/types/` | All shared TypeScript types; `index.ts` is the barrel export |

**Key rule**: Math functions in `lib/` must never import from `components/`, `hooks/`, or `modules/`. Components must not contain math logic.

### Key Files

- [app/lab/page.tsx](app/lab/page.tsx) — Main layout: splits viewport into Canvas3D (left) + ControlPanel (right)
- [app/lab/hooks/useLabStore.ts](app/lab/hooks/useLabStore.ts) — Zustand store with all state and actions
- [app/lab/lib/field-math.ts](app/lab/lib/field-math.ts) — RF field calculations (free-space path loss, near/far field, etc.)
- [app/lab/modules/simulation/simulation-engine.ts](app/lab/modules/simulation/simulation-engine.ts) — Orchestrates field grid computation; wraps `IComputeBackend`
- [app/lab/components/Canvas3D/Canvas3D.tsx](app/lab/components/Canvas3D/Canvas3D.tsx) — R3F `<Canvas>` wrapper with camera sync, WebGL context recovery, and fog
- [app/lab/components/Canvas3D/FieldVisualization.tsx](app/lab/components/Canvas3D/FieldVisualization.tsx) — Renders computed field grid as colored 3D geometry
- [app/lab/modules/scenario/presets.ts](app/lab/modules/scenario/presets.ts) — Built-in scenario presets (Wi-Fi, cellular, etc.)
- [app/lab/types/index.ts](app/lab/types/index.ts) — Barrel export for all shared types

### State Shape

The Zustand store (`LabStoreState`) holds:
- `sources: RFSource[]` — RF emitters (max 5 in V1)
- `measurements: MeasurementPoint[]` — Placed measurement points (max 5 in V1)
- `settings: VisualizationSettings` — LOD, color scheme, solver profile, FPS overlay
- `camera: CameraState` — Orbital camera position/target/fov
- `environment: Environment` — Room geometry and material properties
- `performance: PerformanceMetrics` — Live FPS with exponential moving average

### Compute Backend Pattern

`SimulationEngine` accepts an `IComputeBackend` interface. Currently only `cpu-backend.ts` is implemented. This interface exists so a GPU (WebGPU/WASM) backend can be swapped in without touching the simulation or rendering layers.

### Testing

Tests live alongside source files in `app/lab/__tests__/`. The structure mirrors the source tree:
- `__tests__/lib/` — Unit tests for pure math functions (highest coverage priority)
- `__tests__/components/` — React Testing Library + `@react-three/test-renderer` for R3F components
- `__tests__/hooks/` — Hook tests using RTL `renderHook`
- `__tests__/modules/` — Integration tests for simulation engine

### next.config.js

The webpack config excludes `canvas` from the bundle (`config.externals`) — required for `@react-three/fiber` to work in Next.js SSR.

## Specify Workflow

This repo uses Specify (`.specify/`) for AI-assisted feature development. Specs live in `.specify/specs/<id>/spec.md` and plans in `.specify/specs/<id>/plan.md`. The active feature spec is [.specify/specs/001-emf-visualizer/spec.md](.specify/specs/001-emf-visualizer/spec.md).
