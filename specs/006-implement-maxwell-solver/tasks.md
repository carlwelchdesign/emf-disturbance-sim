# Tasks: Implement Maxwell Solver

**Input**: Design documents from `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the specification explicitly requires correctness validation and threshold enforcement.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label ([US1], [US2], [US3])
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Maxwell-solver scaffolding and baseline test structure.

- [X] T001 Create Maxwell solver module directories in app/lab/modules/maxwell/
- [X] T002 Create feature type files for run/config contracts in app/lab/types/maxwell.types.ts
- [X] T003 [P] Create validation scenario fixtures directory in __tests__/fixtures/maxwell/
- [X] T004 [P] Create solver-focused test suites directories in __tests__/unit/maxwell/ and __tests__/integration/maxwell/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared foundations required by all user stories.

**⚠️ CRITICAL**: Complete this phase before implementing user stories.

- [X] T005 Implement method-family interfaces and run lifecycle enums in app/lab/modules/maxwell/core/method-family-profile.ts
- [X] T006 [P] Implement simulation configuration schema and guards in app/lab/modules/maxwell/core/simulation-configuration.ts
- [X] T007 [P] Implement standardized run error and provenance models in app/lab/modules/maxwell/core/run-records.ts
- [X] T008 Implement run queue/orchestration state container in app/lab/modules/maxwell/core/run-orchestrator.ts
- [X] T009 [P] Extend lab store state/actions for solver runs in app/lab/types/store.types.ts
- [X] T010 Wire solver run state/actions into Zustand store in app/lab/hooks/useLabStore.ts

**Checkpoint**: Foundational solver framework is ready; user stories can proceed.

---

## Phase 3: User Story 1 - Run a trustworthy full-wave simulation (Priority: P1) 🎯 MVP

**Goal**: Allow users to configure and execute FDTD full-wave runs with validated E/B outputs.

**Independent Test**: Submit a valid config + reference scenario and verify run completion produces E/B outputs plus validation error metrics that satisfy thresholds.

### Tests for User Story 1

- [X] T011 [P] [US1] Add contract tests for run submission and status transitions in __tests__/integration/maxwell/run-contract.test.ts
- [X] T012 [P] [US1] Add unit tests for CFL/pre-run validation rules in __tests__/unit/maxwell/config-validation.test.ts
- [X] T013 [P] [US1] Add validation-threshold regression tests for reference scenarios in __tests__/integration/maxwell/validation-thresholds.test.ts

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement FDTD method-family adapter skeleton in app/lab/modules/maxwell/methods/fdtd/fdtd-adapter.ts
- [X] T015 [P] [US1] Implement Yee-grid time-step update routines in app/lab/modules/maxwell/methods/fdtd/fdtd-stepper.ts
- [X] T016 [US1] Implement full-wave execution pipeline using orchestrator + FDTD adapter in app/lab/modules/maxwell/core/maxwell-solver-engine.ts
- [X] T017 [P] [US1] Implement field output packing (time-indexed E/B + metadata) in app/lab/modules/maxwell/core/field-output-builder.ts
- [X] T018 [P] [US1] Implement derived metric computations (minimum two metrics) in app/lab/modules/maxwell/core/derived-metrics.ts
- [X] T019 [US1] Implement scenario-driven validation evaluator and thresholds in app/lab/modules/maxwell/core/validation-pipeline.ts
- [X] T020 [US1] Integrate solver engine with existing simulation engine entrypoint in app/lab/modules/simulation/simulation-engine.ts
- [X] T021 [US1] Add run-submission and run-monitoring actions/selectors to Zustand store in app/lab/hooks/useLabStore.ts
- [X] T022 [US1] Add baseline FDTD validation scenario definitions (define and implement at least 12 named reference scenarios to satisfy SC-001 ≥12 threshold) in app/lab/modules/maxwell/validation/scenarios.ts
- [ ] T022b [US1] Implement domain/material/boundary-condition setup form component (user inputs: spatial extent, grid resolution, time-step policy, material properties per region, BC type per surface) in app/lab/components/ControlPanel/SimulationSetupForm.tsx; wire to T021 run-submission actions; T037 (SimulationSetupValidation.tsx) handles validation feedback within this form

**Checkpoint**: US1 is independently runnable and produces validated/non-validated results with E/B outputs.

---

## Phase 4: User Story 2 - Analyze solver outputs in the existing visualizer (Priority: P2)

**Goal**: Surface full-wave E/B outputs and derived metrics in current visualizer workflows.

**Independent Test**: Open completed runs in the lab UI, navigate time states, and inspect E/B + derived metrics with clear context labels.

### Tests for User Story 2

- [X] T023 [P] [US2] Add integration test for loading solver outputs into analysis workflow in __tests__/integration/maxwell/visualizer-integration.test.tsx
- [X] T024 [P] [US2] Add render test for time-state and metric switching behavior in __tests__/integration/maxwell/result-navigation.test.tsx

### Implementation for User Story 2

- [X] T025 [P] [US2] Add selector hooks for active run outputs and metric series in app/lab/hooks/useMaxwellRunSelectors.ts
- [X] T026 [US2] Extend field visualization to consume full-wave E/B time-series with keyboard-accessible time-navigation controls and ARIA labels per A11Y-001 in app/lab/components/Canvas3D/FieldVisualization.tsx
- [X] T027 [US2] Add solver result context panel with keyboard-operable controls, focus management, and ARIA roles per A11Y-001 (scenario/time/metric labels) in app/lab/components/Analysis/MaxwellRunContextPanel.tsx
- [X] T028 [US2] Add derived metrics trend panel with keyboard-navigable rows and ARIA state annotations per A11Y-001 for completed runs in app/lab/components/Analysis/DerivedMetricsPanel.tsx
- [X] T029 [US2] Integrate run result controls into side panel workflow with full keyboard operability (tab order, enter/space activation) and ARIA live regions per A11Y-001 in app/lab/components/ControlPanel/ControlPanel.tsx
- [X] T030 [US2] Update field strength display validity labeling with keyboard-accessible status indicators and ARIA descriptions per A11Y-001 for validated vs non-validated runs in app/lab/components/Analysis/FieldStrengthDisplay.tsx

**Checkpoint**: US2 enables independent interactive analysis of full-wave run outputs in existing UI.

---

## Phase 5: User Story 3 - Prevent invalid or unstable simulation use (Priority: P3)

**Goal**: Block invalid runs pre-execution and clearly communicate instability/failure conditions.

**Independent Test**: Attempt invalid and unstable configurations; confirm runs are rejected/flagged with actionable corrective guidance and never shown as validated.

### Tests for User Story 3

- [X] T031 [P] [US3] Add integration test for pre-run rejection guidance messages in __tests__/integration/maxwell/invalid-config-rejection.test.tsx
- [X] T032 [P] [US3] Add integration test for instability detection and status handling in __tests__/integration/maxwell/instability-detection.test.tsx

### Implementation for User Story 3

- [X] T033 [P] [US3] Implement pre-run configuration validator for domain/material/boundary compatibility in app/lab/modules/maxwell/core/pre-run-validator.ts
- [X] T034 [P] [US3] Implement runtime instability detectors (NaN/Inf/divergence/CFL breach) in app/lab/modules/maxwell/core/instability-detector.ts
- [X] T035 [US3] Enforce run status transitions for rejected/unstable/non-validated outcomes in app/lab/modules/maxwell/core/run-orchestrator.ts
- [X] T036 [US3] Implement user-facing error mapping with recommended actions in app/lab/modules/maxwell/core/error-message-mapper.ts
- [X] T037 [US3] Add setup-form validation and blocking UX for invalid configurations with keyboard-accessible error focus management and ARIA alert roles per A11Y-001 in app/lab/components/ControlPanel/SimulationSetupValidation.tsx
- [X] T038 [US3] Integrate instability/rejection alerts into analysis and run-status panels with keyboard-dismissible alerts and ARIA live announcement per A11Y-001 in app/lab/components/Analysis/MaxwellRunStatusBanner.tsx

**Checkpoint**: US3 independently prevents misleading solver usage and communicates corrective actions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across stories.

- [X] T039 [P] Add performance telemetry capture for runtime and interaction goals in app/lab/modules/maxwell/core/performance-telemetry.ts
- [X] T040 Add queue-capacity and deterministic-status regression tests for 10 concurrent runs in __tests__/integration/maxwell/queue-capacity.test.ts
- [X] T041 [P] Update user/developer docs for Maxwell workflow and troubleshooting in README.md
- [X] T042 Run full verification gate and record commands/results in /Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/quickstart.md
- [X] T043 [P] [US2] Add keyboard-only setup→run→inspect integration test coverage in __tests__/integration/maxwell/keyboard-runflow.test.tsx
- [X] T044 [P] [US2] Add keyboard focus-order and ARIA-state assertions for solver controls in __tests__/integration/maxwell/controlpanel-a11y.test.tsx
- [X] T045 [US2] Add keyboard-only acceptance criteria mapping for A11Y-001 in /Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/checklists/requirements.md
- [X] T046 [P] [US2] Add visualization integrity threshold assertions for VQ-001/VQ-002 in __tests__/integration/maxwell/visual-integrity-thresholds.test.tsx
- [X] T047 [P] [US2] Add interaction latency pass/fail verification for PF-002 in __tests__/performance/maxwell-interaction-latency.test.ts
- [ ] T047b [P] Add simulation runtime pass/fail assertion for PF-001 (baseline scenario class MUST complete within 5 minutes; test records wall-clock ms, asserts ≤300000 ms, logs result as pass/fail) in __tests__/performance/maxwell-simulation-runtime.test.ts
- [X] T048 [US2] Add explicit PF-002 and visualization pass/fail matrix to /Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/quickstart.md
- [X] T049 [US3] Implement additional method-family extension spike using existing orchestrator contracts in app/lab/modules/maxwell/spikes/method-extension-spike.ts
- [X] T050 [US3] Document SC-006 extension-spike evidence and acceptance results in /Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/research.md
- [X] T051 [US3] Add SC-006 traceability mapping entry in /Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/checklists/requirements.md

---

## Phase 7: Browser Safety & Crash Prevention

**Purpose**: Enforce BS-001–BS-005 NFRs to prevent browser tab OOM/crash under real simulation loads.

- [X] T052 Implement memory-budget estimator and pre-run blocking gate in app/lab/modules/maxwell/core/memory-budget.ts (BS-001, BS-002)
- [X] T053 [P] Implement auto-degrade controller that reduces mesh resolution and active visualization layers when memory pressure exceeds threshold in app/lab/modules/maxwell/core/degrade-controller.ts (BS-003)
- [X] T054 [P] Implement OOM-risk detector with fallback path (summary-only mode, disable time-series nav) in app/lab/modules/maxwell/core/oom-guard.ts (BS-004)
- [X] T055 [P] Implement concurrent run cap enforcer (max 3 full-resolution result sets active) in app/lab/modules/maxwell/core/run-cap-enforcer.ts (BS-005)
- [X] T056 Add browser stress tests: long-session repeated run-switching, 3-run concurrent load, OOM-risk fallback path in __tests__/integration/maxwell/browser-safety.test.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): no dependencies
- Phase 2 (Foundational): depends on Phase 1; blocks all user stories
- Phase 3 (US1): depends on Phase 2
- Phase 4 (US2): depends on Phase 2 and consumes US1 run outputs
- Phase 5 (US3): depends on Phase 2 and hardens US1/US2 execution paths
- Phase 6 (Polish): depends on completion of target user stories

### User Story Dependencies

- **US1 (P1)**: starts immediately after foundational completion; no story dependency
- **US2 (P2)**: depends on US1 output contracts and run data availability
- **US3 (P3)**: depends on foundational contracts; integrates with US1 run pipeline and US2 status surfacing

### Within Each User Story

- Tests first (write and verify failing expectations)
- Core models/contracts before orchestration logic
- Solver/validation logic before UI integration
- Story must pass independent test criteria before moving on

### Parallel Opportunities

- Phase 1: T003, T004 parallel
- Phase 2: T006, T007, T009 parallel after T005
- US1: T011–T013 parallel; T014/T015 parallel; T017/T018 parallel
- US2: T023/T024 parallel; T025 can run in parallel with UI component tasks
- US3: T031/T032 parallel; T033/T034 parallel
- Polish: T039 and T041 parallel
- US2 additional validation tasks T043/T044/T046/T047 can run in parallel once US2 base integration (T025-T030) is stable.
- Phase 7: T053, T054, T055 parallel after T052 (memory-budget estimator must exist first). **Phase 7 depends on Phase 4 (US2) completion** — T053 (degrade-controller) must hook into T026 (FieldVisualization.tsx) to reduce mesh resolution and limit active visualization layers.

---

## Parallel Example: User Story 1

```bash
# Parallel test creation
Task: "T011 [US1] __tests__/integration/maxwell/run-contract.test.ts"
Task: "T012 [US1] __tests__/unit/maxwell/config-validation.test.ts"
Task: "T013 [US1] __tests__/integration/maxwell/validation-thresholds.test.ts"

# Parallel solver component implementation
Task: "T014 [US1] app/lab/modules/maxwell/methods/fdtd/fdtd-adapter.ts"
Task: "T015 [US1] app/lab/modules/maxwell/methods/fdtd/fdtd-stepper.ts"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Finish Phase 1 and Phase 2
2. Deliver Phase 3 (US1)
3. Validate US1 independently against reference scenarios
4. Demo/deploy MVP

### Incremental Delivery

1. Foundation (Phases 1-2)
2. US1 (trusted solve path)
3. US2 (interactive analysis integration)
4. US3 (invalid/unstable protection + extension spike)
5. US2 measurable a11y/visual/perf verification add-ons (T043-T048)
6. Polish hardening

### Parallel Team Strategy

1. Team aligns on Setup + Foundational
2. Then split by story:
   - Engineer A: US1 core solver/validation
   - Engineer B: US2 UI/result analysis
   - Engineer C: US3 validation/error handling
3. Merge at Phase 6 for perf, docs, and gate validation
