# Tasks: EMF Disturbance and Interference Lab

**Input**: Design documents from `/specs/001-disturbance-lab/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Validation tasks included per spec requirements and constitution gates. Minimal tests focused on physics correctness and visualization quality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify Next.js 14 App Router project structure exists at repository root
- [ ] T002 [P] Install dependencies: react-three-fiber@8.14+, three@0.158+, zustand@4.4+, @react-three/drei@9.88+ in package.json
- [ ] T003 [P] Configure TypeScript strict mode and path aliases in tsconfig.json
- [ ] T004 [P] Setup Jest 29.7+ with React Testing Library and ts-jest in jest.config.js
- [ ] T005 [P] Configure MUI 9.0+ theme provider in app/layout.tsx
- [ ] T006 Create root route redirect to /lab in app/page.tsx and lab route entry point in app/lab/page.tsx

**Checkpoint**: Foundation structure in place, dependencies installed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type System & Data Model

- [ ] T007 [P] Create Vector3 type and common types in app/lab/types/common.types.ts
- [ ] T008 [P] Create EMFSource interface in app/lab/types/source.types.ts (position, frequency, amplitude, phase, antennaType, active, color)
- [ ] T009 [P] Create FieldPoint and SourceContribution interfaces in app/lab/types/field.types.ts
- [ ] T010 [P] Create Environment interface in app/lab/types/environment.types.ts (dimensions, origin, showBounds)
- [ ] T011 [P] Create MeasurementPoint interface in app/lab/types/measurement.types.ts (extends FieldPoint with id, label, visible, showReadout)
- [ ] T012 [P] Create Particle and ParticleCloud interfaces in app/lab/types/visualization.types.ts
- [ ] T013 [P] Create CameraState interface in app/lab/types/camera.types.ts
- [ ] T014 [P] Create VisualizationSettings and AnalysisSettings in app/lab/types/store.types.ts
- [ ] T015 [P] Create PerformanceMetrics interface in app/lab/types/store.types.ts
- [ ] T016 Create barrel export file at app/lab/types/index.ts

### Simulation Engine (Physics Foundation)

- [X] T017 [P] Create SPEED_OF_LIGHT constant and field math helpers in app/lab/lib/field-math.ts (distanceBetween, calculateWavelength, calculateWaveNumber)
- [X] T018 Create SimulationEngine interface in app/lab/modules/simulation/simulation-engine.ts (calculateFieldAtPoint, calculateContributions, calculateFieldBatch, isNearField)
- [X] T019 Implement single source field contribution calculation in app/lab/modules/simulation/simulation-engine.ts (1/r falloff, phase propagation per research.md equations)
- [X] T020 Implement superposition for multiple sources in app/lab/modules/simulation/simulation-engine.ts (complex phasor addition per simulation-api.md)
- [X] T021 Implement near-field classification in app/lab/modules/simulation/simulation-engine.ts (distance < λ/2π check)
- [X] T022 Implement batch field calculation optimization in app/lab/modules/simulation/simulation-engine.ts

### Compute Backend (CPU V1)

- [X] T023 Create ComputeBackend interface in app/lab/modules/compute/compute-backend.interface.ts (type, isAvailable, initialize, dispose, computeField, getMetrics)
- [X] T024 Implement CPUBackend class in app/lab/modules/compute/cpu-backend.ts (superposition calculation, metrics tracking per compute-backend.md)
- [ ] T025 Create GPU backend stub in app/lab/modules/compute/gpu-backend.stub.ts (isAvailable returns false, throws "not implemented" for V1)
- [ ] T026 Create ComputeBackendFactory in app/lab/modules/compute/index.ts (auto-select CPU in V1, fallback logic for V2)

### Validation & Utilities

- [ ] T027 [P] Create parameter validation functions in app/lab/lib/validation.ts (validateSource, validateEnvironment per data-model.md rules)
- [ ] T028 [P] Create color mapping utilities in app/lab/lib/color-mapping.ts (viridisColor, turboColor, perceptually uniform scales)
- [ ] T029 [P] Create performance utilities in app/lab/lib/performance.ts (FPS throttling, debounce for sliders)

### State Management

- [ ] T030 Create Zustand store with LabState interface in app/lab/hooks/useLabStore.ts (sources, environment, measurementPoints, camera, visualization, analysis, performance, actions)
- [ ] T031 Implement source management actions in app/lab/hooks/useLabStore.ts (addSource, removeSource, updateSource, selectSource)
- [ ] T032 Implement measurement point actions in app/lab/hooks/useLabStore.ts (addMeasurementPoint, removeMeasurementPoint)
- [ ] T033 Implement visualization settings actions in app/lab/hooks/useLabStore.ts (updateVisualization, updateEnvironment)

**Checkpoint**: Foundation ready - physics engine works, state management functional, user story implementation can begin

---

## Phase 3: User Story 1 - Observe Single EMF Source (Priority: P1) 🎯 MVP

**Goal**: Student can understand what an electromagnetic field "looks like" around a point source with animated particle visualization

**Independent Test**: Load page, observe default source visualization, adjust frequency/amplitude sliders, see real-time visual updates at 60 FPS target

### Physics Validation (REQUIRED - Constitution Gate III)

- [ ] T034 [P] [US1] Create superposition test in app/lab/modules/simulation/__tests__/superposition.test.ts (two in-phase sources = 2x amplitude at midpoint)
- [ ] T035 [P] [US1] Create destructive interference test in app/lab/modules/simulation/__tests__/superposition.test.ts (two out-of-phase sources = ~0 amplitude)
- [ ] T036 [P] [US1] Create 1/r falloff validation test in app/lab/modules/simulation/__tests__/superposition.test.ts (verify inverse distance relationship)
- [ ] T037 [P] [US1] Create near-field classification test in app/lab/modules/simulation/__tests__/superposition.test.ts (λ/2π boundary accuracy)

### Visualization Quality Validation (REQUIRED - Constitution Gate VI)

- [ ] T038 [P] [US1] Data-ink ratio check in app/lab/__tests__/components/ParticleCloud.test.tsx (verify particle radius 0.05-0.08, halo 2x-3x core, no decorative elements)
- [ ] T039 [P] [US1] Graphical integrity test in app/lab/__tests__/integration/field-rendering.test.ts (field magnitude scales linearly, wavelength inverse to frequency)
- [ ] T040 [P] [US1] Color accessibility test in app/lab/__tests__/lib/color-mapping.test.ts (verify Viridis/Turbo perceptually uniform, WCAG AA compliance)

### Particle System Implementation

- [ ] T041 [P] [US1] Create useParticleSystem hook in app/lab/hooks/useParticleSystem.ts (particle emission, lifetime tracking, update loop)
- [ ] T042 [P] [US1] Create ParticleCloud component in app/lab/components/Canvas3D/ParticleCloud.tsx (InstancedMesh rendering per visualization-api.md)
- [ ] T043 [US1] Implement particle emission cadence in app/lab/hooks/useParticleSystem.ts (emissionRate = baseRate * frequency per research.md)
- [ ] T044 [US1] Implement particle lifetime and aging in app/lab/hooks/useParticleSystem.ts (fade out near end of life)
- [ ] T045 [US1] Implement particle velocity calculation in app/lab/hooks/useParticleSystem.ts (radial outward from source at VISUAL_WAVE_SPEED)
- [ ] T046 [US1] Connect particle brightness to field strength in app/lab/hooks/useParticleSystem.ts (normalize field magnitude to [0, 1])

### 3D Scene Foundation

- [ ] T047 [P] [US1] Create Scene component in app/lab/components/Canvas3D/Scene.tsx (React Three Fiber Canvas, Camera, Lights)
- [ ] T048 [P] [US1] Create EMFSource component in app/lab/components/Canvas3D/EMFSource.tsx (source marker sphere with color, selection highlight)
- [ ] T049 [US1] Integrate OrbitControls in app/lab/components/Canvas3D/Scene.tsx (enableDamping=false, distance constraints per visualization-api.md)
- [ ] T050 [US1] Create EnvironmentBounds component in app/lab/components/Canvas3D/EnvironmentBounds.tsx (line-based room boundaries, Tufte minimal style)

### Control Panel - Single Source

- [ ] T051 [P] [US1] Create ControlPanel layout in app/lab/components/ControlPanel/ControlPanel.tsx (MUI Paper with sections)
- [ ] T052 [P] [US1] Create SourceControls component in app/lab/components/ControlPanel/SourceControls.tsx (frequency, amplitude, phase sliders with validation)
- [ ] T053 [US1] Wire frequency slider to Zustand store in app/lab/components/ControlPanel/SourceControls.tsx (updateSource action, debounced 100ms)
- [ ] T054 [US1] Wire amplitude slider to Zustand store in app/lab/components/ControlPanel/SourceControls.tsx (updateSource action, debounced 100ms)
- [ ] T055 [US1] Wire phase slider to Zustand store in app/lab/components/ControlPanel/SourceControls.tsx (updateSource action, 0-360° range)

### Performance Monitoring

- [ ] T056 [P] [US1] Create usePerformanceMonitor hook in app/lab/hooks/usePerformanceMonitor.ts (FPS tracking via useFrame)
- [ ] T057 [P] [US1] Create PerformanceMonitor component in app/lab/components/shared/PerformanceMonitor.tsx (display FPS, auto-adjust quality if <30 FPS)
- [ ] T058 [US1] Implement quality auto-adjustment in app/lab/hooks/usePerformanceMonitor.ts (High→Medium→Low transitions per visualization-api.md)

### Integration & Error Handling

- [ ] T059 [US1] Create ErrorBoundary component in app/lab/components/shared/ErrorBoundary.tsx (WebGL context loss recovery)
- [ ] T060 [US1] Create AccuracyDisclaimer component in app/lab/components/Analysis/AccuracyDisclaimer.tsx ("Estimated Field Strength", "Simplified Physics Model")
- [ ] T061 [US1] Wire default source to Zustand store initialization in app/lab/hooks/useLabStore.ts (single source at center, 1 Hz, amplitude 50)
- [ ] T062 [US1] Integrate Scene + ControlPanel in app/lab/page.tsx (split layout, responsive)

**Checkpoint**: User Story 1 complete - single source visualization works, real-time parameter control, 60 FPS target

---

## Phase 4: User Story 4 - Navigate 3D Space (Priority: P1)

**Goal**: User can view the EMF field from different angles and distances to understand its three-dimensional structure

**Independent Test**: Orbit camera with mouse drag, zoom with scroll wheel, pan with right-click, reset to default view

**Note**: Grouped with US1 as both are P1 and camera controls are needed for full single-source experience

### Camera Controls

- [ ] T063 [P] [US4] Implement camera state management in app/lab/hooks/useLabStore.ts (position, target, fov, zoom with validation)
- [ ] T064 [P] [US4] Add Reset View button in app/lab/components/ControlPanel/ControlPanel.tsx (restore default camera position)
- [ ] T065 [US4] Configure OrbitControls constraints in app/lab/components/Canvas3D/Scene.tsx (minDistance=5, maxDistance=50, polar angle limits)
- [ ] T066 [US4] Test smooth camera transitions in app/lab/__tests__/integration/camera-controls.test.ts (orbit, zoom, pan responsiveness)

**Checkpoint**: Camera controls complete - intuitive 3D navigation works

---

## Phase 5: User Story 2 - Add Multiple Sources and Observe Interference (Priority: P2)

**Goal**: Physics student can explore constructive and destructive interference between two or more EMF sources

**Independent Test**: Add 2-3 sources, position them, observe interference patterns (fringes visible), adjust phase to shift patterns

### Multi-Source Management

- [ ] T067 [P] [US2] Create SourceList component in app/lab/components/ControlPanel/SourceList.tsx (list of sources with select/remove actions)
- [ ] T068 [P] [US2] Add "Add Source" button in app/lab/components/ControlPanel/ControlPanel.tsx (calls addSource action, max 5 sources per spec)
- [ ] T069 [US2] Implement source selection in app/lab/components/ControlPanel/SourceList.tsx (selectSource action, visual highlight)
- [ ] T070 [US2] Implement default source positioning in app/lab/hooks/useLabStore.ts (spread sources to avoid overlap)
- [ ] T071 [US2] Add source color assignment in app/lab/hooks/useLabStore.ts (cycle through palette for ownership legibility)

### Multi-Source Visualization

- [ ] T072 [US2] Render multiple ParticleCloud instances in app/lab/components/Canvas3D/Scene.tsx (one per active source)
- [ ] T073 [US2] Render multiple EMFSource markers in app/lab/components/Canvas3D/Scene.tsx (color-coded to match particle clouds)
- [ ] T074 [US2] Update field calculation to use all active sources in app/lab/hooks/useParticleSystem.ts (superposition for interference)

### Performance Testing

- [ ] T075 [P] [US2] Create 5-source performance benchmark in app/lab/__tests__/performance/multi-source.test.ts (verify ≥30 FPS with 2000 particles/source)
- [ ] T076 [US2] Test graceful degradation in app/lab/hooks/usePerformanceMonitor.ts (quality adjustment under load, warning if <30 FPS)

**Checkpoint**: Multi-source interference working - visible fringes, performance maintained

---

## Phase 6: User Story 3 - Manipulate Source Parameters (Priority: P2)

**Goal**: User can experiment with different EMF parameters (frequency, amplitude, phase) to understand their effect on field behavior and interference

**Independent Test**: Select any source, adjust parameters, observe real-time visual feedback for each change

**Note**: Most implementation already done in US1/US2; this phase adds refinements

### Parameter Control Refinements

- [ ] T077 [P] [US3] Add frequency presets in app/lab/components/ControlPanel/FrequencyPresets.tsx (common RF bands: WiFi 2.4GHz visual, 5GHz visual, cellular visual)
- [ ] T078 [P] [US3] Add parameter validation with user feedback in app/lab/components/ControlPanel/SourceControls.tsx (show error if out of range, disable invalid values)
- [ ] T079 [US3] Implement parameter change throttling in app/lab/lib/performance.ts (avoid recalc on every slider pixel, debounce 100ms)
- [ ] T080 [US3] Add parameter reset button per source in app/lab/components/ControlPanel/SourceControls.tsx (restore default frequency, amplitude, phase)

### Visual Feedback

- [ ] T081 [US3] Test frequency change visual impact in app/lab/__tests__/integration/parameter-changes.test.ts (tighter spacing, faster cadence at higher frequency)
- [ ] T082 [US3] Test amplitude change visual impact in app/lab/__tests__/integration/parameter-changes.test.ts (brightness/density scales linearly)
- [ ] T083 [US3] Test phase change visual impact in app/lab/__tests__/integration/parameter-changes.test.ts (interference pattern shifts)

**Checkpoint**: Parameter manipulation polished - presets available, validation clear, real-time feedback

---

## Phase 7: User Story 5 - Inspect Field Intensity and Measurement Points (Priority: P2)

**Goal**: User can place measurement points, inspect local field intensity, and compare regions without leaving the main scene

**Independent Test**: Place measurement points in scene, read field strength values, see near/far labels update

### Measurement Point System

- [ ] T084 [P] [US5] Create MeasurementPoint component in app/lab/components/Canvas3D/MeasurementPoint.tsx (sphere marker + floating label with field strength)
- [ ] T085 [P] [US5] Create MeasurementTools component in app/lab/components/ControlPanel/MeasurementTools.tsx (add/remove measurement points, max 5 per spec)
- [ ] T086 [US5] Implement measurement point placement in app/lab/hooks/useLabStore.ts (addMeasurementPoint with position, auto-generate label)
- [ ] T087 [US5] Calculate field strength at measurement points in app/lab/modules/simulation/simulation-engine.ts (use calculateFieldAtPoint for each measurement)
- [ ] T088 [US5] Update measurement readouts in real-time in app/lab/components/Canvas3D/MeasurementPoint.tsx (useFrame to recalculate on source changes)

### Analysis Overlays

- [ ] T089 [P] [US5] Create FieldStrengthDisplay component in app/lab/components/Analysis/FieldStrengthDisplay.tsx (numerical readout with units, rounded to 1 decimal)
- [ ] T090 [P] [US5] Create FieldStrengthOverlay component in app/lab/components/Analysis/FieldStrengthOverlay.tsx (optional color-mapped field visualization)
- [ ] T091 [US5] Add near/far field labels in app/lab/components/Canvas3D/MeasurementPoint.tsx (color or icon change if isNearField=true)
- [ ] T092 [US5] Implement overlay toggle in app/lab/components/ControlPanel/ControlPanel.tsx (showFieldStrengthOverlay, showMeasurementPoints in VisualizationSettings)

### Disclaimers & Communication

- [ ] T093 [US5] Update AccuracyDisclaimer for measurement points in app/lab/components/Analysis/AccuracyDisclaimer.tsx ("Estimated values - simplified model", "Near-field uses far-field approximation in V1")
- [ ] T094 [US5] Add measurement point removal in app/lab/components/Canvas3D/MeasurementPoint.tsx (click to delete, or remove from MeasurementTools)

**Checkpoint**: Measurement system complete - field inspection works, near/far labels visible, disclaimers honest

---

## Phase 8: User Story 6 - Remove and Manage Sources (Priority: P3)

**Goal**: User can remove sources or clear all sources to start a new experiment

**Independent Test**: Add multiple sources, remove individually, clear all, observe visualization updates correctly

### Source Removal

- [ ] T095 [P] [US6] Add "Remove Source" button in app/lab/components/ControlPanel/SourceList.tsx (removeSource action, updates visualization immediately)
- [ ] T096 [P] [US6] Add "Clear All Sources" button in app/lab/components/ControlPanel/ControlPanel.tsx (confirmation prompt if modified, resets to empty state)
- [ ] T097 [US6] Test source removal updates interference in app/lab/__tests__/integration/source-management.test.ts (remaining sources recalculate correctly)
- [ ] T098 [US6] Test particle cloud cleanup in app/lab/components/Canvas3D/ParticleCloud.tsx (dispose Three.js resources on unmount)

**Checkpoint**: Source management complete - removal works, no memory leaks

---

## Phase 9: Scenario Presets & Animation Controls (Cross-Cutting)

**Goal**: Provide curated scenarios for learning and allow animation speed control

**Independent Test**: Apply presets, observe scenario setup, toggle animation mode, adjust speed

### Scenario Presets

- [ ] T099 [P] Create scenario presets data in app/lab/modules/scenario/presets.ts (Clean Vacuum Propagation, Metal Barrier Reflection, Dense Wall Attenuation, Dual Source Interference, Noisy Electronics Environment, Atmospheric Scatter, Medium Transition, Polarization Showcase)
- [ ] T100 [P] Create ScenarioPresets component in app/lab/components/ControlPanel/ScenarioPresets.tsx (dropdown, apply button, confirmation if scene modified)
- [ ] T101 Implement preset application in app/lab/hooks/useLabStore.ts (replace sources + environment, mark as preset-derived)
- [ ] T102 Add preset modification indicator in app/lab/components/ControlPanel/ScenarioPresets.tsx (distinguish modified from original)

### Animation Controls

- [ ] T103 [P] Create VisualizationSettings component in app/lab/components/ControlPanel/VisualizationSettings.tsx (animation mode toggle, speed slider 0.5x-2.0x)
- [ ] T104 Implement animation mode toggle in app/lab/components/Canvas3D/Scene.tsx (animated vs static field view)
- [ ] T105 Implement animation speed scaling in app/lab/hooks/useParticleSystem.ts (scale time delta by animationSpeed, no physics changes)
- [ ] T106 Add animation speed disclaimer in app/lab/components/ControlPanel/VisualizationSettings.tsx ("Animation speed does not change physics")

**Checkpoint**: Presets and animation controls complete - curated scenarios available, animation adjustable

---

## Phase 10: Flow/Curl Cues & Environment Controls (Optional Enhancements)

**Goal**: Add conceptual divergence/curl overlays and environment dimension controls

**Independent Test**: Toggle flow cues, observe Poynting vector arrows, adjust environment size

### Flow/Curl Conceptual Overlays

- [ ] T107 [P] Create FlowCues component in app/lab/components/Canvas3D/FlowCues.tsx (Poynting vector arrows, radially outward from sources, thin lines)
- [ ] T108 [P] Create CurlCues component in app/lab/components/Canvas3D/CurlCues.tsx (small rotating arrows near sources, right-hand rule, "∇ × E (conceptual)" label)
- [ ] T109 Implement flow/curl toggle in app/lab/components/ControlPanel/VisualizationSettings.tsx (showFlowCues, showCurlCues checkboxes)
- [ ] T110 Add flow/curl disclaimer in app/lab/components/Analysis/AccuracyDisclaimer.tsx ("Conceptual overlay - not full Maxwell solver")

### Environment Controls

- [ ] T111 [P] Create EnvironmentControls component in app/lab/components/ControlPanel/EnvironmentControls.tsx (width, length, height sliders, 5m-100m range per spec)
- [ ] T112 Implement environment dimension validation in app/lab/lib/validation.ts (validateEnvironment per data-model.md)
- [ ] T113 Update EnvironmentBounds on dimension change in app/lab/components/Canvas3D/EnvironmentBounds.tsx (responsive to environment state)

**Checkpoint**: Flow/curl cues and environment controls complete - educational overlays available

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final validation

### Testing & Validation

- [ ] T114 [P] Run quickstart.md verification in app/lab/__tests__/integration/quickstart.test.ts (follow onboarding steps, ensure no errors)
- [ ] T115 [P] Create visual regression baseline in app/lab/__tests__/visual/snapshots/ (1 source, 2 sources with interference, measurement points)
- [ ] T116 [P] Performance benchmark all scenarios in app/lab/__tests__/performance/scenarios.test.ts (verify ≥30 FPS floor)

### Accessibility & Design

- [ ] T117 [P] Keyboard accessibility audit in app/lab/components/ (all controls tab-navigable, focus visible, WCAG AA per Constitution IV)
- [ ] T118 [P] MUI theme consistency check in app/lab/components/ (all components use theme tokens, no hardcoded colors)
- [ ] T119 [P] Responsive layout test in app/lab/__tests__/integration/responsive.test.ts (desktop-first per plan.md, mobile deferred to V2)

### Documentation

- [ ] T120 [P] Update README.md with quickstart instructions (link to specs/001-disturbance-lab/quickstart.md)
- [ ] T121 [P] Add JSDoc comments to public APIs in app/lab/modules/ (simulation, compute, visualization interfaces)
- [ ] T122 [P] Create architecture diagram in specs/001-disturbance-lab/ (module boundaries, data flow)

### Code Quality

- [ ] T123 Run type-check and fix all TypeScript errors (npm run type-check)
- [ ] T124 Run lint and fix all ESLint warnings (npm run lint)
- [ ] T125 Run full test suite and ensure 100% pass rate (npm test)
- [ ] T126 Verify no console errors in browser with 5 sources active

**Checkpoint**: All polish complete - ready for demo/deploy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - **US1 + US4 (Phases 3-4)**: Can start after Foundational - NO dependencies on other stories (MVP!)
  - **US2 (Phase 5)**: Depends on US1 (needs ParticleCloud component, SourceControls)
  - **US3 (Phase 6)**: Depends on US1 + US2 (enhances existing controls)
  - **US5 (Phase 7)**: Depends on US1 (needs Scene, field calculation)
  - **US6 (Phase 8)**: Depends on US2 (needs SourceList)
- **Enhancements (Phases 9-10)**: Depend on US1-US5 completion
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup (Phase 1) → Foundational (Phase 2) → ┬→ US1 + US4 (MVP) → US2 → US3
                                           ├→ US5 (parallel to US2/US3)
                                           └→ (US1 complete) → US6
```

