# Implementation Plan: EMF Disturbance and Interference Lab

**Branch**: `002-disturbance-lab` | **Date**: 2025-06-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-disturbance-lab/spec.md`

**Note**: This plan follows the execution workflow defined in `.specify/templates/plan-template.md`.

## Summary

This feature delivers the **visualization layer** of an EMF/RF exposure prediction, analysis, and communication platform. The platform follows a three-layer model: (1) Visualization (V1 core), (2) Analysis (V1.5-V2), (3) Professional Platform (V2+). V1 focuses on establishing modular foundations for interactive 3D field visualization with honest, communication-oriented UX that acknowledges model limitations.

Users can add RF/EMF sources, configure parameters (frequency, power, position), visualize field strength in a 3D environment, place measurement points, and see analysis overlays. The implementation prioritizes **practical V1 scope** with clear modular boundaries between UI, simulation, compute, environment, source, visualization, scenario, and reporting concerns.

**Technical Approach**: Client-side single-page application using Next.js App Router, React Three Fiber for 3D rendering, and Zustand for state management. **CPU-based field calculations** in V1 (GPU acceleration deferred to V2). Simplified propagation model (inverse-distance, superposition) with **near-field vs far-field distinction** (accurate reactive field modeling deferred to V2). **Environment-aware simulation** with basic 3D space boundaries (rich material modeling deferred to V2). **Omnidirectional sources** in V1 (beam steering and phased arrays deferred to V2). **Analysis overlays** show field strength measurements. **Honest trust/accuracy language** throughout UI with disclaimers and model limitations clearly communicated.

## Technical Context

**Language/Version**: TypeScript 5.3, React 18.2, Next.js 14.0 (App Router)  
**Primary Dependencies**: @mui/material, @emotion/react, @emotion/styled, @react-three/fiber 8.14, @react-three/drei 9.88, three r158, zustand 4.4  
**Storage**: Client-side memory only (no persistence in V1)  
**Testing**: Jest 29.7, React Testing Library 14.0, ts-jest 29.1  
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge) with WebGL 2.0  
**Project Type**: Single-page web application (EMF/RF visualization and analysis platform)  
**Performance Goals**: 30+ FPS with 3-5 sources (CPU-based V1), <100ms parameter update latency, <2s initial load  
**Constraints**: WebGL 2.0 required, CPU-only calculations (GPU deferred to V2), no server-side rendering for 3D  
**Scale/Scope**: Single feature page, 15-20 React components, 8-10 custom hooks, ~3000-4000 LOC
**Architecture**: Modular boundaries between UI, simulation, compute, reporting, scenario, environment, source, and visualization modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Feature-Boundary Architecture ✅ PASS

**Assessment**: This is the first feature in a new project. All EMF-related logic will reside in a single feature boundary (`app/lab` or `app/disturbance-lab`). No existing features to conflict with. Route handler (if needed) will be minimal since this is client-side only. Business logic (field calculations, source management) will live in dedicated services/hooks, not embedded in components.

**Plan**: Create `app/lab/` containing page.tsx, components/, hooks/, lib/ (field math), and types/. Global utilities (if any) go to project-level `lib/` only when reused beyond this feature.

### II. Dependency Inversion and SOLID Delivery ✅ PASS

**Assessment**: Architecture naturally supports SOLID with clear modular boundaries:
- **Single Responsibility**: Separate modules for UI, Simulation (field math), Compute (CPU/GPU backends), Environment (3D space), Source (antenna modeling), Visualization (rendering), Scenario (presets), Reporting (future assessments)
- **Open/Closed**: Compute module interface supports swapping CPU ↔ GPU implementations without changing dependents; Source module can add antenna patterns (omnidirectional → directional) without breaking existing code
- **Liskov Substitution**: ComputeBackend interface allows CPU and GPU implementations to be interchangeable; AntennaPattern interface allows omnidirectional, directional, phased array patterns to substitute
- **Interface Segregation**: Narrow interfaces per module (ISimulationEngine, IComputeBackend, IEnvironmentModel, ISourceModel, IVisualizationRenderer) vs. monolithic god interface
- **Dependency Inversion**: React components depend on store/hook abstractions; Simulation module depends on IComputeBackend interface, not concrete CPUCalculator implementation

**Plan**: Define TypeScript interfaces for all module boundaries. Use strategy pattern for swappable components (compute backend, antenna pattern). Implement V1 with CPU backend and omnidirectional sources, but design interfaces to support V2 GPU and directional patterns without refactoring dependents.

### III. Test and Validation Gates ✅ PASS

**Assessment**: Mathematical correctness and trust/communication are critical. RF propagation model must be verifiable, and UX must accurately communicate limitations. Required test coverage:
- **Math Tests**: Field strength calculations (superposition, phase, inverse-distance falloff), near-field vs far-field boundary detection, unit conversions (dBm ↔ W/m²)
- **Module Tests**: Compute backend (CPU calculator), Source module (omnidirectional pattern), Environment module (boundary checks), Simulation module (end-to-end field calculation)
- **Component Tests**: Source controls update state, measurement point placement, accuracy disclaimers visible, parameter sliders emit correct values with units
- **Integration Tests**: Parameter change → state update → field recalculation → visualization update path; measurement point placement → field query → display with units and disclaimer
- **Trust/Communication Tests**: Verify all visualizations include disclaimer labels, verify near/far field regions labeled correctly, verify "~" prefix on approximate values

**Plan**: Create `__tests__/` directories per module. Write tests before implementation (TDD for simulation/compute layers). Verify accuracy disclaimer presence in component snapshots. Test module interfaces independently to ensure boundaries are clean.

### IV. Design System and Accessibility Compliance ✅ PASS

**Assessment**: The plan now aligns with the constitution by adopting MUI as the production UI foundation in V1. The UI layer will use MUI components, a dark MUI theme, and accessible interaction states throughout the feature.

**Plan**:
- Add Material UI and Emotion dependencies in Phase 1
- Create a feature-scoped MUI theme and provider in `app/lab/theme/`
- Build UI wrappers on top of MUI components where needed, rather than custom controls
- Keep all interactive UI accessible, responsive, and tokenized through the MUI theme

**Accessibility Commitment**: All controls MUST have ARIA labels, keyboard navigation MUST work (Tab, Arrow keys, Enter/Space), focus indicators MUST be visible, and 3D canvas MUST have descriptive text alternative explaining the visualization.

### V. Observable, Safe Operations ✅ PASS

**Assessment**: Performance observability and error handling are critical:
- **Performance**: FPS counter component, React DevTools Profiler, parameter change throttling
- **Error Handling**: WebGL context loss detection/recovery, parameter validation (prevent NaN, Infinity, div-by-zero), graceful degradation when source count exceeds performance threshold
- **State Safety**: Zustand provides immutable updates, state reset to defaults available via "Clear All" action

**Plan**: Implement FPS monitoring hook, error boundaries around 3D canvas, validation layer in state setters. Log warnings (not errors) when performance degrades. Provide user-facing feedback when WebGL unavailable.

### Post-Design Re-Check

After Phase 1 (data-model.md, contracts/), verify:
- All entity relationships documented
- Component boundaries respect SOLID
- Test strategy covers math → rendering pipeline
- Accessibility requirements captured in quickstart.md

## Project Structure

### Documentation (this feature)

```text
specs/001-disturbance-lab/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

