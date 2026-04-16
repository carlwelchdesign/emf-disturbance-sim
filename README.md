# EMF Visualizer

Interactive EMF/RF disturbance lab built with Next.js 14, React Three Fiber, MUI, and Zustand.

Licensed under the GNU General Public License v3.0 only. See [LICENSE](LICENSE).

<img width="1728" height="962" alt="image" src="https://github.com/user-attachments/assets/7d1741de-f209-48ad-9dd1-1509dac16715" />

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
- `npm run lint` — run ESLint
- `npm run build` — production build

## Technical Feature Overview

### 3D scene and interaction

- React Three Fiber scene with source markers, measurement markers, drone markers/paths, contested-zone markers, and field overlays.
- Orbit/pan/zoom camera control with FPS sampling and smoothness/performance degradation signaling.
- WebGL context error boundary for recovery-safe rendering behavior.

Key files:
- `app/lab/page.tsx`
- `app/lab/components/Canvas3D/Canvas3D.tsx`
- `app/lab/hooks/useCameraControls.ts`
- `app/lab/hooks/useFPSMonitor.ts`

### Source modeling and controls

- RF sources support position, frequency, phase, power (`watts` or `dBm`), bandwidth, faction, and antenna type metadata.
- Sidebar workflow supports setup, active-entity selection, focused parameter editing, visualization controls, and analysis.
- Precision controls use dual-mode UI (slider + direct numeric entry).

Key files:
- `app/lab/components/ControlPanel/ControlPanel.tsx`
- `app/lab/components/ControlPanel/SourceControls.tsx`
- `app/lab/components/shared/DualModeControl.tsx`
- `app/lab/types/source.types.ts`

### Field modeling pathways

1. **Real-time EMF model (default visual path)**  
   CPU superposition model with near-field softening and directional gain handling:
   - free-space field approximation: `E = sqrt(30 * EIRP) / r`
   - source phase and spectral spread support
   - faction-aware threat/interaction metrics

2. **Full-wave Maxwell solver (run + analysis path)**  
   FDTD Yee-grid solver with run orchestration, validation scenarios, and safety gates:
   - domain/material/boundary inputs
   - derived metrics including Poynting/energy density
   - run lifecycle (`queued`, `running`, `validated`, etc.) and provenance

Key files:
- `app/lab/lib/field-math.ts`
- `app/lab/modules/compute/cpu-backend.ts`
- `app/lab/modules/maxwell/core/maxwell-solver-engine.ts`
- `app/lab/types/maxwell.types.ts`

### Interference and interpretation

- Legacy interference view renders continuous 3D field structure for interactive exploration.
- Maxwell interference encoding includes semantic bands (`high`, `medium`, `low`) plus interpretation summaries (strongest/weakest regions and overlap presence).
- Accessibility requirement is enforced by design intent: interference cannot rely on color-only semantics.

Key files:
- `app/lab/components/Canvas3D/InterferenceField3D.tsx`
- `app/lab/modules/maxwell/core/interference-encoding.ts`
- `app/lab/components/Analysis/MaxwellRunContextPanel.tsx`

## Current Maxwell UI Status

- Maxwell **solver execution and metrics panels are active**.
- Maxwell **3D visual overlays are currently disabled in the UI** while point-cloud rendering quality is refined:
  - `app/lab/components/Canvas3D/MaxwellFieldOverlay.tsx`
  - `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx`

This lets teams validate solver behavior and derived metrics now, while visual rendering iterates separately.

## Performance, Safety, and Quality Controls

- FPS monitor and performance warning surfaces for sluggish scenes.
- Maxwell run safety controls include memory budgeting, OOM guard behavior, degradation controls, and run-cap/queue enforcement.
- Validation workflows support threshold-based correctness reporting before results are treated as trusted.

## Architecture

- `app/lab/components/` — UI, control panel, analysis overlays, and 3D scene wrappers
- `app/lab/hooks/` — stateful hooks (camera, FPS, field sampling, store interactions)
- `app/lab/lib/` — pure math and utility helpers
- `app/lab/modules/` — compute engines, source abstractions, Maxwell pipeline
- `app/lab/types/` — shared domain types and defaults

State is centralized in `useLabStore` (Zustand) to keep controls, analytics, and scene rendering synchronized.

## Testing

- Unit/component/integration tests live under `app/lab/__tests__/` and top-level `__tests__/`.
- Maxwell-specific coverage includes encoding behavior, a11y runflow, performance windows, and solver integrations.

## Deployment Notes (Vercel / Linux)

- Do **not** add platform-specific SWC packages (for example `@next/swc-darwin-arm64`) to `dependencies` or `devDependencies`.
- Next.js resolves the correct SWC binary for the deployment platform automatically during install.
- This repo includes `.npmrc` with `include=dev` so deploy environments that set production mode during `npm install` still install build-time packages required by Next.js type-checking.
- If deployment fails with `EBADPLATFORM` mentioning `@next/swc-darwin-arm64`, remove that package from `package.json` and redeploy.
- `three`/`@react-three/drei` peer dependency messages can appear as warnings during install; warnings alone are not a deployment failure.
- For detailed install warning/error triage, see the wiki section "Deployment and environment considerations."

## Technical Wiki

For the deeper engineering reference (math, interference semantics, and how equations map to this codebase), see:

- [https://github.com/carlwelchdesign/emf-disturbance-sim/wiki](https://github.com/carlwelchdesign/emf-disturbance-sim/wiki)

## Next Steps

1. Complete Maxwell point-cloud visual reintroduction with robust non-color interference cues and stable region interpretation.
2. Improve animation and camera smoothness under sustained interaction while preserving current workflows.
3. Extend solver architecture toward additional method families (for example FEM/DGTD adapters) without changing user workflow.
4. Add GPU-backed compute pathways for larger scenarios and lower latency.
5. Introduce scenario persistence/export tooling for repeatable analysis workflows.
