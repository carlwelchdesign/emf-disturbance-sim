# EMF Math, Interference, and App Modeling Notes

This wiki explains the electromagnetic math used by the EMF Visualizer and how those concepts are implemented in this codebase.

## 1) Core EM concepts used in this app

### Frequency, wavelength, and wave number

- Frequency `f` (Hz) and wavelength `lambda` (m) are related by:
  - `lambda = c / f`
- Wave number:
  - `k = 2 * pi / lambda`

Code:
- `app/lab/lib/field-math.ts`
  - `frequencyToWavelength`
  - `wavelengthToFrequency`
  - `calculateWaveNumber`

### Near-field vs far-field

For a source at frequency `f`, the near-field radius is approximated as:

- `r_near = lambda / (2 * pi)`

This app uses that boundary for model behavior and stability softening near sources.

Code:
- `app/lab/lib/field-math.ts`
  - `calculateNearFieldRadius`
  - `isNearField`

### Free-space field strength approximation

The real-time model uses:

- `E = sqrt(30 * EIRP) / r`
- where `EIRP = P * G`

This is a practical RF visualization approximation used for fast interaction.

Code:
- `app/lab/lib/field-math.ts`
  - `calculateFreeSpaceFieldStrength`

## 2) Real-time interference model in this app

The default interactive field path uses source superposition with phase-aware contributions:

- each active source contributes a time-varying field term
- contributions are combined to estimate net electric and magnetic behavior
- interference structure is driven by relative source phase, frequency, distance, and geometry

Implementation details:
- `app/lab/modules/compute/cpu-backend.ts`
  - `CPUBackend.calculateFieldAtPoint`
  - handles power conversion (`dBm` to watts), directional gain weighting, spectral sampling, and phase contribution terms
  - builds combined field vectors and derived propagation/Poynting-like direction estimates

Why this matters:
- constructive interference: in-phase contributions reinforce net field strength
- destructive interference: out-of-phase contributions reduce/cancel net field strength

## 3) Maxwell full-wave solver path

The app also includes a full-wave Maxwell solver pipeline intended for higher-fidelity time-domain analysis.

High-level method:
- FDTD (Finite-Difference Time-Domain) with Yee-grid style discretization
- time-stepped updates for electric and magnetic field components
- run orchestration, validation workflow, and derived metrics

Core code:
- `app/lab/modules/maxwell/core/maxwell-solver-engine.ts`
- `app/lab/types/maxwell.types.ts`

Derived metrics panels and run context:
- `app/lab/components/Analysis/DerivedMetricsPanel.tsx`
- `app/lab/components/Analysis/MaxwellRunContextPanel.tsx`

## 4) Interference semantics and visual encoding

The Maxwell interference encoding logic classifies field intensity into semantic bands:

- `high` (`> 0.66`)
- `medium` (`0.33 - 0.66`)
- `low` (`< 0.33`)

It also supports:
- transition smoothing to reduce flicker near band boundaries
- interpretation summaries for strongest/weakest regions and overlap presence

Code:
- `app/lab/modules/maxwell/core/interference-encoding.ts`
  - `classifyInterferenceBand`
  - `smoothBandTransition`
  - `computeInterpretationSummary`
  - `inferMaxMagnitude`

## 5) Why Maxwell visuals are currently disabled

Solver execution and analysis are available, but the 3D Maxwell visual overlays are currently hidden while rendering quality/performance is improved.

Code:
- `app/lab/components/Canvas3D/MaxwellFieldOverlay.tsx` (returns `null`)
- `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx` (returns `null`)
- `app/lab/page.tsx` (Maxwell section marked `VISUALS DISABLED`)

## 6) Performance and safety considerations

### Runtime performance

- FPS monitoring is active and used to surface sluggish interaction risk.
- Smooth scene interaction is a first-class UX requirement.

Code:
- `app/lab/hooks/useFPSMonitor.ts`
- `app/lab/components/shared/PerformanceWarning.tsx`

### Correctness and safety in Maxwell runs

The Maxwell pathway includes validation and protective controls that are implemented in the solver workflow and also governed by architecture/spec constraints:
- correctness validation workflows and run state reporting
- memory/resource safety gates to avoid browser instability

Primary types and orchestration:
- `app/lab/types/maxwell.types.ts`
- `app/lab/modules/maxwell/core/maxwell-solver-engine.ts`

## 7) How to reason about outputs in this app

1. Use the default real-time field view for rapid exploratory interaction.
2. Use Maxwell runs when you need stricter simulation context and run-level validation metadata.
3. Interpret interference with both magnitude patterns and semantic context (not color alone).
4. Cross-check source configuration (position, phase, power, frequency) before drawing conclusions about unexpected regions.

## 8) Practical glossary

- **EIRP**: effective isotropic radiated power (`power * gain`)
- **Near-field**: region close to source where simple far-field assumptions are weaker
- **Superposition**: total field is the sum of source contributions
- **Constructive interference**: source contributions reinforce each other
- **Destructive interference**: source contributions cancel each other
- **FDTD**: finite-difference time-domain numerical method for Maxwell equations
- **Yee grid**: staggered grid arrangement for stable E/H updates in FDTD
- **Poynting quantity**: represents electromagnetic energy flow direction/magnitude context

## 9) Recommended near-term improvements

1. Re-enable Maxwell point-cloud visuals with clear non-color cues and stable temporal behavior.
2. Improve animation smoothness during rotate/pan/zoom while preserving existing workflows.
3. Expand solver method-family support in a pluggable way (future FEM/DGTD pathways).
4. Add persistence/export for reproducible scenarios and analysis artifacts.

## 10) Deployment and environment considerations

### Cross-platform Next.js dependency behavior

- This project should avoid pinning platform-specific Next.js SWC binaries in `package.json` (for example `@next/swc-darwin-arm64`).
- Why: local macOS installs may succeed with darwin-only binaries, but Linux CI/deploy targets (for example Vercel) will fail install with `EBADPLATFORM`.
- Correct approach: keep `next` as the dependency and let Next.js resolve the correct SWC package per environment.

### Interpreting install warnings vs blockers

- `npm warn ERESOLVE overriding peer dependency` messages around `three` / `@react-three/drei` / `@monogrid/gainmap-js` can be noisy but are not automatically fatal.
- Fatal install blockers are explicit `npm error` entries (for example `EBADPLATFORM`, `ERESOLVE` without override path, or missing package/version errors).
- For deployment triage, focus first on the final `npm error` block and exit code.
