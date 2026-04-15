# Research: Implement Maxwell Solver

## 1) Method-family baseline and extension strategy

- **Decision**: Use FDTD as the initial production method family, with a strategy interface (`MethodFamilyProfile` + solver adapter contract) for future FEM/DGTD additions.
- **Rationale**: FDTD aligns directly with time-domain E/B evolution requirements and supports strict step-wise stability/correctness checks while fitting the current TypeScript simulation-module architecture.
- **Alternatives considered**: FEM-first (better complex-geometry flexibility but heavier initial complexity), DGTD-first (high-order accuracy but larger implementation surface), single hard-coded solver path (faster now but blocks FR-014 extensibility).

## 2) Stability and invalid-configuration enforcement

- **Decision**: Enforce pre-run validation (domain/material/boundary consistency + discretization sanity) and runtime instability guards (CFL condition breach, divergence growth, NaN/Inf detection), with immediate status transitions to `rejected` or `unstable`.
- **Rationale**: Prevents misleading “validated” outcomes and satisfies FR-011/FR-012/FR-013 and SC-005.
- **Alternatives considered**: Warn-only model (too risky for trust), post-run instability labeling only (late failure feedback), no automatic halting (can propagate invalid outputs).

## 3) Validation pipeline and correctness thresholds

- **Decision**: Adopt scenario-driven validation where each run can map to a reference scenario and produce standardized error metrics (field amplitude error, phase error, energy-flow consistency) with pass/fail gates before `validated` status.
- **Rationale**: Directly supports FR-009/FR-010, SC-001, and reproducible run review (FR-016).
- **Alternatives considered**: Manual/visual validation only (non-reproducible), single aggregate error metric (insufficient diagnostic value), optional threshold enforcement (weak trust guarantees).

## 4) Performance and scalability envelope

- **Decision**: Use bounded baseline profile presets (grid size, time-step count, queue concurrency) and explicit run telemetry (`queued_at`, `started_at`, `completed_at`, interaction latency markers) to evaluate PF-001/PF-002/PF-003.
- **Rationale**: Gives deterministic observability for runtime targets and queue behavior without requiring immediate infrastructure changes.
- **Alternatives considered**: Unbounded user-configurable runs (high instability/perf risk), hard fail on any non-baseline run (overly restrictive), performance claims without telemetry (not auditable).

## 5) Output integration and visualization integrity

- **Decision**: Standardize `FieldOutputSet` payloads (time-indexed E/B vectors + derived metrics + validation status + provenance) consumed by existing `/lab` analysis panels and visualization components.
- **Rationale**: Preserves workflow continuity (FR-008) while meeting constitution requirements for truthful, interpretable field rendering and metric context.
- **Alternatives considered**: Separate solver-only viewer (workflow split), lossy scalar-only output (fails FR-006), unlabelled derived metrics (interpretability risk).

## 6) Contract scope determination

- **Decision**: Create an internal feature contract in `/contracts/` describing solver run submission, lifecycle statuses, validation semantics, and output schema expectations.
- **Rationale**: While no public external API is exposed, this feature introduces a multi-module interface boundary that benefits from explicit contract definition to prevent cross-layer drift.
- **Alternatives considered**: Skip contracts entirely (higher integration ambiguity), encode only in TypeScript comments (insufficient cross-team planning artifact).

## 7) SC-006: Method-Family Extension Spike Evidence

**Evidence location**: `app/lab/modules/maxwell/spikes/method-extension-spike.ts`

**Spike validation**:
- A `FEMSpikeAdapter` class was created implementing the same `IMethodFamilyAdapter` interface as `FDTDAdapter`
- The spike produces `FieldOutputSet` and `DerivedMetricResult[]` outputs using the same `buildFieldOutput` and `computeDerivedMetrics` utilities
- The outputs are structurally compatible with `ValidationPipeline.evaluate()`
- No changes were required to core orchestrator, validation pipeline, or UI components
- The user workflow (submit → execute → validate → inspect) remains identical

**Conclusion**: The phased method-family architecture allows adding FEM/DGTD methods without redefining user workflows, satisfying SC-006 and FR-014.