Note: `contracts/` directory omitted per user request (no external contract surface for this single-page app).

### Source Code (repository root)

**Recommended Structure**: Next.js App Router single-page application

```text
app/
└── lab/                      # Feature: EMF/RF Visualization Platform
    ├── page.tsx              # Main page component (client-side entry)
    ├── layout.tsx            # Optional: feature-specific layout
    ├── components/           # React components
    │   ├── Canvas3D/         # Visualization module (Three.js/R3F wrapper)
    │   │   ├── Canvas3D.tsx
    │   │   ├── FieldVisualization.tsx
    │   │   ├── SourceMarker.tsx
    │   │   ├── MeasurementPoint.tsx
    │   │   ├── EnvironmentBoundary.tsx
    │   │   └── CameraControls.tsx
    │   ├── ControlPanel/     # UI module
    │   │   ├── ControlPanel.tsx
    │   │   ├── SourceList.tsx
    │   │   ├── SourceControls.tsx
    │   │   ├── EnvironmentControls.tsx
    │   │   ├── MeasurementTools.tsx
    │   │   └── VisualizationSettings.tsx
    │   ├── Analysis/         # Analysis overlay UI
    │   │   ├── FieldStrengthDisplay.tsx
    │   │   ├── MeasurementList.tsx
    │   │   └── AccuracyDisclaimer.tsx
    │   └── shared/           # Shared UI primitives backed by MUI
    │       ├── Button.tsx
    │       ├── Slider.tsx
    │       ├── Tooltip.tsx
    │       └── FPSMonitor.tsx
    │   ├── theme/            # MUI theme and provider
    │   │   ├── theme.ts
    │   │   └── ThemeProvider.tsx
    ├── modules/              # Business logic modules (clean interfaces)
    │   ├── simulation/       # Simulation module
    │   │   ├── simulation-engine.ts
    │   │   ├── field-calculator.ts
    │   │   └── types.ts
    │   ├── compute/          # Compute module (CPU in V1, GPU-ready interface)
    │   │   ├── compute-backend.interface.ts
    │   │   ├── cpu-backend.ts
    │   │   └── (gpu-backend.ts - stub for V2)
    │   ├── source/           # Source module (antenna modeling)
    │   │   ├── source-model.ts
    │   │   ├── antenna-patterns.ts  # omnidirectional in V1
    │   │   └── types.ts
    │   ├── environment/      # Environment module
    │   │   ├── environment-model.ts
    │   │   ├── material-properties.ts  # placeholders in V1
    │   │   └── types.ts
    │   ├── scenario/         # Scenario module (stub in V1, rich in V1.5)
    │   │   ├── scenario-manager.ts
    │   │   └── types.ts
    │   ├── reporting/        # Reporting module (stub interface in V1, EN 62232 in V2)
    │   │   ├── report-generator.interface.ts
    │   │   └── (en62232-report.ts - V2)
    │   └── visualization/    # Visualization helpers
    │       ├── color-mapping.ts
    │       ├── lod-strategy.ts
    │       └── overlay-helpers.ts
    ├── hooks/                # Custom React hooks
    │   ├── useSourceStore.ts       # Zustand store hook
    │   ├── useSimulationEngine.ts  # Simulation module hook
    │   ├── useEnvironmentModel.ts  # Environment module hook
    │   └── useCameraState.ts       # Camera state hook
    ├── types/                # Shared TypeScript interfaces
    │   ├── source.types.ts
    │   ├── field.types.ts
    │   ├── environment.types.ts
    │   ├── measurement.types.ts
    │   └── visualization.types.ts
    └── __tests__/            # Feature tests
        ├── modules/
        │   ├── simulation/
        │   │   └── field-calculator.test.ts
        │   ├── compute/
        │   │   └── cpu-backend.test.ts
        │   ├── source/
        │   │   └── antenna-patterns.test.ts
        │   └── environment/
        │       └── environment-model.test.ts
        └── components/
            ├── SourceControls.test.tsx
            ├── MeasurementTools.test.tsx
            └── AccuracyDisclaimer.test.tsx

lib/                          # Global utilities (only if reused outside /lab)
└── (empty for now - add only when needed)

public/                       # Static assets
└── (none needed for V1)

__tests__/                    # Global/integration tests
└── integration/
    └── lab-workflow.test.tsx
```

