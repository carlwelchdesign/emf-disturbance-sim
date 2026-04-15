# Implementation Plan: EMF Disturbance and Interference Lab

**Branch**: `002-disturbance-lab` | **Date**: 2025-06-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-disturbance-lab/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a polished, single-page EMF/RF visualization lab using React + TypeScript + Next.js App Router, React Three Fiber, and Three.js. The lab provides a **physically inspired, Tufte-style visualization** with truthful low-clutter particle-cloud EMF rendering, flow/curl conceptual cues, and browser-performant real-time field simulation. Users can add/remove RF sources, manipulate parameters (frequency, power, phase, position), observe interference patterns, and analyze field strength at measurement points. The V1 MVP focuses on motion-first particle/wavefront visualization with CPU-based computation (3-5 sources at 30-60 FPS), clear separation of physics math from visual effects, honest communication of model limitations, and a clean module architecture that extends naturally toward GPU acceleration, advanced Maxwell-inspired behavior, and professional EN 62232 reporting in V2.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 18.2+, Next.js 14 (App Router)  
**Primary Dependencies**: React Three Fiber 8.14+, Three.js 0.158+, Zustand 4.4+ (state), MUI 9.0+ (design system), @react-three/drei 9.88+ (3D helpers)  
**Storage**: N/A (client-side only, local state in memory; V1.5 may add localStorage)  
**Testing**: Jest 29.7+ with React Testing Library, ts-jest for unit/integration tests  
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge) with WebGL 2.0 support  
**Project Type**: Web application (single-page interactive 3D visualization lab)  
**Performance Goals**: 60 FPS target with 30 FPS floor for 3-5 sources (V1 CPU-based), < 100ms parameter update latency, < 2s initial render  
**Constraints**: Client-side only (no backend), CPU-based field computation in V1 (GPU deferred to V2), WebGL dependency, desktop-first (mobile responsive in V2)  
**Scale/Scope**: Single-user sessions, 3-5 simultaneous RF sources (V1), ~10-15 React components, 6-8 feature modules, particle-cloud visualization with 1000s of particles per source

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Feature-Boundary Architecture ✅ PASS

**Status**: Clean module boundaries already established in `app/lab/modules/` with explicit separation: simulation, compute, source, environment, scenario, visualization, reporting. Route handlers remain minimal (existing `app/page.tsx` delegates to lab component). Business logic lives in feature modules, not handlers.

**Risk**: None. Architecture already aligns with constitutional requirements.

### Principle II: Dependency Inversion and SOLID Delivery ✅ PASS

**Status**: 
- Compute module already uses strategy pattern (`compute-backend.interface.ts`, `cpu-backend.ts`) for V1/V2 swappability
- Simulation engine operates independently of rendering (headless-testable)
- Components render only; hooks manage state; services execute business operations
- Each module has single responsibility (source=antenna models, simulation=field math, visualization=rendering)

**Risk**: None. SOLID boundaries are enforced and testable.

### Principle III: Test and Validation Gates ✅ CONDITIONAL

**Status**: Test structure exists (`app/lab/__tests__/` with integration, components, hooks, lib, performance, modules). Must validate:
- Wave mathematics: E ⟂ B verification, phase relationships, superposition correctness
- Rendering quality: particle-cloud visual accuracy, interference pattern visibility
- Component tests: state updates, parameter changes trigger correct re-renders
- Zero type/lint/syntax errors before merge

**Risk**: LOW. Requires implementation of specific physics validation tests (superposition, phase coherence) as part of Phase 1 deliverables.

**Gate**: Before merge, run `npm run type-check && npm run lint && npm test` with physics validation suite passing.

### Principle IV: Design System and Accessibility Compliance ✅ PASS

**Status**: MUI 9.0 design system already integrated (`package.json`). Theme tokens available (`app/lab/theme/`). All UI must use MUI components, theme tokens, responsive breakpoints. Keyboard access, focus visibility, WCAG AA contrast required for controls.

**Risk**: None. Design system infrastructure in place; must enforce during component implementation.

### Principle V: Observable, Safe Operations ✅ CONDITIONAL

