# Implementation Plan: Implement Maxwell Solver

**Branch**: `006-implement-maxwell-solver` | **Date**: 2026-04-15 | **Spec**: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/spec.md`  
**Input**: Feature specification from `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/spec.md`

## Summary

Add a trustworthy full-wave Maxwell execution path (FDTD-first) to the existing lab by introducing a method-family-aware solver pipeline, validated E/B outputs with derived metrics, strict validation/instability handling, and seamless visualization integration. The design keeps user workflows stable while enabling later FEM/DGTD expansion behind the same configuration, run lifecycle, and result interfaces.

## Technical Context

**Language/Version**: TypeScript 5.x on Next.js 14 / React 18  
**Primary Dependencies**: Next.js, React, Zustand, Three.js, React Three Fiber, MUI, Jest + Testing Library  
**Storage**: In-memory runtime state plus file-based/spec documentation artifacts under `/specs/006-implement-maxwell-solver/`  
**Testing**: Jest unit, integration, and rendering behavior tests (`npm test`, `npm run lint`, `npm run type-check`)  
**Target Platform**: Browser-based web app served by Next.js (`/app/lab`)  
**Project Type**: Web application (single project with interactive simulation frontend and shared simulation modules)  
**Performance Goals**:  
- Baseline class run completes within 5 minutes (PF-001)  
- 95% of visualization interactions respond within 1 second on completed runs (PF-002)  
- Queue and track at least 10 simulation runs with deterministic run-state reporting (PF-003)  
**Constraints**:  
- No quasi-static simplifications in full-wave path  
- Validated/non-validated status must be explicit and block misleading outputs  
- Keyboard-operable setup/run/analyze workflow (A11Y-001)  
- Preserve graphical integrity and truthful field encoding (VQ-001, VQ-002, Constitution Principle VI)  
**Scale/Scope**:  
- One production method family initially (FDTD)  
- Validation suite of at least 12 reference scenarios  
- Architecture hooks for future FEM/DGTD method-family additions without UI workflow redesign

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Review

- **I. Feature-Boundary Architecture**: PASS — planned changes stay within `app/lab/modules`, `app/lab/hooks`, `app/lab/types`, and existing UI components; no route-layer business logic sprawl.
- **II. Dependency Inversion and SOLID Delivery**: PASS — introduce solver abstractions (`MethodFamilyProfile`, run orchestrator, validation pipeline) behind interfaces, preserving single-responsibility modules.
- **III. Test and Validation Gates**: PASS — plan requires solver correctness tests, rendering/integration checks, and instability/error-path tests before merge.
- **IV. Design System and Accessibility Compliance**: PASS — UI integration remains in MUI-based control/analysis surfaces with keyboard-operable run configuration and status messaging.
- **V. Observable, Safe Operations**: PASS — run provenance, queue visibility, instability detection, and safe failure states are explicit design requirements.
- **VI. Visualization Quality and Graphical Integrity**: PASS — output mapping requires physically truthful field scaling, clear metric definitions, and non-deceptive visual encodings.

Gate Result: **PASS** (no blocking constitution violations).

### Post-Design Gate Review

- **I. Feature-Boundary Architecture**: PASS — data model and contracts keep execution, validation, and visualization concerns separated by module boundary.
- **II. Dependency Inversion and SOLID Delivery**: PASS — method-family strategy contract and validation contract allow future solvers without changing UI workflows.
- **III. Test and Validation Gates**: PASS — research/design artifacts define explicit threshold checks, regression validation suite, and instability gate behavior.
- **IV. Design System and Accessibility Compliance**: PASS — quickstart and contracts include keyboard-first run control and status feedback requirements.
- **V. Observable, Safe Operations**: PASS — run lifecycle/status, provenance, and queue observability modeled directly in artifacts.
- **VI. Visualization Quality and Graphical Integrity**: PASS — derived metric and field output contracts preserve scale/phase integrity and contextual labeling.

Post-Design Result: **PASS** (no blockers introduced).

## Project Structure

### Documentation (this feature)

```text
/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── maxwell-solver-contract.md
└── tasks.md  # Generated later by /speckit.tasks
```

### Source Code (repository root)

```text
/Users/carl.welch/Documents/Github Projects/emf-visualizer/
├── app/
│   └── lab/
│       ├── components/
│       │   ├── Analysis/
│       │   ├── Canvas3D/
│       │   └── ControlPanel/
│       ├── hooks/
│       ├── lib/
│       ├── modules/
│       │   ├── compute/
│       │   ├── scenario/
│       │   └── simulation/
│       └── types/
├── __tests__/
└── specs/
```

**Structure Decision**: Use the existing single-project Next.js app structure. Extend the current simulation module stack (`/app/lab/modules/simulation`, `/app/lab/modules/compute`) and typed state/UI integration (`/app/lab/types`, `/app/lab/hooks`, `/app/lab/components`) rather than introducing a parallel service layer.

## Phase Plan

### Phase 0: Outline & Research

1. Confirm FDTD-first method-family approach and extension contract for FEM/DGTD.
2. Define stability, correctness-threshold, and validation-suite best practices for time-domain Maxwell runs.
3. Establish run queue/provenance pattern consistent with current Zustand-driven architecture.
4. Define visualization truthfulness rules for E/B vectors and derived metrics in current 3D + analysis panels.

Output: `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/research.md`

### Phase 1: Design & Contracts

1. Model entities for solver configuration, run lifecycle, field outputs, validation, and method profiles.
2. Define internal interface contract for run submission, status transitions, output payloads, and validation gate semantics.
3. Draft quickstart for end-to-end: configure, execute, validate, inspect, and troubleshoot unstable/invalid runs.
4. Update agent context for new technology and workflow terms.

Outputs:
- `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/data-model.md`
- `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/contracts/maxwell-solver-contract.md`
- `/Users/carl.welch/Documents/Github Projects/emf-visualizer/specs/006-implement-maxwell-solver/quickstart.md`

### Phase 2: Implementation Planning Stop Point

Planning ends after artifact generation and constitution re-check. Task breakdown (`tasks.md`) and implementation execution are intentionally deferred to subsequent workflow commands.

## Complexity Tracking

No constitution violations found. No complexity exemptions required.