**MVP Path**: Setup → Foundational → US1 + US4 → Validation → STOP (deliverable single-source visualizer)

**Full V1 Path**: MVP → US2 → US3 → US5 → US6 → Presets → Flow/Curl → Polish

### Within Each User Story

- Tests (validation tasks) BEFORE implementation (TDD where specified)
- Types before modules
- Modules before components
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 2 Foundational (can run in parallel within phase)**:
- T007-T016: All type definitions (16 files, different paths)
- T017, T027, T028, T029: Utility libraries (field-math, validation, color-mapping, performance)
- T023-T026: Compute backend (interface + CPU + GPU stub + factory)

**Phase 3 US1 (can run in parallel within phase)**:
- T034-T037: Physics validation tests (4 test files)
- T038-T040: Visualization quality tests (3 test files)
- T041-T042: Particle system (hook + component, different files)
- T047-T048: Scene foundation (Scene.tsx + EMFSource.tsx)
- T051-T052: Control panel (ControlPanel.tsx + SourceControls.tsx)
- T056-T057: Performance monitoring (hook + component)
- T059-T060: Error handling (ErrorBoundary + AccuracyDisclaimer)

**Phase 4 US4 (can run in parallel with US1 tasks T063-T066)**:
- T063-T064: Camera state + Reset button (different files)