**Status**: Must instrument:
- Animation frame rates (FPS monitoring)
- Parameter change latency (< 100ms target)
- Edge case handling (zero wavelength, div-by-zero in field calculations)
- WebGL context loss recovery
- Immutable state (Zustand already supports this)
- Graceful degradation for invalid parameters

**Risk**: LOW. Requires performance monitoring implementation and edge case validation tests.

**Gate**: Must include FPS display, error boundaries for WebGL failures, and parameter validation before merge.

### Principle VI: Visualization Quality and Graphical Integrity ✅ PASS

**Status**: Spec explicitly mandates:
- Tufte-style data-ink ratio: "truthful low-clutter particle-cloud EMF rendering"
- Minimize non-data ink: "flow/curl cues" for physics, no chartjunk
- Graphical integrity: "field magnitude scales linearly, wavelength matches frequency inverse, phase relationships preserved"
- Honest disclaimers: "Estimated Field Strength", "Simplified Physics Model"
- Perceptually uniform color maps required

**Risk**: None. Constitution Principle VI aligns perfectly with user's Tufte-style requirement and spec FR-036 to FR-040.

---

### Summary

**ALL GATES: PASS** (2 conditional gates require specific implementation deliverables, already captured in plan).

**Re-check After Phase 1**: Confirm data model and contracts maintain module boundaries, SOLID structure, and graphical integrity requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-disturbance-lab/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: physics equations, rendering approach
├── data-model.md        # Phase 1 output: typed entities, field calculation model
├── quickstart.md        # Phase 1 output: developer onboarding, architecture tour
└── contracts/           # Phase 1 output: simulation API contracts
    ├── simulation-api.md      # Field calculation interface
    ├── compute-backend.md     # CPU/GPU compute abstraction
    └── visualization-api.md   # Three.js rendering interface
