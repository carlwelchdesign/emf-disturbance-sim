# Tasks: Improve EMF Solver Fidelity

**Input**: Design documents from `/specs/003-improve-emf-solver/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to support independent delivery and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared field-model and validation surfaces for fidelity work

- [ ] T001 [P] Extend `app/lab/types/source.types.ts` and `app/lab/types/visualization.types.ts` with solver-profile and spectral-width fields needed for fidelity controls
- [ ] T002 [P] Update `app/lab/lib/validation.ts` and `app/lab/hooks/useLabStore.ts` so broader source bounds and fidelity settings are sanitized, persisted, and reset safely

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core field math and state plumbing that all story work depends on

**⚠️ CRITICAL**: No user story work should begin until this phase is complete

- [ ] T003 Finalize bandwidth-aware spectral averaging and field-vector synthesis in `app/lab/modules/compute/cpu-backend.ts`
- [ ] T004 [P] Add shared field-interaction helpers for overlap, cancellation, and contested-zone scoring in `app/lab/lib/field-math.ts`
- [ ] T005 Add solver-profile state selection and propagation helpers in `app/lab/hooks/useLabStore.ts` and `app/lab/types/store.types.ts`

**Checkpoint**: Foundation ready - user story implementation can now proceed

---

## Phase 3: User Story 1 - Scientific Field Comparison (Priority: P1) 🎯 MVP

**Goal**: Make multi-emitter scenes read as a clearer scientific field study with visible overlap, reinforcement, cancellation, and preserved source identity

**Independent Test**: Load a multi-emitter scene and confirm the display shows distinct sources, broader field footprints, and readable interference patterns rather than a single decorative blob

### Implementation for User Story 1

- [ ] T006 [P] [US1] Refine `app/lab/components/Canvas3D/FieldVisualization.tsx` so particle clouds react more strongly to field overlap, phase, and source identity
- [ ] T007 [US1] Add interaction-zone and source-comparison cues to `app/lab/components/Canvas3D/FieldVisualization.tsx` and `app/lab/lib/visualization-helpers.ts`
- [ ] T008 [US1] Wire the selected solver profile into `app/lab/components/Canvas3D/FieldVisualization.tsx` so the scene can switch between simplified and more scientific behavior

**Checkpoint**: User Story 1 should now present a readable scientific multi-emitter comparison

---

## Phase 4: User Story 2 - Solver Fidelity Controls (Priority: P2)

**Goal**: Let users switch between clearer teaching visuals and a more grounded approximation without losing usability

**Independent Test**: Change the fidelity setting and confirm the same scene updates its density, smoothing, and directional emphasis immediately

### Implementation for User Story 2

- [ ] T009 [P] [US2] Add a fidelity control section to `app/lab/components/ControlPanel/SourceControls.tsx` or the shared visualization settings panel
- [ ] T010 [US2] Persist fidelity choices through scenario application and reset flows in `app/lab/hooks/useLabStore.ts`
- [ ] T011 [US2] Update `app/lab/components/ControlPanel/ScenarioPresets.tsx` and `app/lab/components/ControlPanel/VisualizationSettings.tsx` so preset loading and manual tuning stay in sync

**Checkpoint**: User Story 2 should now expose a simple realism-versus-clarity workflow

---

## Phase 5: User Story 3 - Interference Study Presets (Priority: P3)

**Goal**: Provide curated 2-, 3-, 4-, and 5-emitter scenarios that teach specific interference behaviors

**Independent Test**: Load each preset and confirm it communicates a distinct scenario with the expected emitter count and explanation

### Implementation for User Story 3

- [ ] T012 [P] [US3] Expand `app/lab/modules/scenario/presets.ts` with explicit 2-, 3-, 4-, and 5-emitter interference setups and tuned bandwidth values
- [ ] T013 [US3] Refresh scenario descriptions in `app/lab/components/ControlPanel/ScenarioPresets.tsx` so each preset explains the field behavior it demonstrates
- [ ] T014 [US3] Update source-selection and preset-reset handling in `app/lab/hooks/useLabStore.ts` to keep curated interference scenes stable after user edits

**Checkpoint**: User Story 3 should now provide a clear interference-study preset set

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish shared polish and verify the overall lab remains coherent

- [ ] T015 [P] Harmonize bandwidth, phase, and frequency copy in `app/lab/components/ControlPanel/SourceControls.tsx` and `app/lab/lib/visualization-helpers.ts`
- [ ] T016 Validate the full lab flow against `specs/003-improve-emf-solver/quickstart.md` and resolve any regressions in touched files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational phase - no dependency on later stories
- **User Story 2 (P2)**: Starts after Foundational phase - should remain independently testable
- **User Story 3 (P3)**: Starts after Foundational phase - should remain independently testable

### Parallel Opportunities

- `T001` and `T002` can run in parallel
- `T004` can run in parallel with `T003` once the shared field contracts are understood
- `T006` and `T007` can run in parallel after `T003` and `T005`
- `T009` and `T010` can run in parallel after `T005`
- `T012` and `T013` can run in parallel after `T005`

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Deliver User Story 1 as the MVP
3. Validate that the multi-emitter field readout is scientifically legible
4. Add fidelity controls next
5. Finish with curated multi-emitter presets

### Incremental Delivery

1. Shared solver and validation surfaces
2. Scientific field comparison
3. Fidelity controls
4. Interference preset expansion
5. Final polish

### Parallel Team Strategy

- One contributor can own solver math while another updates the visualization layer
- Another contributor can implement the fidelity controls and preset UI once the shared state is ready
- Preset authoring can proceed alongside UI copy cleanup
