# Tasks: Optimize Animation Smoothness

**Input**: Design documents from `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/008-optimize-animation-smoothness/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/animation-performance-contract.md, quickstart.md

**Tests**: Explicit automated test updates are included to satisfy constitution validation gates.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish acceptance criteria artifacts, telemetry contracts, and baseline measurement scaffolding.

- [X] T001 Update acceptance rubric and scenario matrix for SC-001/SC-002/SC-003/SC-004 in `specs/008-optimize-animation-smoothness/quickstart.md`
- [X] T002 Define telemetry interfaces for frame/input/degradation/sample-window evaluation in `app/lab/types/store.types.ts`
- [X] T003 [P] Export telemetry interfaces in `app/lab/types/index.ts`
- [X] T004 [P] Add shared smoothness thresholds and evaluation helpers in `app/lab/lib/visualization-helpers.ts`
- [X] T005 Add baseline-vs-post-change measurement section and data capture template for SC-004 in `specs/008-optimize-animation-smoothness/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared observability and regression harness required by all user stories.

**⚠️ CRITICAL**: No user-story implementation should start before this phase is complete.

- [X] T006 Add telemetry state slices and actions for interaction/animation/degradation in `app/lab/hooks/useLabStore.ts`
- [X] T007 [P] Extend FPS monitoring to emit frame-duration/degradation samples in `app/lab/hooks/useFPSMonitor.ts`
- [X] T008 [P] Capture rotate/pan/zoom input-response sampling in `app/lab/hooks/useCameraControls.ts`
- [X] T009 Wire telemetry payload boundaries to simulation update flow in `app/lab/modules/simulation/types.ts`
- [X] T010 Add degradation signal model defaults in `app/lab/types/visualization.types.ts`
- [X] T011 Add shared test helpers for smoothness evaluation windows in `app/lab/__tests__/lib/visualization-helpers.test.ts`
- [X] T012 Add regression harness for non-Maxwell workflow continuity in `__tests__/integration/user-journey-1.test.tsx`

**Checkpoint**: Shared telemetry, degradation handling, and regression harness are ready.

---

## Phase 3: User Story 1 - Smooth Scene Navigation (Priority: P1) 🎯 MVP

**Goal**: Make rotate, pan, and zoom interactions smooth and immediately responsive.

**Independent Test**: In a representative non-Maxwell scenario, users can continuously rotate, pan, and zoom without visible jank or delayed camera jumps.

### Tests for User Story 1

- [X] T013 [P] [US1] Add camera interaction latency/jank unit coverage in `app/lab/__tests__/hooks/useCameraControls.test.ts`
- [X] T014 [P] [US1] Add camera smoothness component behavior checks in `app/lab/__tests__/components/CameraControls.test.tsx`
- [X] T015 [P] [US1] Add continuous navigation integration scenario in `__tests__/integration/user-journey-1.test.tsx`

### Implementation for User Story 1

- [X] T016 [US1] Reduce unnecessary camera-driven rerenders in `app/lab/components/Canvas3D/Canvas3D.tsx`
- [X] T017 [P] [US1] Optimize camera control update cadence and interaction event handling in `app/lab/components/Canvas3D/CameraControls.tsx`
- [X] T018 [P] [US1] Narrow camera-related store subscriptions/selectors in `app/lab/hooks/useLabStore.ts`
- [X] T019 [US1] Tune interaction latency thresholds and jank classification in `app/lab/hooks/useCameraControls.ts`
- [X] T020 [US1] Update navigation validation pass/fail checklist in `specs/008-optimize-animation-smoothness/quickstart.md`

**Checkpoint**: User Story 1 is independently testable and MVP-ready.

---

## Phase 4: User Story 2 - Smooth Animation Playback (Priority: P2)

**Goal**: Keep field animation smooth during normal playback and moderate camera interaction while honoring visualization quality and accessibility requirements.

**Independent Test**: With animation active in non-Maxwell mode, playback remains continuous over extended observation, remains interpretable, and avoids severe stutter during moderate camera movement.

### Tests for User Story 2

- [X] T021 [P] [US2] Add frame-smoothness threshold and spike-recovery tests in `__tests__/performance/multi-source-fps.test.ts`
- [X] T022 [P] [US2] Add animation continuity + interaction coexistence checks in `app/lab/__tests__/components/Canvas3D/FieldVisualization.test.tsx`
- [X] T023 [P] [US2] Add non-color accessibility cue and color-contrast tests in `app/lab/__tests__/lib/visualization-helpers.test.ts`
- [X] T024 [P] [US2] Add visual-integrity assertions for data-ink and non-decorative rendering in `__tests__/integration/parameter-updates.test.tsx`

### Implementation for User Story 2

- [X] T025 [US2] Reduce per-frame CPU work and object churn in `app/lab/components/Canvas3D/FieldVisualization.tsx`
- [X] T026 [P] [US2] Optimize active field render updates and sampling strategy in `app/lab/components/Canvas3D/InterferenceField3D.tsx`
- [X] T027 [P] [US2] Improve animation scheduling/throttling boundaries in `app/lab/modules/simulation/simulation-engine.ts`
- [X] T028 [US2] Integrate animation smoothness sampling with FPS telemetry in `app/lab/hooks/useFPSMonitor.ts`
- [X] T029 [US2] Implement perceptually uniform/non-color cue mapping updates in `app/lab/lib/visualization-helpers.ts`
- [X] T030 [US2] Update animation, accessibility, and visual-integrity validation matrix in `specs/008-optimize-animation-smoothness/quickstart.md`

