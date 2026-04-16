# Tasks: Improve Interference Point Cloud

**Input**: Design documents from `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/007-improve-interference-point-cloud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include test tasks because the feature contract requires validation gates for rendering quality and interpretation behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature scaffolding and test files for interference point-cloud work.

- [X] T001 Define baseline evaluation scenario set and acceptance rubric in `specs/007-improve-interference-point-cloud/quickstart.md`
- [X] T002 Create test file skeletons for this feature in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx` and `app/lab/__tests__/components/Analysis/maxwell-interpretation.test.tsx`
- [X] T003 [P] Create Maxwell visualization helper test scaffold in `app/lab/__tests__/lib/maxwell-encoding.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared point-cloud encoding foundations required by all user stories.

**⚠️ CRITICAL**: No user story implementation begins until this phase is complete.

- [X] T004 Implement interference band and cue types in `app/lab/types/maxwell.types.ts`
- [X] T005 Implement deterministic normalization/banding utilities in `app/lab/modules/maxwell/core/interference-encoding.ts`
- [X] T006 [P] Implement non-color cue mapping utilities (size/luminance/density) in `app/lab/modules/maxwell/core/interference-cues.ts`
- [X] T007 Implement render-state mapping utilities from `FieldOutputSet` to point-cloud payload in `app/lab/modules/maxwell/core/field-output-builder.ts`
- [X] T008 Add selector/store support for interference rendering state in `app/lab/hooks/useLabStore.ts`
- [X] T009 Add foundational unit coverage for encoding determinism and band boundaries in `app/lab/__tests__/lib/maxwell-encoding.test.ts`
- [X] T010 [P] Implement interaction telemetry and edge-state event emitter in `app/lab/modules/maxwell/core/performance-telemetry.ts`
- [X] T011 [P] Add telemetry unit coverage for latency/event emission in `app/lab/__tests__/modules/maxwell/performance-telemetry.test.ts`

**Checkpoint**: Shared encoding/render-state foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Readable interference pattern (Priority: P1) 🎯 MVP

**Goal**: Replace beachball-like output with a point cloud that clearly shows constructive/destructive interference regions.

**Independent Test**: Load multi-emitter scenario and verify the Maxwell view is point-cloud based with visually distinguishable overlap vs non-overlap regions.

### Tests for User Story 1

- [X] T012 [P] [US1] Add rendering test for point-cloud presence and non-beachball geometry in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`
- [X] T013 [P] [US1] Add visualization integrity test for truthful sample-to-position mapping in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`

### Visualization Quality Validation (Required)

- [X] T014 [P] [US1] Add data-ink ratio regression test for Maxwell field rendering in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`
- [X] T015 [P] [US1] Add graphical integrity test for monotonic intensity encoding in `app/lab/__tests__/lib/maxwell-encoding.test.ts`
- [X] T016 [P] [US1] Add accessibility cue test to ensure non-color-only intensity encoding in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`
- [X] T017 [P] [US1] Add contrast-threshold validation test for point cues/background readability in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`

### Implementation for User Story 1

- [X] T018 [US1] Refactor `MaxwellFieldVolume` to render data-first interference point cloud in `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx`
- [X] T019 [US1] Integrate interference encoding utilities into point generation pipeline in `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx`
- [X] T020 [US1] Update Maxwell canvas wiring to prefer point-cloud field mode in `app/lab/components/Canvas3D/Canvas3D.tsx`
- [X] T021 [US1] Update field overlay labels/status to reflect interference point-cloud semantics in `app/lab/components/Canvas3D/MaxwellFieldOverlay.tsx`

**Checkpoint**: User Story 1 is independently functional and demonstrates meaningful interference patterns.

---

## Phase 4: User Story 2 - Visual interpretation confidence (Priority: P2)

**Goal**: Make high/medium/low interference levels consistently interpretable without guesswork.

**Independent Test**: In a fixed scenario, users can repeatedly identify strongest/weakest regions from visual encoding and get consistent outcomes.

### Tests for User Story 2

- [X] T022 [P] [US2] Add interpretation-band consistency test for repeated renders in `app/lab/__tests__/components/Analysis/maxwell-interpretation.test.tsx`
- [X] T023 [P] [US2] Add strongest/weakest region identification test in `app/lab/__tests__/components/Analysis/maxwell-interpretation.test.tsx`
- [X] T024 [P] [US2] Add evaluation-protocol test for first-attempt identification and clarity scoring workflow in `app/lab/__tests__/components/Analysis/maxwell-interpretation.test.tsx`

### Implementation for User Story 2