**Structure Decision**: Modular architecture with clear boundaries. Each `modules/` subdirectory represents a distinct concern (Simulation, Compute, Source, Environment, Scenario, Reporting, Visualization) with clean TypeScript interfaces. V1 implements CPU compute backend, omnidirectional sources, basic environment, and MUI-backed UI; V2 swaps in GPU backend, directional antennas, rich environment without refactoring dependents.

**Why Modules Over Flat Lib**: Enforces separation of concerns, makes module boundaries explicit, enables independent testing, simplifies future refactoring (e.g., extracting compute module to Web Worker).

**Structure Decision**: Modular architecture with clear boundaries. Each `modules/` subdirectory represents a distinct concern (Simulation, Compute, Source, Environment, Scenario, Reporting, Visualization) with clean TypeScript interfaces. V1 implements CPU compute backend, omnidirectional sources, basic environment; V2 swaps in GPU backend, directional antennas, rich environment without refactoring dependents.

**Why Modules Over Flat Lib**: Enforces separation of concerns, makes module boundaries explicit, enables independent testing, simplifies future refactoring (e.g., extracting compute module to Web Worker or GPU backend).

**Why Not Pages Router**: App Router provides better TypeScript support, built-in streaming, and aligns with Next.js 14+ best practices.

**Why Not Separate Frontend/Backend**: No backend needed; all computation is client-side for real-time performance. Reporting module interface defined but not implemented until V2.

## Complexity Tracking

No constitution violations remain after adopting MUI in V1.