**Checkpoint**: User Stories 1 and 2 are independently testable with explicit quality/accessibility coverage.

---

## Phase 5: User Story 3 - Stable Experience Without Maxwell Field (Priority: P3)

**Goal**: Ensure stable non-Maxwell workflows while Maxwell visualization remains intentionally hidden and clearly communicated.

**Independent Test**: With Maxwell field hidden, entry and interaction workflows remain smooth, degraded-state messaging is clear, and workflow continuity is preserved.

### Tests for User Story 3

- [X] T031 [P] [US3] Add Maxwell-hidden control panel behavior tests in `app/lab/__tests__/components/VisualizationSettings.test.tsx`
- [X] T032 [P] [US3] Add non-Maxwell workflow continuity integration checks in `__tests__/integration/user-journey-3.test.tsx`
- [X] T033 [P] [US3] Add degraded-state messaging visibility tests in `app/lab/__tests__/components/ControlPanelHierarchy.test.tsx`

### Implementation for User Story 3

- [X] T034 [US3] Enforce Maxwell-hidden mode behavior in `app/lab/components/ControlPanel/VisualizationSettings.tsx`
- [X] T035 [P] [US3] Keep Maxwell overlay/volume excluded from non-Maxwell render flow in `app/lab/components/Canvas3D/MaxwellFieldOverlay.tsx`
- [X] T036 [P] [US3] Keep Maxwell volume rendering disabled in non-Maxwell scope in `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx`
- [X] T037 [P] [US3] Align Maxwell visibility selectors/guards for non-Maxwell scope in `app/lab/hooks/useMaxwellRunSelectors.ts`
- [X] T038 [US3] Add user-facing degraded-state and scope messaging in `app/lab/components/ControlPanel/VisualizationSettings.tsx`
- [X] T039 [US3] Update non-Maxwell-only validation scenarios and acceptance log in `specs/008-optimize-animation-smoothness/quickstart.md`

**Checkpoint**: All user stories are independently functional and test-backed.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Close coverage gaps for success criteria, workflow preservation, and release readiness.

- [X] T040 [P] Add explicit regression coverage for preserved workflows (FR-008) in `__tests__/integration/user-journey-2.test.tsx`
- [ ] T041 [P] Execute SC-003 2-minute explore-task evaluation and record participant outcomes in `specs/008-optimize-animation-smoothness/quickstart.md` _(blocked: requires real participant study data not available in CLI execution)_
- [ ] T042 [P] Capture baseline vs optimized sluggishness reports and compute SC-004 delta in `specs/008-optimize-animation-smoothness/quickstart.md` _(blocked: baseline/optimized field observations were not provided)_
- [X] T043 [P] Run test/lint/type-check command outcomes and record results in `specs/008-optimize-animation-smoothness/quickstart.md`
- [X] T044 Verify plan/spec/tasks traceability consistency in `specs/008-optimize-animation-smoothness/plan.md`
- [X] T045 Verify final task coverage mapping and completion notes in `specs/008-optimize-animation-smoothness/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: Can start immediately.
- **Phase 2**: Depends on Phase 1; blocks all user-story phases.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and should integrate without regressing US1.
- **Phase 5 (US3)**: Depends on Phase 2 and should preserve US1/US2 behavior.
- **Phase 6**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Independent after foundational completion.
- **US2 (P2)**: Independent after foundational completion; validates coexistence with US1.
- **US3 (P3)**: Independent after foundational completion; validates non-Maxwell stability and messaging.

### Parallel Opportunities

- Setup `[P]`: T003, T004
- Foundational `[P]`: T007, T008
- US1 `[P]`: T013, T014, T015, T017, T018
- US2 `[P]`: T021, T022, T023, T024, T026, T027
- US3 `[P]`: T031, T032, T033, T035, T036, T037
- Polish `[P]`: T040, T041, T042, T043

---

## Parallel Execution Examples

### User Story 1

```bash
Task T013: Add camera interaction latency/jank unit coverage in app/lab/__tests__/hooks/useCameraControls.test.ts
Task T014: Add camera smoothness component behavior checks in app/lab/__tests__/components/CameraControls.test.tsx
Task T015: Add continuous navigation integration scenario in __tests__/integration/user-journey-1.test.tsx
```

### User Story 2

```bash
Task T021: Add frame-smoothness threshold and spike-recovery tests in __tests__/performance/multi-source-fps.test.ts
Task T023: Add non-color accessibility cue and color-contrast tests in app/lab/__tests__/lib/visualization-helpers.test.ts
Task T026: Optimize active field render updates and sampling strategy in app/lab/components/Canvas3D/InterferenceField3D.tsx
```

### User Story 3

```bash
Task T031: Add Maxwell-hidden control panel behavior tests in app/lab/__tests__/components/VisualizationSettings.test.tsx
Task T035: Keep Maxwell overlay/volume excluded from non-Maxwell render flow in app/lab/components/Canvas3D/MaxwellFieldOverlay.tsx
Task T037: Align Maxwell visibility selectors/guards in app/lab/hooks/useMaxwellRunSelectors.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1 tests + implementation).
3. Validate US1 independently before expanding scope.

### Incremental Delivery

1. Deliver US1 navigation smoothness.
2. Deliver US2 animation smoothness + accessibility/visual-quality validation.
3. Deliver US3 non-Maxwell stability and messaging.
4. Complete cross-cutting SC-003/SC-004 measurement and release checks.

### Parallel Team Strategy

1. Complete Phase 1 and Phase 2 together.
2. Split by story phases once foundational work is done.
3. Rejoin for Phase 6 measurement, regression, and traceability checks.
