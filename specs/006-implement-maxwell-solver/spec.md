# Feature Specification: Implement Maxwell Solver

**Feature Branch**: `[006-implement-maxwell-solver]`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "Implement a full-wave Maxwell solver capability in this app. Build an execution path that numerically solves time-domain Maxwell equations without quasi-static simplifications, supports at least one concrete method family initially (FDTD recommended), defines solver domain/material/boundary-condition inputs, provides validated field outputs (E, B, derived metrics), and integrates results into the existing EMF visualizer UI for interactive analysis. Include strict correctness validation against known analytical/reference scenarios, performance/scalability targets, error handling for unstable/invalid configurations, and a phased architecture that allows adding additional methods (FEM/DGTD/etc.) later."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run a trustworthy full-wave simulation (Priority: P1)

As an EM analyst, I need to configure and run a full-wave time-domain simulation of Maxwell equations so I can evaluate electromagnetic behavior that quasi-static approximations cannot represent.

**Why this priority**: This is the core user value of the feature; without a valid full-wave solve path, no other capability matters.

**Independent Test**: Configure a representative scenario with defined domain, materials, and boundary conditions; run the solver; confirm validated E/B outputs and completion status are produced.

**Acceptance Scenarios**:

1. **Given** a valid simulation setup, **When** the analyst executes a full-wave solve, **Then** the system completes and returns time-domain E and B field outputs with metadata describing simulation validity.
2. **Given** a reference scenario with known expected behavior, **When** the solve completes, **Then** error metrics are reported and satisfy predefined correctness thresholds.

---

### User Story 2 - Analyze solver outputs in the existing visualizer (Priority: P2)

As an EM analyst, I need full-wave solver results to appear in the existing visualizer workflows so I can interactively inspect fields and derived metrics without leaving the app.

**Why this priority**: Solver output is only useful if users can inspect and compare it in their normal analysis interface.

**Independent Test**: Run a solve and verify that the resulting E/B fields and derived metrics can be loaded, navigated, and interpreted in the current UI interaction model.

**Acceptance Scenarios**:

1. **Given** a completed simulation result, **When** the analyst opens it in the visualizer, **Then** the UI presents E, B, and selected derived metrics for interactive exploration.
2. **Given** multiple result snapshots or runs, **When** the analyst switches views, **Then** the UI preserves interpretability and clearly indicates context (scenario, time state, and metric selection).

---

### User Story 3 - Prevent invalid or unstable simulation use (Priority: P3)

As a simulation user, I need clear validation and error feedback for unstable or invalid configurations so I can correct inputs and avoid misleading conclusions.

**Why this priority**: Preventing incorrect scientific interpretation is critical for trust and safe adoption.

**Independent Test**: Submit invalid/unstable configurations and confirm the system blocks or flags execution with specific corrective guidance and no ambiguous “successful” output.

**Acceptance Scenarios**:

1. **Given** an invalid configuration, **When** the user attempts execution, **Then** the system rejects the run and identifies actionable correction steps.
2. **Given** a numerically unstable run condition, **When** execution detects instability, **Then** the system halts or marks results as non-validated and explains the issue.

---

### Edge Cases

- Extremely large domains or long time windows that exceed practical runtime/memory limits; must be blocked pre-run with clear guidance on safe parameter ranges.
- User runs a scenario that would push estimated client memory usage over safe browser limits; system must warn and block before execution.
- Material definitions with non-physical or contradictory properties.
- Boundary condition combinations that create unstable or undefined behavior.
- Solver outputs that partially complete due to interruption or resource exhaustion.
- Derived metric requests that are undefined for the available field data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a full-wave execution path that solves time-domain Maxwell equations without quasi-static simplifications.
- **FR-002**: System MUST support at least one concrete initial method family for full-wave solving, with FDTD included in initial capability scope.
- **FR-003**: System MUST allow users to define simulation domain inputs, including spatial extent, grid resolution, and time-step policy (auto/manual), with documented defaults, allowed ranges, and rejection behavior for invalid combinations.
- **FR-004**: System MUST allow users to define material inputs for simulation regions, including required electromagnetic property parameters.
- **FR-005**: System MUST allow users to define boundary-condition inputs and apply them consistently across the domain.
- **FR-006**: System MUST produce time-domain electric field (E) and magnetic field (B) outputs for completed simulations.
- **FR-007**: System MUST provide derived electromagnetic metrics from solved fields, including at minimum Poynting vector magnitude and electromagnetic energy density, with documented formula definitions and units.
- **FR-008**: System MUST integrate simulation results into existing visualizer workflows for interactive inspection and comparison.
- **FR-009**: System MUST define and execute a solver correctness validation workflow against known analytical/reference scenarios, including scenario mapping, metric calculation, and scenario-level error reporting.
- **FR-010**: System MUST define and enforce predefined pass/fail correctness threshold rules as a validation gate before outputs can be marked as validated.
- **FR-011**: System MUST detect and report invalid configurations before execution when possible.
- **FR-012**: System MUST detect and report numerical instability conditions during execution and prevent misleading “validated” status.
- **FR-013**: System MUST provide user-facing error messages that identify cause category and recommended corrective actions.
- **FR-014**: System MUST define phased capability boundaries so additional method families (including FEM and DGTD) can be added without redefining user workflows.
- **FR-015**: System MUST define performance and scalability target envelopes for supported simulation classes and report whether runs meet those targets.
- **FR-016**: System MUST record run provenance (inputs, validation scenario mapping, and outcome status) sufficient for reproducible review.

