# Tasks: EMF Disturbance and Interference Lab

**Input**: Design documents from `/specs/001-disturbance-lab/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Included because the feature spec defines testing and validation expectations.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router feature code lives in `app/lab/`
- Shared lab types, hooks, and helpers already exist under `app/lab/`
- New feature modules can be added under `app/lab/modules/` when the story needs a clean boundary

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the feature shell and visual language with the subtle dot-field direction.

- [ ] T001 [P] Finalize the single-page lab shell in `app/lab/page.tsx` and `app/lab/layout.tsx` so the canvas, control panel, and analysis overlays mount in the intended order
- [ ] T002 [P] Refresh the dark HUD theme tokens and spacing in `app/lab/theme/theme.ts` and `app/lab/theme/ThemeProvider.tsx` for the restrained Jarvis-like aesthetic
- [ ] T003 [P] Tighten the shared fallback and performance surfaces in `app/lab/components/shared/WebGLErrorBoundary.tsx`, `app/lab/components/shared/PerformanceWarning.tsx`, and `app/lab/components/shared/FPSMonitor.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core math, state, and mapping utilities that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement pure EMF and visualization helpers in `app/lab/lib/field-math.ts`, `app/lab/lib/math-utils.ts`, and `app/lab/modules/compute/cpu-backend.ts` for plane waves, superposition, attenuation, reflection, noise, point-source falloff, and conceptual divergence/curl cues
- [ ] [P] T005 Extend the core lab types in `app/lab/types/source.types.ts`, `app/lab/types/environment.types.ts`, `app/lab/types/measurement.types.ts`, `app/lab/types/camera.types.ts`, `app/lab/types/visualization.types.ts`, `app/lab/types/field.types.ts`, and `app/lab/types/store.types.ts`
- [ ] [P] T006 Expand the Zustand store in `app/lab/hooks/useLabStore.ts` to manage source selection, disturbance regions, scenario application, measurement points, animation mode/speed, and performance state
- [ ] T007 Add validation and clamping helpers in `app/lab/lib/validation.ts` and `app/lab/lib/source-helpers.ts` for source limits, parameter bounds, disturbance regions, and preset application
- [ ] [P] T008 Add shared rendering helpers in `app/lab/lib/visualization-helpers.ts` and `app/lab/lib/camera-helpers.ts` for color mapping, cadence labels, near/far labels, and intensity formatting
- [x] T009 Add scenario preset catalog and application helpers in `app/lab/modules/scenario/presets.ts` and `app/lab/modules/simulation/simulation-engine.ts` so V1 can switch between curated examples and free-play
- [ ] T010 Add environment boundary rendering, dimension controls, and static/animated propagation toggle wiring in `app/lab/components/Canvas3D/EnvironmentBoundary.tsx`, `app/lab/components/ControlPanel/EnvironmentControls.tsx`, `app/lab/components/ControlPanel/VisualizationSettings.tsx`, and `app/lab/hooks/useLabStore.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Observe Single EMF Source (Priority: P1) 🎯 MVP

**Goal**: Load the lab and see a single source rendered as calm, readable dot particles with local glow and subtle motion.

**Independent Test**: Open the lab, verify one emitter is visible, confirm the particles are small dots instead of ray lines, and adjust amplitude/frequency/phase while the motion stays smooth and readable.

### Tests for User Story 1

- [ ] [P] [US1] Add unit coverage for the core EMF helpers in `app/lab/__tests__/lib/field-math.test.ts`
- [ ] [P] [US1] Add single-source render coverage in `app/lab/__tests__/components/Canvas3D/FieldVisualization.test.tsx`
- [ ] [P] [US1] Add source-control feedback coverage in `app/lab/__tests__/components/SourceControls.test.tsx`

### Implementation for User Story 1

- [ ] [P] [US1] Implement the source emission-to-particle mapping in `app/lab/modules/simulation/simulation-engine.ts`
- [ ] [US1] Replace any remaining ray-line feel with the subtle dot/halo visualization in `app/lab/components/Canvas3D/FieldVisualization.tsx`
- [ ] [US1] Make the source core and marker respond to frequency, power, and phase in `app/lab/components/Canvas3D/SourceMarker.tsx`
- [ ] [US1] Wire the default source and baseline scene into `app/lab/page.tsx` and `app/lab/hooks/useLabStore.ts`
- [ ] [US1] Add motion-first overlay copy and simplified-model disclaimers in `app/lab/components/Analysis/AccuracyDisclaimer.tsx` and `app/lab/components/Analysis/FieldStrengthOverlay.tsx`

**Checkpoint**: User Story 1 should now be fully functional and independently testable

---

## Phase 4: User Story 4 - Navigate 3D Space (Priority: P1)

**Goal**: Orbit, pan, zoom, and reset the camera while the particle field stays readable.

**Independent Test**: Load the lab, orbit and zoom the scene, pan the view, then hit Reset View and confirm the camera returns cleanly without breaking particle motion.

### Tests for User Story 4

- [ ] [P] [US4] Add camera control math coverage in `app/lab/__tests__/hooks/useCameraControls.test.ts`
- [ ] [P] [US4] Add camera helper coverage in `app/lab/__tests__/lib/camera-helpers.test.ts`

### Implementation for User Story 4

- [ ] [US4] Extend `app/lab/hooks/useCameraControls.ts` and `app/lab/components/Canvas3D/CameraControls.tsx` to support orbit, pan, zoom, reset, and subtle guide feedback
- [ ] [US4] Connect camera state and reset affordances through `app/lab/types/camera.types.ts`, `app/lab/hooks/useLabStore.ts`, and `app/lab/components/ControlPanel/ControlPanel.tsx`

**Checkpoint**: User Story 4 should now be independently functional and testable

---

## Phase 5: User Story 2 - Add Multiple Sources and Observe Interference (Priority: P2)

**Goal**: Add additional sources and show constructive/destructive interference as a calm, readable field interaction.

**Independent Test**: Add 2-3 sources, position them apart and together, and verify the overlap visibly changes brightness, density, and phase feel without turning into streaks.

### Tests for User Story 2

- [ ] [P] [US2] Add multi-source interference coverage in `app/lab/__tests__/modules/field-interference.test.ts`
- [ ] [P] [US2] Add scenario/preset application coverage in `app/lab/__tests__/components/ControlPanel/FrequencyPresets.test.tsx`

### Implementation for User Story 2

- [ ] [P] [US2] Implement interference and source-overlap calculations in `app/lab/modules/compute/cpu-backend.ts` and `app/lab/modules/simulation/simulation-engine.ts`
- [ ] [US2] Build the curated scenario and preset UI in `app/lab/components/ControlPanel/FrequencyPresets.tsx` and `app/lab/components/ControlPanel/SourceList.tsx`
- [ ] [US2] Update `app/lab/components/Canvas3D/FieldVisualization.tsx` and `app/lab/components/Analysis/FieldStrengthDisplay.tsx` for overlap brightness, constructive/destructive cues, and source ownership

**Checkpoint**: User Story 2 should now be independently functional

---

## Phase 6: User Story 3 - Manipulate Source Parameters (Priority: P2)

**Goal**: Edit frequency, amplitude, phase, and position while the lab updates in real time.

**Independent Test**: Select any source, adjust its parameters, and confirm the visual response tracks the edited source without affecting unrelated sources.

### Tests for User Story 3

- [ ] [P] [US3] Add source-parameter editing coverage in `app/lab/__tests__/components/SourceControls.test.tsx`
- [ ] [P] [US3] Add input and slider coverage in `app/lab/__tests__/components/Slider.test.tsx`

### Implementation for User Story 3

- [ ] [US3] Implement source parameter editors and direct-manipulation feedback in `app/lab/components/ControlPanel/SourceControls.tsx`, `app/lab/components/ControlPanel/VisualizationSettings.tsx`, and `app/lab/components/Canvas3D/SourceMarker.tsx`
- [ ] [US3] Enforce keyboard-entry, bounds, and selected-source update flows in `app/lab/hooks/useLabStore.ts` and `app/lab/lib/validation.ts`

**Checkpoint**: User Story 3 should now be independently functional

---

## Phase 7: User Story 5 - Inspect Field Intensity and Measurement Points (Priority: P2)

**Goal**: Place measurement points, inspect local field intensity, and compare regions without leaving the scene.

**Independent Test**: Place one or more measurement points, read the displayed field strength, and confirm the near/far labels update as the camera or sources change.

### Tests for User Story 5

- [ ] [P] [US5] Add measurement-point coverage in `app/lab/__tests__/components/MeasurementPoint.test.tsx`
- [ ] [P] [US5] Add overlay/disclaimer coverage in `app/lab/__tests__/components/AccuracyDisclaimer.test.tsx`

### Implementation for User Story 5

- [ ] [US5] Implement measurement point placement and derived field readouts in `app/lab/components/ControlPanel/MeasurementTools.tsx`, `app/lab/components/Canvas3D/MeasurementPoint.tsx`, and `app/lab/modules/simulation/simulation-engine.ts`
- [ ] [US5] Update `app/lab/components/Analysis/MeasurementList.tsx`, `app/lab/components/Analysis/FieldStrengthOverlay.tsx`, and `app/lab/components/Analysis/FieldStrengthDisplay.tsx` to show estimated intensity, near/far context, and simplified-model disclaimers
- [ ] [US5] Wire measurement state into `app/lab/hooks/useLabStore.ts` and `app/lab/types/measurement.types.ts` for add/update/remove/clear flows

**Checkpoint**: User Story 5 should now be independently testable

---

## Phase 8: User Story 6 - Remove and Manage Sources (Priority: P3)

**Goal**: Remove sources or clear the scene to restart an experiment cleanly.

**Independent Test**: Add multiple sources, remove them individually or all at once, and confirm the visualization and control panel both return to a clean state without errors.

### Tests for User Story 6

- [ ] [P] [US6] Add source removal and clear-all coverage in `app/lab/__tests__/hooks/useLabStore.test.ts`
- [ ] [P] [US6] Add control-panel cleanup coverage in `app/lab/__tests__/components/ControlPanel/ControlPanel.test.tsx`

### Implementation for User Story 6

- [ ] [US6] Finish source removal, clear-all confirmation, and selection cleanup in `app/lab/components/ControlPanel/ControlPanel.tsx`, `app/lab/components/ControlPanel/SourceList.tsx`, and `app/lab/hooks/useLabStore.ts`
- [ ] [US6] Ensure empty-state and recovery flows return the scene to a clean baseline in `app/lab/page.tsx` and `app/lab/components/Analysis/AccuracyDisclaimer.tsx`

**Checkpoint**: User Story 6 should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] [P] Tighten motion, microcopy, and accessibility across `app/lab/components/Analysis/*.tsx` and `app/lab/components/shared/*.tsx`
- [ ] [P] Run the quickstart validation path and fix any remaining issues in `Makefile`, `app/lab/__tests__/**`, and the lab feature files
- [ ] [P] Review the V1 divergence/curl overlay language across `app/lab/components/Analysis/AccuracyDisclaimer.tsx`, `app/lab/components/Analysis/FieldStrengthOverlay.tsx`, and `specs/001-disturbance-lab/spec.md` for consistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel if staffing allows
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Uses the same shared camera foundation
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on the single-source renderer
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 and US2 but stays independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Uses the shared measurement model
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Cleans up source state only

### Within Each User Story

- Tests MUST be written and fail before implementation when included
- Models and state types before services and renderers
- Services before UI wiring
- Core implementation before integration polish
- Story complete before moving to the next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel once the shared shell exists
- Once Foundational phase completes, all user stories can start in parallel if needed
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by separate contributors

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Add unit coverage for the core EMF helpers in app/lab/__tests__/lib/field-math.test.ts"
Task: "Add single-source render coverage in app/lab/__tests__/components/Canvas3D/FieldVisualization.test.tsx"

# Launch the main implementation steps together:
Task: "Implement the source emission-to-particle mapping in app/lab/modules/simulation/simulation-engine.ts"
Task: "Replace any remaining ray-line feel with the subtle dot/halo visualization in app/lab/components/Canvas3D/FieldVisualization.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the single-source experience before broadening scope

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 and User Story 4 for the baseline lab experience
3. Add User Story 2 for interference and presets
4. Add User Story 3 for deeper parameter control
5. Add User Story 5 for measurement and analysis
6. Add User Story 6 for cleanup and management

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 4
   - Developer C: User Story 2
3. Story-specific polish happens after the core scenarios are complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story should be independently completable and testable
- Keep the visualization subtle: dots, halos, local drift, and readable motion
- Divergence/curl stays a V1 conceptual overlay, not a full Maxwell solver
- Avoid same-file conflicts where possible
