# Quickstart: Implement Maxwell Solver

## Prerequisites

1. Install dependencies:
   - `npm install`
2. Ensure you are on branch:
   - `006-implement-maxwell-solver`

## 1) Launch the lab

1. Run:
   - `npm run dev`
2. Open:
   - `http://localhost:3000/lab`

## 2) Configure a full-wave run

1. In Simulation Setup, create/select a simulation configuration.
2. Set method family to **FDTD**.
3. Define domain extent and discretization intent.
4. Define material regions with required EM properties.
5. Define boundary conditions for all required domain surfaces.
6. Confirm keyboard-only navigation can reach all setup controls (A11Y-001 gate).

## 3) Execute and monitor

1. Submit run and confirm status transitions:
   - `queued` -> `running` -> `completed_unvalidated` -> (`validated` or `non_validated`)
2. Verify queue visibility and deterministic status reporting for concurrent runs (PF-003).
3. For invalid setup, confirm immediate rejection with corrective guidance.
4. For unstable runtime behavior, confirm run is marked unstable/non-validated and not presented as validated.

## 4) Inspect outputs in visualizer

1. Load completed run into existing visualization workflow.
2. Confirm E and B fields are available with time-indexed context.
3. Confirm at least two derived metrics are shown with explicit definition and validity scope.
4. Confirm context labels show scenario, time state, and selected metric.

## 5) Validate correctness and performance gates

1. Execute validation scenario mapping and threshold checks.
2. Confirm validated status only for passing runs.
3. Verify baseline runtime target (<= 5 minutes for supported baseline scenarios).
4. Verify interaction responsiveness target (95% interactions <= 1 second on completed results).

## 6) Verification commands before handoff

- `npm test`
- `npm run lint`
- `npm run type-check`
- `npm run build`

## 7) Browser safety verification (Phase 7)

1. **Pre-run memory budget gate (BS-001/BS-002)**:
   - Configure a run with grid dimensions exceeding the scenario-class safe-zone defaults (e.g., baseline class: >200×200×200 grid points or >10,000 time steps).
   - Submit the run. Confirm the system blocks submission with a user-facing explanation including the estimated memory usage and the budget limit.

2. **Auto-degrade mode (BS-003)**:
   - Load a result set that pushes memory pressure above 80% of the 512 MB budget.
   - Confirm that mesh resolution reduces and/or active visualization layers are limited.
   - Confirm a visible notification indicating degraded mode is active.

3. **OOM-risk fallback path (BS-004)**:
   - Simulate or trigger OOM-risk condition during result loading (e.g., load an oversized time-series result).
   - Confirm the system activates a fallback mode (summary-only or disable time-series navigation) instead of crashing.
   - Confirm the user receives a clear message with a recovery path.

4. **Run cap enforcement (BS-005)**:
   - Load 3 full-resolution result sets simultaneously.
   - Attempt to load a 4th. Confirm the system blocks it with a message identifying which run must be deactivated to proceed.

## 8) Verification Results (Post-Implementation)

Run verified against the following gate commands:

```bash
npm test && npm run lint && npm run type-check && npm run build
```

**Test Suite**: All Maxwell solver tests pass (unit, integration, performance)
- Phase 1–2 (Setup/Foundational): T001–T010 ✅
- Phase 3 (US1 FDTD Solver): T011–T022 ✅  
- Phase 4 (US2 UI Analysis): T023–T030 ✅
- Phase 5 (US3 Validation/Errors): T031–T038 ✅
- Phase 6 (Polish): T039–T051 ✅
- Phase 7 (Browser Safety): T052–T056 ✅

**SC-001**: 13 validation scenarios defined, all with FDTD applicability ✅
**SC-002**: All completed runs produce E, B + 2 derived metrics ✅
**BS-001–BS-005**: Memory budget, degrade, OOM guard, run cap all implemented ✅
**A11Y-001**: All UI components have keyboard nav, tabIndex, ARIA roles ✅

## 9) Performance Verification Matrix (PF-002/VQ-001/VQ-002)

| Requirement | Check | Pass Condition | Test Location |
|-------------|-------|----------------|---------------|
| PF-001 | Baseline run completes in ≤5 min | `runtimeMs <= 300,000` | `__tests__/performance/` |
| PF-002 | 95th percentile interaction ≤1s | `p95(latencies) <= 1000ms` | `__tests__/performance/maxwell-interaction-latency.test.ts` |
| PF-003 | Queue accepts 10 concurrent runs | Orchestrator `maxQueueSize=10` | `__tests__/integration/maxwell/queue-capacity.test.ts` |
| VQ-001 | Poynting magnitude non-negative | All values ≥ 0 | `__tests__/integration/maxwell/visual-integrity-thresholds.test.tsx` |
| VQ-001 | Energy density physically consistent | All values ≥ -1e-30 | `__tests__/integration/maxwell/visual-integrity-thresholds.test.tsx` |
| VQ-002 | All metrics have explicit units/definition | Non-empty `units`, `definition`, `validityScope` | `__tests__/integration/maxwell/visual-integrity-thresholds.test.tsx` |
| VQ-002 | Validation status explicit in output | `'validated' \| 'non_validated'` | `__tests__/integration/maxwell/visual-integrity-thresholds.test.tsx` |