### Key Entities *(include if feature involves data)*

- **Simulation Configuration**: User-defined setup containing domain, materials, boundary conditions, run controls, and intent metadata.
- **Method Family Profile**: Capability definition for a solver method family, including supported problem classes and validation requirements.
- **Field Output Set**: Time-indexed E/B field results with validity status and associated simulation context.
- **Derived Metric Result**: Computed user-facing metric derived from field outputs, with definition and validity scope.
- **Validation Scenario**: Analytical/reference case with expected outcomes and acceptance thresholds.
- **Validation Report**: Run-specific record of correctness checks, errors, pass/fail status, and performance/scalability outcomes.

### Non-Functional Requirements *(include if applicable)*

**Visualization Quality**:
- **VQ-001**: Full-wave result visualizations MUST preserve truthful representation of field magnitude, directionality, and temporal evolution.
- **VQ-002**: Visual outputs MUST remain interpretable for side-by-side comparison of runs, methods, and time states.

**Performance**:
- **PF-001**: For the baseline supported scenario class, users MUST receive simulation completion outcomes within 5 minutes for standard runs.
- **PF-002**: For interactive analysis, 95% of viewport interactions on completed result sets MUST respond within 1 second.
- **PF-003**: The system MUST support at least 10 simultaneously queued (not parallel) simulation runs — i.e., 10 runs can occupy the queue at the same time and are processed sequentially by a single browser-side worker — while preserving per-run status visibility and deterministic completion/error reporting. True parallel execution of solver loops is out of scope for V1.

**Browser Safety & Resource Constraints**:
- **BS-001**: The system MUST enforce a maximum estimated client-side memory budget per simulation run (initial target: 512 MB per run result loaded in browser) and block pre-run submission if the estimate exceeds the budget, with a user-facing explanation.
- **BS-002**: The system MUST enforce maximum grid-size and time-step-count limits per run class to prevent browser OOM/crash conditions, with documented default safe-zone values per scenario class.
- **BS-003**: The system MUST auto-degrade rendering fidelity (e.g., reduce 3D mesh resolution, limit active visualization layers) when estimated real-time memory pressure exceeds a defined safety threshold, and notify the user that degraded mode is active.
- **BS-004**: The system MUST detect and surface OOM-risk conditions during result loading and offer a fallback path (e.g., load summary only, disable time-series navigation) rather than crashing the browser tab.
- **BS-005**: The system MUST prevent more than a configurable number of full-resolution result sets from being simultaneously loaded in the browser visualization context (initial cap: 3 active runs).

**Accessibility**:
- **A11Y-001**: All simulation setup, execution control, and result-inspection workflows MUST be operable via keyboard-only interaction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a validation suite of at least 12 analytical/reference scenarios, at least 95% pass predefined correctness thresholds for E/B field behavior.
- **SC-002**: 100% of completed runs include E, B, and at least 2 derived metrics with explicit validity status visible to users.
- **SC-003**: At least 90% of test users can configure, run, and inspect a baseline full-wave scenario end-to-end without facilitator intervention.
- **SC-004**: For baseline supported scenarios, at least 90% of runs complete within the defined standard runtime target envelope.
- **SC-005**: 100% of invalid or unstable test configurations are either blocked pre-run or clearly labeled non-validated before user export/share actions.
- **SC-006**: At least one additional method-family extension spike (non-production) can be evaluated using the same phase and validation framework without changing the core user workflow definition.

## Assumptions

- The existing EMF visualizer remains the primary interaction surface for simulation result analysis.
- Initial release scope prioritizes one production-ready method family (FDTD) before multi-method parity.
- A curated set of trusted analytical/reference scenarios is available for correctness validation.
- Users running baseline scenarios have access to compute resources consistent with current app deployment assumptions.
- Export/persistence behavior for solver outputs follows existing product data-governance standards unless expanded in a later feature.
