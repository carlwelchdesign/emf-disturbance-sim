# Tasks: Operator Sidebar Redesign

**Input**: Design documents from `/specs/004-operator-sidebar-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include focused component/store tests and required validation checks for visualization-quality constraints.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the control-panel refactor surface and test scaffolding.

- [x] T001 Create feature task baseline by adding a task-specific sidebar migration note to `specs/004-operator-sidebar-redesign/quickstart.md`
- [x] T002 [P] Add section-order and selection-context constants in `app/lab/lib/sidebar-layout.ts`
- [x] T003 [P] Add shared panel-shell component scaffold for section headers and card boundaries in `app/lab/components/ControlPanel/SectionPanel.tsx`
- [x] T004 [P] Add dual-mode control scaffold (slider + numeric input shell) in `app/lab/components/shared/DualModeControl.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Introduce shared state and composition primitives required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Extend selection model for none/single/multi in `app/lab/types/store.types.ts`
- [x] T006 Implement selection-context actions/selectors in `app/lab/hooks/useLabStore.ts`
- [x] T007 [P] Add section disclosure state model (expanded/collapsed by section) in `app/lab/hooks/useLabStore.ts`
- [x] T008 [P] Add keyboard/focus utilities for section traversal in `app/lab/lib/sidebar-a11y.ts`
- [x] T009 Refactor `app/lab/components/ControlPanel/ControlPanel.tsx` to section-slot composition using `SectionPanel`
- [x] T010 Add foundational regression tests for selection context and section state in `app/lab/__tests__/hooks/useLabStore.test.ts`
- [x] T040 [P] Add FPS and low-performance transition observability assertions in `app/lab/__tests__/hooks/useFPSMonitor.test.ts`
- [x] T041 [P] Add parameter-change observability assertions for source/settings updates in `app/lab/__tests__/hooks/useLabStore.test.ts`
- [x] T042 Add invalid-input and reset-path recovery assertions in `app/lab/__tests__/hooks/useLabStore.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Execute simulation setup quickly (Priority: P1) 🎯 MVP

**Goal**: Deliver clear global hierarchy and primary setup workflow (presets + source inventory actions) without per-source inline clutter.

**Independent Test**: Open `/lab`, confirm fixed section order and that operators can configure setup/presets/add sources without entering Selected Entity editing.

### Tests for User Story 1

- [x] T011 [P] [US1] Add control-panel hierarchy rendering test (section order + hierarchy semantics) in `app/lab/__tests__/components/ControlPanelHierarchy.test.tsx`
- [x] T012 [P] [US1] Add global-vs-local separation test in `app/lab/__tests__/components/ControlPanelGlobalSeparation.test.tsx`

### Visualization Quality Validation (Required)

- [x] T013 [P] [US1] Add non-data-ink guard assertions (no decorative-only UI elements in section headers/panels) in `app/lab/__tests__/components/ControlPanelHierarchy.test.tsx`

### Implementation for User Story 1

- [x] T014 [US1] Rebuild top-level sidebar order and section headers in `app/lab/components/ControlPanel/ControlPanel.tsx`
- [x] T015 [P] [US1] Move preset controls into Simulation Setup panel in `app/lab/components/ControlPanel/ScenarioPresets.tsx`
- [x] T016 [P] [US1] Rework Active Entities panel framing and primary actions in `app/lab/components/ControlPanel/SourceList.tsx`
- [x] T017 [US1] Remove per-source inline editing affordances from entity list rows in `app/lab/components/ControlPanel/SourceList.tsx`
- [x] T018 [US1] Enforce 8pt spacing rhythm and semantic heading hierarchy with theme spacing tokens in `app/lab/components/ControlPanel/ControlPanel.tsx`

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - Focus-edit one source without clutter (Priority: P2)

**Goal**: Implement stateful source selection and focused selected-entity editing with progressive disclosure and dual-mode precision controls.

**Independent Test**: Select/deselect sources and verify Selected Entity panel behavior for none/single (and optional multi) with advanced controls collapsed by default.

### Tests for User Story 2

- [x] T019 [P] [US2] Add selected-entity no-selection/single-selection behavior test in `app/lab/__tests__/components/SourceControls.test.tsx`
- [x] T020 [P] [US2] Add progressive disclosure default-collapsed test in `app/lab/__tests__/components/SourceControls.test.tsx`
- [x] T021 [P] [US2] Add dual-mode control synchronization test in `app/lab/__tests__/components/Slider.test.tsx`
- [x] T043 [P] [US2] Add source-selection responsiveness test (selection switch latency target) in `app/lab/__tests__/components/SourceList.test.tsx`

### Implementation for User Story 2

- [x] T022 [US2] Split Selected Entity panel from Active Entities in `app/lab/components/ControlPanel/ControlPanel.tsx`
- [x] T023 [US2] Refactor `app/lab/components/ControlPanel/SourceControls.tsx` into critical and advanced control groups
- [x] T024 [P] [US2] Implement advanced-controls accordion disclosure in `app/lab/components/ControlPanel/SourceControls.tsx`
- [x] T025 [P] [US2] Replace precision sliders with dual-mode controls for frequency/power/phase in `app/lab/components/ControlPanel/SourceControls.tsx`
- [x] T026 [US2] Add explicit no-selection instructional empty state in `app/lab/components/ControlPanel/SourceControls.tsx`
- [x] T027 [US2] Implement multi-select selection-context state transitions in `app/lab/types/store.types.ts` and `app/lab/hooks/useLabStore.ts`
- [x] T044 [US2] Implement mixed-value rendering and disabled non-shared controls in `app/lab/components/ControlPanel/SourceControls.tsx`
- [x] T045 [P] [US2] Add multi-select mixed-value behavior tests in `app/lab/__tests__/components/SourceControls.test.tsx`

**Checkpoint**: User Story 2 should work independently with focused editing and disclosure behavior.

---

## Phase 5: User Story 3 - Analyze and visualize without setup interference (Priority: P3)

**Goal**: Ensure visualization and measurements are isolated in dedicated sections that do not interfere with setup or entity-edit workflows.

**Independent Test**: During a running scenario, adjust visualization and measurement controls without invoking source-editing controls unless explicitly selected.

### Tests for User Story 3

- [x] T028 [P] [US3] Add visualization-section isolation test in `app/lab/__tests__/components/VisualizationSettings.test.tsx`
- [x] T029 [P] [US3] Add analysis/measurement section isolation test in `app/lab/__tests__/components/MeasurementToolsIsolation.test.tsx`

### Visualization Quality Validation (Required)

- [x] T030 [P] [US3] Add graphical-integrity guard test for unchanged field semantics while refactoring controls in `app/lab/__tests__/components/Canvas3D/FieldVisualization.test.tsx`

### Implementation for User Story 3

- [x] T031 [US3] Place visualization controls under dedicated Visualization Controls section in `app/lab/components/ControlPanel/VisualizationSettings.tsx`
- [x] T032 [P] [US3] Move measurement tools/readouts under Analysis/Measurements section in `app/lab/components/ControlPanel/MeasurementTools.tsx`
- [x] T033 [P] [US3] Align measurement list integration with analysis section in `app/lab/components/Analysis/MeasurementList.tsx`
- [x] T034 [US3] Isolate System/View controls from simulation/analysis concerns in `app/lab/components/ControlPanel/ControlPanel.tsx`

**Checkpoint**: User Story 3 should be independently functional and not cross-couple with setup/editing.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration hardening, docs, and validation.

- [x] T035 [P] Update control panel documentation and operator workflow notes in `README.md`
- [x] T036 [P] Add or update accessibility labels/focus hints across control panels in `app/lab/components/ControlPanel/ControlPanel.tsx`
- [x] T037 Run and address failures for `npm test` in `/Users/carl.welch/Documents/Github Projects/emf-visualizer`
- [x] T038 Run and address failures for `npm run lint` in `/Users/carl.welch/Documents/Github Projects/emf-visualizer`
- [x] T039 Run and address failures for `npm run type-check` in `/Users/carl.welch/Documents/Github Projects/emf-visualizer`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2; MVP slice.
- **Phase 4 (US2)**: Depends on Phase 2 foundational architecture.
- **Phase 5 (US3)**: Depends on Phase 2; can proceed after US1 shell integration.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational work.
- **US2 (P2)**: Depends on Phase 2 foundational architecture and remains independently testable from US1 delivery.
- **US3 (P3)**: Depends on foundational panel architecture and remains independently testable.

### Within Each User Story

- Tests and validation tasks precede or run alongside implementation.
- Section framing before deep control refactors.
- Selection-state plumbing before advanced/multi-select behavior.

### Parallel Opportunities

- Setup tasks T002-T004 in parallel.
- Foundational tasks T007-T008 in parallel after T005/T006 planning.
- Foundational observability tasks T040-T041 in parallel.
- US1 tasks T015-T016 in parallel.
- US2 tasks T024-T025 in parallel after T023.
- US2 tasks T044-T045 in parallel after T027.
- US3 tasks T032-T033 in parallel after section placement.
- Polish tasks T035-T036 in parallel.

---

## Parallel Example: User Story 2

```bash
# Parallel tests:
Task: "T019 [US2] selected-entity behavior tests in app/lab/__tests__/components/SourceControls.test.tsx"
Task: "T021 [US2] dual-mode sync tests in app/lab/__tests__/components/Slider.test.tsx"

# Parallel implementation after SourceControls grouping is in place:
Task: "T024 [US2] advanced-controls accordion in app/lab/components/ControlPanel/SourceControls.tsx"
Task: "T025 [US2] dual-mode precision controls in app/lab/components/ControlPanel/SourceControls.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) and validate independent setup workflow.
3. Demo/deploy MVP with improved hierarchy and scanability.

### Incremental Delivery

1. Ship US1 (setup hierarchy and primary actions).
2. Add US2 (focused editing + disclosure + dual-mode controls).
3. Add US3 (analysis/visualization isolation).
4. Finish with polish and full validation checks.

### Parallel Team Strategy

1. One engineer handles foundational store/composition tasks.
2. One engineer implements US2 controls while another implements US3 section isolation after foundational merge.
3. Shared pass for polish and regression checks.

---

## Notes

- [P] tasks target different files or independent scopes.
- [USx] labels map tasks directly to story outcomes for traceability.
- Keep global/local mutation boundaries strict per `contracts/sidebar-control-contract.md`.
- Preserve existing simulation semantics while reorganizing controls.