**Phase 5 US2 (can run in parallel within phase)**:
- T067-T068: SourceList + Add button (different files)
- T075: Performance benchmark (test file, no implementation dependencies)

**Phase 6 US3 (can run in parallel within phase)**:
- T077-T078: Presets + validation (different files)

**Phase 7 US5 (can run in parallel within phase)**:
- T084-T085: MeasurementPoint component + MeasurementTools (different files)
- T089-T090: FieldStrengthDisplay + FieldStrengthOverlay (different files)

**Phase 8 US6 (can run in parallel within phase)**:
- T095-T096: Remove button + Clear All button (different components)

**Phase 11 Polish (can run in parallel within phase)**:
- T114-T116: All testing tasks
- T117-T119: All accessibility/design tasks
- T120-T122: All documentation tasks

---

## Parallel Example: User Story 1 (MVP Core)

```bash
# After Foundational phase completes, launch US1 in parallel batches:

# Batch 1 - Tests (write first, ensure they FAIL):
Task T034: "Superposition test"
Task T035: "Destructive interference test"
Task T036: "1/r falloff test"
Task T037: "Near-field classification test"
Task T038: "Data-ink ratio check"
Task T039: "Graphical integrity test"
Task T040: "Color accessibility test"

# Batch 2 - Core modules (after tests written):
Task T041: "useParticleSystem hook"
Task T042: "ParticleCloud component"
Task T047: "Scene component"
Task T048: "EMFSource component"
Task T051: "ControlPanel layout"
Task T052: "SourceControls component"
Task T056: "usePerformanceMonitor hook"
Task T057: "PerformanceMonitor component"
Task T059: "ErrorBoundary"
Task T060: "AccuracyDisclaimer"

# Batch 3 - Integration (sequential after Batch 2):
Task T043: "Particle emission cadence"
Task T044: "Particle lifetime"
Task T045: "Particle velocity"
Task T046: "Particle brightness"
Task T049: "OrbitControls integration"
Task T050: "EnvironmentBounds"
Task T053-T055: "Wire sliders to store"
Task T058: "Quality auto-adjustment"
Task T061-T062: "Final integration"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 4 Only)

**Phases 1-2-3-4 deliver a complete, shippable product**:

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T033) → **Foundation ready**
3. Complete Phase 3: User Story 1 (T034-T062) → **Single source works**
4. Complete Phase 4: User Story 4 (T063-T066) → **3D navigation works**
5. **STOP and VALIDATE**: Run tests, demo to stakeholders
6. Deploy as "EMF Field Visualizer V1.0-MVP"

**MVP Value**: Standalone educational tool for understanding single EMF source behavior with particle visualization

### Incremental Delivery (Add Stories Sequentially)

**After MVP, add stories in priority order**:

1. MVP (US1 + US4) → Test independently → Deploy
2. Add Phase 5: US2 (Multi-source interference) → Test independently → Deploy V1.1
3. Add Phase 6: US3 (Parameter presets) → Test independently → Deploy V1.2
4. Add Phase 7: US5 (Measurement points) → Test independently → Deploy V1.3
5. Add Phase 8: US6 (Source removal) → Test independently → Deploy V1.4
6. Add Phases 9-10: Presets + Flow/Curl → Test → Deploy V1.5
7. Add Phase 11: Polish → Final validation → Deploy V1.6 (Feature Complete)

**Each version adds value without breaking previous stories**

### Parallel Team Strategy

**With 3+ developers after Foundational phase completes**:

1. Team completes Setup + Foundational together (2-3 days)
2. Once Phase 2 done:
   - **Developer A**: User Story 1 (T034-T062) - Core visualization
   - **Developer B**: User Story 4 (T063-T066) + User Story 5 (T084-T094) - Controls & measurement
   - **Developer C**: User Story 2 (T067-T076) - Multi-source
3. Stories integrate independently, merge as ready
4. All developers: Polish phase (T114-T126) together

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **[Story] label** maps task to specific user story for traceability (US1-US6)
- Each user story should be independently completable and testable
- **Tests written FIRST** for physics and visualization quality (Constitution Gates III & VI)
- **Validation rules** from data-model.md enforced in T027-T028
- **Performance targets**: 60 FPS goal, 30 FPS floor (per spec FR-045, FR-046)
- **Tufte principles**: Enforced in T038 (data-ink ratio), T039 (graphical integrity), T050 (minimal environment bounds)
- **Commit after each task** or logical group of parallel tasks
- **Stop at any checkpoint** to validate story independently before proceeding

---

## Task Count Summary

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 27 tasks (T007-T033)
- **Phase 3 (US1)**: 29 tasks (T034-T062)
- **Phase 4 (US4)**: 4 tasks (T063-T066)
- **Phase 5 (US2)**: 10 tasks (T067-T076)
- **Phase 6 (US3)**: 7 tasks (T077-T083)
- **Phase 7 (US5)**: 11 tasks (T084-T094)
- **Phase 8 (US6)**: 4 tasks (T095-T098)
- **Phase 9 (Presets/Animation)**: 8 tasks (T099-T106)
- **Phase 10 (Flow/Curl/Environment)**: 7 tasks (T107-T113)
- **Phase 11 (Polish)**: 13 tasks (T114-T126)

**Total**: 126 tasks

**Per User Story**:
- US1: 29 tasks (MVP core)
- US4: 4 tasks (MVP navigation)
- US2: 10 tasks (Interference)
- US3: 7 tasks (Parameter control)
- US5: 11 tasks (Measurement)
- US6: 4 tasks (Source removal)
- Setup/Foundational: 33 tasks (shared)
- Cross-cutting: 28 tasks (presets, flow/curl, polish)

**MVP Scope (US1 + US4)**: 33 foundation + 33 MVP tasks = **66 tasks** to first deliverable

**Parallel Opportunities**: 47 tasks marked [P] can run simultaneously (different files, no blocking dependencies)

---

**Tasks.md Complete** ✅  
**Generated**: 2025-06-09  
**Feature**: EMF Disturbance and Interference Lab  
**Path**: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/001-disturbance-lab/tasks.md`