- [X] T025 [US2] Implement interpretation summary generation (strongest/weakest + band distribution) in `app/lab/modules/maxwell/core/interference-encoding.ts`
- [X] T026 [P] [US2] Surface interpretation summary in context panel UI in `app/lab/components/Analysis/MaxwellRunContextPanel.tsx`
- [X] T027 [P] [US2] Add interference-band legend and cue explanation in `app/lab/components/Analysis/EmitterInteractionsPanel.tsx`
- [X] T028 [US2] Add visualization setting controls for interpretation profile selection in `app/lab/components/ControlPanel/VisualizationSettings.tsx`
- [X] T029 [US2] Document and wire evaluation rubric workflow for SC-001/SC-002 in `specs/007-improve-interference-point-cloud/quickstart.md`

**Checkpoint**: User Stories 1 and 2 both work independently with repeatable interpretation cues.

---

## Phase 5: User Story 3 - Stable exploration while adjusting emitters (Priority: P3)

**Goal**: Keep the point cloud readable and stable during frequent emitter updates.

**Independent Test**: Adjust emitter parameters repeatedly and verify the cloud updates deterministically without collapsing into indistinct artifacts.

### Tests for User Story 3

- [X] T030 [P] [US3] Add emitter-adjustment stability test for update determinism in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`
- [X] T031 [P] [US3] Add saturation/low-signal edge-case stability test in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`
- [X] T032 [P] [US3] Add p95 latency assertion test for emitter-change-to-render timing in `app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx`

### Implementation for User Story 3

- [X] T033 [US3] Implement transition smoothing and deterministic update guardrails in `app/lab/modules/maxwell/core/interference-encoding.ts`
- [X] T034 [US3] Apply update-stability behavior in runtime point-cloud render loop in `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx`
- [X] T035 [US3] Improve active-step/render-state synchronization for emitter changes in `app/lab/hooks/useLabStore.ts`
- [X] T036 [US3] Add runtime safety fallbacks for sparse/extreme values in `app/lab/components/Canvas3D/InterferenceField3D.tsx`
- [X] T037 [US3] Integrate emitter-change-to-render telemetry hooks into update loop in `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx`

**Checkpoint**: All user stories are independently functional with stable interactive behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across stories.

- [X] T038 [P] Update Maxwell feature documentation for new point-cloud behavior and latency objective in `README.md`
- [X] T039 [P] Sync feature quickstart/task references in `specs/007-improve-interference-point-cloud/quickstart.md`
- [X] T040 Run full verification commands from quickstart and record outcomes in `specs/007-improve-interference-point-cloud/quickstart.md`
- [ ] T041 Run scenario-based evaluation protocol and record SC-001/SC-002 outcomes in `specs/007-improve-interference-point-cloud/quickstart.md`
- [X] T042 Perform final code cleanup and type/lint issue resolution in `app/lab/components/Canvas3D/MaxwellFieldVolume.tsx` and `app/lab/modules/maxwell/core/interference-encoding.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story phases (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after Foundational; defines MVP.
- **US2 (P2)**: Starts after Foundational; depends functionally on US1 render pipeline being present.
- **US3 (P3)**: Starts after Foundational; depends on US1 baseline and benefits from US2 interpretation outputs.

### Within Each User Story

- Tests before implementation tasks.
- Core encoding/state utilities before UI wiring.
- UI integration before polish adjustments.

### Parallel Opportunities

- Foundational: T006, T007, T008, and T010 can run in parallel after T005.
- US1 tests: T012-T017 can run in parallel.
- US2 implementation: T026 and T027 can run in parallel after T025.
- US3 tests: T030-T032 can run in parallel.
- Polish: T038 and T039 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel test tasks for US1:
Task: "Add rendering test for point-cloud presence in app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx"
Task: "Add accessibility cue test in app/lab/__tests__/components/Canvas3D/maxwell-point-cloud.test.tsx"

# Parallel implementation prep tasks after foundational:
Task: "Refactor point-cloud encoding helpers in app/lab/modules/maxwell/core/interference-encoding.ts"
Task: "Update Maxwell overlay semantics in app/lab/components/Canvas3D/MaxwellFieldOverlay.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-2.
2. Complete Phase 3 (US1).
3. Validate US1 independently before extending scope.

### Incremental Delivery

1. Deliver US1 (meaningful point-cloud baseline).
2. Add US2 (interpretation confidence and repeatability).
3. Add US3 (interactive stability under emitter adjustments).
4. Finish Phase 6 polish and documentation updates.

### Parallel Team Strategy

1. Team aligns on foundational encoding and state contracts.
2. One developer drives US1 render pipeline; another prepares US2 analysis/UI; another builds US3 stability guards.
3. Merge after per-story independent verification.

---

## Notes

- [P] tasks indicate independent files or non-blocking operations.
- [USx] labels map directly to user stories in `spec.md`.
- Every task contains an explicit file path and executable action.