```

### Source Code (repository root)

```text
emf-visualizer/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with MUI theme provider
│   ├── page.tsx                  # Root route (redirects to /lab)
│   └── lab/                      # EMF lab feature
│       ├── page.tsx              # Lab route entry (renders LabContainer)
│       ├── types/                # TypeScript types
│       │   ├── source.types.ts
│       │   ├── field.types.ts
│       │   ├── environment.types.ts
│       │   ├── visualization.types.ts
│       │   ├── measurement.types.ts
│       │   ├── camera.types.ts
│       │   ├── store.types.ts
│       │   ├── common.types.ts
│       │   └── index.ts
│       ├── components/           # React UI components
│       │   ├── ControlPanel/
│       │   │   ├── ControlPanel.tsx
│       │   │   ├── SourceControls.tsx
│       │   │   ├── SourceList.tsx
│       │   │   ├── VisualizationSettings.tsx
│       │   │   ├── EnvironmentControls.tsx
│       │   │   ├── FrequencyPresets.tsx
│       │   │   ├── MeasurementTools.tsx
│       │   │   └── ScenarioPresets.tsx
│       │   ├── Canvas3D/
│       │   │   ├── Scene.tsx              # R3F Canvas + Camera
│       │   │   ├── EMFSource.tsx          # 3D source visualization
│       │   │   ├── ParticleCloud.tsx      # Particle system per source
│       │   │   ├── EnvironmentBounds.tsx  # Room/space boundaries
│       │   │   └── MeasurementPoint.tsx   # 3D measurement marker
│       │   ├── Analysis/
│       │   │   ├── FieldStrengthDisplay.tsx
│       │   │   ├── FieldStrengthOverlay.tsx
│       │   │   └── AccuracyDisclaimer.tsx
│       │   └── shared/
│       │       ├── PerformanceMonitor.tsx  # FPS display
│       │       └── ErrorBoundary.tsx       # WebGL failure recovery
│       ├── hooks/                # React hooks
│       │   ├── useLabStore.ts            # Zustand state management
│       │   ├── useFieldCalculation.ts    # Field computation hook
│       │   ├── useParticleSystem.ts      # Particle animation logic
│       │   └── usePerformanceMonitor.ts  # FPS tracking
│       ├── modules/              # Business logic modules (SOLID boundaries)
│       │   ├── simulation/
│       │   │   ├── simulation-engine.ts       # Core field calculator
│       │   │   ├── types.ts                   # Simulation types
│       │   │   └── __tests__/
│       │   │       └── superposition.test.ts  # Physics validation
│       │   ├── compute/
│       │   │   ├── compute-backend.interface.ts  # Strategy interface
│       │   │   ├── cpu-backend.ts                # V1 CPU implementation
│       │   │   └── gpu-backend.stub.ts           # V2 GPU stub
│       │   ├── source/
│       │   │   ├── types.ts
│       │   │   └── antenna-patterns.ts    # Omnidirectional (V1), beam steering (V2)
│       │   ├── environment/
│       │   │   └── types.ts               # Room dimensions, materials
│       │   ├── scenario/
│       │   │   └── presets.ts             # Curated EMF scenarios
│       │   ├── visualization/
│       │   │   └── types.ts               # Rendering config, color maps
│       │   └── reporting/
│       │       └── types.ts               # V2 EN 62232 stub
│       ├── lib/                  # Shared utilities
│       │   ├── color-mapping.ts          # Perceptually uniform color scales
│       │   ├── field-math.ts             # Superposition, phase, distance
│       │   ├── validation.ts             # Parameter bounds checking
│       │   └── performance.ts            # FPS throttling, debounce
│       ├── theme/
│       │   └── index.ts                  # MUI theme tokens
│       └── __tests__/
│           ├── integration/              # Cross-module tests
│           ├── components/               # UI component tests
│           ├── hooks/                    # Hook tests
│           ├── lib/                      # Utility tests
│           ├── modules/                  # Module tests (physics, compute)
│           └── performance/              # FPS benchmarks
├── public/                       # Static assets (if needed)
├── specs/                        # Feature documentation
├── .specify/                     # Spec Kit templates, scripts, memory
├── package.json
├── tsconfig.json
├── jest.config.js
├── jest.setup.js
├── next.config.js
└── README.md
```

**Structure Decision**: Single Next.js App Router application with feature-oriented module architecture. All EMF lab code lives under `app/lab/` with clear separation: `modules/` for business logic (physics, compute, scenarios), `components/` for UI (no logic), `hooks/` for state/effects, `lib/` for shared utilities. This preserves feature boundaries (Principle I), enables SOLID module swapping (Principle II), and keeps tests co-located with implementation. The existing structure in the repository already follows this pattern, so no restructuring is required.

## Complexity Tracking

> **No violations to justify**

All constitutional principles pass without requiring complexity exceptions. The existing architecture already enforces feature boundaries, SOLID design, test requirements, design system compliance, observable operations, and graphical integrity. No additional projects, repositories, or architectural complexity is needed beyond the existing `app/lab/modules/` structure.

---

## Phase 1 Re-Evaluation: Constitution Check (Post-Design)

*Re-checked after completing data-model.md, contracts/, and quickstart.md*

### Principle I: Feature-Boundary Architecture ✅ CONFIRMED

**Post-Design Status**: All contracts maintain clean module boundaries. No cross-module dependencies detected. Data model entities map 1:1 to module responsibilities. Architecture remains aligned with constitution.

### Principle II: Dependency Inversion and SOLID Delivery ✅ CONFIRMED

**Post-Design Status**: Contracts document interface-based design:
- `SimulationEngine` interface (simulation-api.md) enables headless testing
- `ComputeBackend` interface (compute-backend.md) supports CPU↔GPU swap without changing callers
- `ParticleCloudRenderer` interface (visualization-api.md) separates physics from rendering
- All SOLID principles maintained in design phase

### Principle III: Test and Validation Gates ✅ CONFIRMED

**Post-Design Status**: Contracts specify testability requirements:
- Superposition correctness tests (2x amplitude for in-phase, ~0 for out-of-phase)
- 1/r falloff validation
- Near-field classification accuracy
- FPS performance benchmarks (>= 30 FPS for 5 sources)
- All tests specified before implementation (TDD-ready)

### Principle IV: Design System and Accessibility Compliance ✅ CONFIRMED

**Post-Design Status**: Data model includes `VisualizationSettings` with MUI theme integration. All UI components use theme tokens (no hardcoded colors). Keyboard navigation, WCAG AA contrast enforced in quickstart guide.

### Principle V: Observable, Safe Operations ✅ CONFIRMED

**Post-Design Status**: Data model includes `PerformanceMetrics` entity for FPS tracking, `ValidationResult` for parameter safety, and graceful quality degradation (High→Medium→Low). All edge cases (zero frequency, div-by-zero) have validation rules.

### Principle VI: Visualization Quality and Graphical Integrity ✅ CONFIRMED

**Post-Design Status**: Research.md explicitly enforces Tufte principles:
- Particle radius constrained to [0.05, 0.08] (small dots, not streaks)
- Halo intensity bounded [0.6, 1.5] (restrained glow)
- Perceptually uniform color scales (Viridis, Turbo)
- No decorative grids, shadows, or chartjunk
- Field strength maps linearly to brightness/density
- Disclaimers required ("Estimated", "Simplified Model")

---

### Final Constitution Verdict: ✅ ALL GATES PASS

**Summary**: Phase 1 design maintains all constitutional principles. Data model, contracts, and architecture support V1 delivery without violations. V2 extension points preserve upgrade path without breaking SOLID boundaries.

---

## Deliverables Summary

### Phase 0: Research ✅
- **research.md**: Physics equations (superposition, 1/r falloff), rendering strategy (Tufte particle-cloud), performance targets, architecture decisions

### Phase 1: Design & Contracts ✅
- **data-model.md**: Typed entities (EMFSource, Environment, FieldPoint, MeasurementPoint, Particle, ParticleCloud), state management (LabState, VisualizationSettings, PerformanceMetrics), validation rules, state transitions
- **contracts/simulation-api.md**: SimulationEngine interface, superposition implementation, physics equations, testing requirements
- **contracts/compute-backend.md**: ComputeBackend strategy pattern, CPU implementation, GPU stub (V2), factory for auto-selection
- **contracts/visualization-api.md**: ParticleCloudRenderer interface, R3F component contracts, frame-update loop, Tufte rendering guidelines
- **quickstart.md**: Developer onboarding, architecture tour, common tasks, testing strategy
- **Agent Context Update**: GitHub Copilot context file updated with TypeScript, React Three Fiber, and EMF lab technology stack

---

## Next Steps (Post-Planning)

### Immediate Actions
1. **Review plan.md** with team for architecture approval
2. **Run `/speckit.tasks`** to generate implementation tasks from plan artifacts
3. **Set up development environment** (Node 20+, install dependencies)
4. **Run initial tests** (`npm run type-check && npm run lint && npm test`) to establish baseline

### Implementation Readiness Checklist
- ✅ Requirements documented (spec.md)
- ✅ Research complete (equations, rendering approach)
- ✅ Data model defined (entities, validation)
- ✅ Contracts written (module interfaces)
- ✅ Quickstart guide ready (developer onboarding)
- ✅ Constitution gates passed
- ⬜ Tasks generated (run `/speckit.tasks`)
- ⬜ First task assigned

---

## Appendix: Key Decisions Log

| Decision | Rationale | Alternative Rejected |
|----------|-----------|---------------------|
| **Physics**: Superposition + 1/r falloff | Real-time performance, educational accuracy | Full Maxwell FDTD (too slow) |
| **Rendering**: Tufte particle-cloud | Data-ink ratio, truthful visualization | Heatmap-only (static), decorative effects |
| **Compute**: CPU V1, GPU-ready interface | V1 simplicity, V2 extensibility | WASM (marginal gain), premature GPU |
| **State**: Zustand client-side only | Single-user, no persistence needed | Redux (overkill), server state (out of scope) |
| **Testing**: Jest + RTL | Next.js standard, React expertise | Vitest (less mature), Cypress (E2E deferred) |
| **Architecture**: 8 modules, SOLID | Testability, V2 scalability | Monolithic (hard to test), over-engineered layers |

---

**Implementation Plan Complete** ✅  
**Branch**: `002-disturbance-lab`  
**Plan Path**: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/001-disturbance-lab/plan.md`  
**Generated Artifacts**:
- `research.md` (Phase 0)
- `data-model.md` (Phase 1)
- `contracts/simulation-api.md` (Phase 1)
- `contracts/compute-backend.md` (Phase 1)
- `contracts/visualization-api.md` (Phase 1)
- `quickstart.md` (Phase 1)
- Agent context updated (GitHub Copilot)

**Status**: Ready for task generation (`/speckit.tasks`)
