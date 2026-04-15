# Tasks: Full Maxwell Pathway

**Input**: Design documents from `/specs/005-full-maxwell-pathway/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories)  
**Available design docs**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize feature documentation artifacts and templates for pathway definition.

- [X] T001 Create pathway document scaffold in specs/005-full-maxwell-pathway/pathway.md
- [X] T002 [P] Create evaluation framework template in specs/005-full-maxwell-pathway/evaluation-framework.md
- [X] T003 [P] Create decision record log template in specs/005-full-maxwell-pathway/decision-records.md
- [X] T004 [P] Create reference scenario baseline template in specs/005-full-maxwell-pathway/reference-scenarios.md
- [X] T005 Create milestone and checkpoint tracker template in specs/005-full-maxwell-pathway/milestones.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared foundations used by all user stories.

- [X] T006 Define full-wave user value and quasi-static limitations in specs/005-full-maxwell-pathway/pathway.md
- [X] T007 Define in-scope and out-of-scope boundaries in specs/005-full-maxwell-pathway/pathway.md
- [X] T008 Define phase input/output expectations and traceable assumptions in specs/005-full-maxwell-pathway/pathway.md
- [X] T009 Define governance and re-evaluation trigger policy in specs/005-full-maxwell-pathway/decision-records.md
- [X] T010 Define common scoring scale and weighting model in specs/005-full-maxwell-pathway/evaluation-framework.md

**Checkpoint**: Shared pathway foundations complete; story work can proceed.

---

## Phase 3: User Story 1 - Define a trusted full-wave roadmap (Priority: P1) 🎯 MVP

**Goal**: Deliver a clear phased pathway with boundaries and decision checkpoints.

**Independent Test**: Stakeholders can read pathway.md and identify phased outcomes, explicit boundaries, and a usable build-vs-integrate decision framework.

- [X] T011 [US1] Define phased progression with entry/exit conditions in specs/005-full-maxwell-pathway/pathway.md
- [X] T012 [US1] Define go/pivot/stop checkpoints per phase in specs/005-full-maxwell-pathway/pathway.md
- [X] T013 [P] [US1] Map pathway requirements FR-001..FR-014, VQ-001, VQ-002, PF-001, PF-002, and A11Y-001 to sections in specs/005-full-maxwell-pathway/pathway.md
- [X] T014 [P] [US1] Add stakeholder review checklist for pathway completeness in specs/005-full-maxwell-pathway/checklists/requirements.md
- [X] T015 [US1] Record first decision record proving roadmap traceability in specs/005-full-maxwell-pathway/decision-records.md

**Checkpoint**: User Story 1 independently reviewable and decision-ready.

---

## Phase 4: User Story 2 - Evaluate solver strategy options objectively (Priority: P2)

**Goal**: Provide a consistent, measurable comparison of build and integration strategies.

**Independent Test**: Framework scoring can be applied to one build option and one integration option to produce side-by-side comparable outcomes.

- [X] T016 [US2] Add method-family evaluation sections (FDTD, FEM/FEA, DGTD, pseudo-spectral, BIE) in specs/005-full-maxwell-pathway/evaluation-framework.md
- [X] T017 [US2] Define build-vs-integrate comparison criteria and evidence fields in specs/005-full-maxwell-pathway/evaluation-framework.md
- [X] T018 [P] [US2] Add candidate option entries (commercial + open alternatives) in specs/005-full-maxwell-pathway/evaluation-framework.md
- [X] T019 [P] [US2] Define licensing/data-handling/deployment viability gates in specs/005-full-maxwell-pathway/evaluation-framework.md
- [X] T020 [US2] Produce side-by-side scored decision record for one build and one integrate path in specs/005-full-maxwell-pathway/decision-records.md

**Checkpoint**: User Story 2 independently demonstrates objective strategy comparison.

---

## Phase 5: User Story 3 - Plan validation milestones before full commitment (Priority: P3)

**Goal**: Define measurable milestone validation criteria before broad rollout.

**Independent Test**: Each phase has measurable correctness/performance/usability/maintainability criteria plus explicit go/no-go checkpoints.

- [X] T021 [US3] Define phase-level correctness acceptance criteria for representative scenarios in specs/005-full-maxwell-pathway/milestones.md
- [X] T022 [US3] Define numeric performance turnaround and scalability targets per phase in specs/005-full-maxwell-pathway/milestones.md
- [X] T023 [P] [US3] Define usability/accessibility workflow criteria across phases in specs/005-full-maxwell-pathway/milestones.md
- [X] T024 [P] [US3] Define maintainability and adoption risk thresholds with mitigations in specs/005-full-maxwell-pathway/milestones.md
- [X] T025 [US3] Link reference scenario coverage thresholds to milestones in specs/005-full-maxwell-pathway/reference-scenarios.md
- [X] T026 [US3] Add milestone evidence-pack completeness criteria and approval readiness checklist in specs/005-full-maxwell-pathway/milestones.md
- [X] T031 [US3] Define measurable visualization quality gates (truthfulness, interpretability, consistency) per phase in specs/005-full-maxwell-pathway/milestones.md

**Checkpoint**: User Story 3 independently supports phased go/no-go decisions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment, consistency, and readiness for stakeholder review.

- [X] T027 [P] Cross-reference all acceptance scenarios to artifacts in specs/005-full-maxwell-pathway/spec.md
- [X] T028 [P] Normalize terminology and definitions across pathway artifacts in specs/005-full-maxwell-pathway/pathway.md
- [X] T029 Validate success criteria SC-001..SC-005 coverage matrix in specs/005-full-maxwell-pathway/checklists/requirements.md
- [X] T030 Final artifact-readiness review with navigation links and cross-document index in specs/005-full-maxwell-pathway/pathway.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Setup; blocks all user stories.
- **Phase 3 (US1)**: Depends on Foundational completion.
- **Phase 4 (US2)**: Depends on Foundational completion; can run after US1 or in parallel when staffed.
- **Phase 5 (US3)**: Depends on Foundational completion; may reference US1/US2 artifacts but remains independently testable.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on other stories.
- **US2 (P2)**: Starts after Foundational; uses common framework and produces independent comparison outputs.
- **US3 (P3)**: Starts after Foundational; validates milestones independently of strategy selection.

### Parallel Opportunities

- Setup tasks T002-T004 can run in parallel.
- Foundational tasks T009-T010 can run in parallel after T006-T008 baseline exists.
- US1 tasks T013-T014 can run in parallel.
- US2 tasks T018-T019 can run in parallel.
- US3 tasks T023-T024 can run in parallel.
- Polish tasks T027-T028 can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Map pathway requirements FR-001..FR-014, VQ-001, VQ-002, PF-001, PF-002, and A11Y-001 in specs/005-full-maxwell-pathway/pathway.md"
Task: "T014 [US1] Add stakeholder review checklist in specs/005-full-maxwell-pathway/checklists/requirements.md"
```

## Parallel Example: User Story 2

```bash
Task: "T018 [US2] Add candidate option entries in specs/005-full-maxwell-pathway/evaluation-framework.md"
Task: "T019 [US2] Define viability gates in specs/005-full-maxwell-pathway/evaluation-framework.md"
```

## Parallel Example: User Story 3

```bash
Task: "T023 [US3] Define usability/accessibility criteria in specs/005-full-maxwell-pathway/milestones.md"
Task: "T024 [US3] Define maintainability/adoption thresholds in specs/005-full-maxwell-pathway/milestones.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1)
4. Validate US1 independent test with stakeholders before moving forward

### Incremental Delivery

1. Deliver US1 roadmap artifact
2. Add US2 objective strategy evaluation
3. Add US3 milestone validation framework
4. Finish with cross-cutting polish and final review package

### Parallel Team Strategy

1. Team aligns on Setup + Foundational artifacts
2. Split by story after Foundational:
   - Analyst A: US1 pathway + checkpoints
   - Analyst B: US2 scoring framework + options
   - Analyst C: US3 milestones + validation criteria
3. Rejoin for Phase 6 consistency pass
