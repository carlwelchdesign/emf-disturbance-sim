# Maxwell Solver Internal Contract

## Purpose

Define the internal interface boundary between configuration/UI workflows, simulation execution, validation pipeline, and visualization consumption for the full-wave Maxwell solver feature.

## 1. Run Submission Contract

### Input: `SubmitSimulationRunRequest`

- `configurationId: string`
- `methodFamily: "fdtd" | "fem" | "dgtd"`
- `domain: DomainDefinition`
- `materials: MaterialRegion[]`
- `boundaryConditions: BoundaryConditionDefinition[]`
- `runControls: { timeWindow: number; timeStepHint: number; samplingPlan: SamplingPlan }`
- `validationScenarioId?: string`
- `requestedMetrics: string[]`

### Output: `SubmitSimulationRunResponse`

- `runId: string`
- `accepted: boolean`
- `initialStatus: "queued" | "rejected"`
- `errors?: RunErrorRecord[]`

### Rules

- `accepted = false` if pre-run validation fails.
- Rejection must include actionable `errors[]` with corrective guidance.

## 2. Run Status Contract

### Status Enum

- `draft`
- `queued`
- `running`
- `completed_unvalidated`
- `validated`
- `non_validated`
- `unstable`
- `failed`
- `cancelled`
- `rejected`

### `SimulationRunStatusEvent`

- `runId: string`
- `status: SimulationRunStatus`
- `timestamp: string` (ISO-8601)
- `reasonCode?: string`
- `message?: string`
- `queuePosition?: number`

### Rules

- `validated` requires validation pass.
- `unstable`, `failed`, `rejected`, and `non_validated` must never be surfaced as validated in UI.

## 3. Field Output Contract

### `FieldOutputSet`

- `runId: string`
- `timeAxis: number[]`
- `electricFieldSeries: FieldTensor[]`
- `magneticFieldSeries: FieldTensor[]`
- `samplingMetadata: { grid: GridSpec; units: string; coordinateSystem: string }`
- `validationStatus: "validated" | "non_validated"`

### Rules

- E/B arrays must align with `timeAxis`.
- Output metadata must preserve units and spatial interpretation for truthful rendering.

## 4. Derived Metrics Contract

### `DerivedMetricResult`

- `runId: string`
- `metricName: string`
- `definition: string`
- `units: string`
- `values: number[] | SnapshotMetric[]`
- `validityScope: string`
- `sourceFieldDependencies: ("E" | "B")[]`

### Rules

- Minimum of two derived metrics required for completed runs in target scope.
- Undefined metric requests return structured error and do not silently fabricate values.

## 5. Validation Contract

### `ValidationRequest`

- `runId: string`
- `scenarioId: string`
- `thresholdProfileId: string`

### `ValidationReport`

- `runId: string`
- `scenarioId: string`
- `checks: ValidationCheckResult[]`
- `errorMetrics: Record<string, number>`
- `aggregateStatus: "pass" | "fail"`
- `thresholdEvaluation: Record<string, "pass" | "fail">`

### Rules

- Validation checks execute before assigning `validated`.
- Failed checks force `non_validated` (or `unstable` where applicable).

## 6. Provenance Contract

### `RunProvenanceRecord`

- `runId: string`
- `inputSnapshotHash: string`
- `methodFamily: string`
- `methodVersion: string`
- `validationScenarioId?: string`
- `outcomeStatus: SimulationRunStatus`
- `createdAt: string`

### Rules

- Every run writes one provenance record.
- Provenance must be sufficient for reproducible review.

## 7. Error Contract

### `RunErrorRecord`

- `runId: string`
- `category: "configuration" | "stability" | "resource" | "validation" | "system"`
- `code: string`
- `message: string`
- `recommendedActions: string[]`
- `blocking: boolean`

### Rules

- Error messages must include actionable correction guidance.
- Blocking errors prevent transition to `running` or `validated`.

## 8. Browser Safety Contract

### `MemoryBudgetEstimate`

- `estimatedBytes: number` — computed as `Nx × Ny × Nz × Nt × bytesPerFieldComponent` where `bytesPerFieldComponent = 8` (Float64 per E/B component, 6 components total = 48 bytes/cell/step)
- `budgetBytes: number` — enforced cap (default: 512 MB = 536,870,912 bytes)
- `withinBudget: boolean` — `estimatedBytes <= budgetBytes`
- `scenarioClass: string` — scenario class key used to look up safe-zone defaults
- `safeZoneDefaults: SafeZoneDefaults` — defaults for the scenario class

### `SafeZoneDefaults`

- `maxGridPoints: number` — maximum total grid cells (`Nx × Ny × Nz`); default per class:
  - `"baseline"`: 200×200×200 = 8,000,000 cells
  - `"medium"`: 100×100×100 = 1,000,000 cells
  - `"coarse"`: 50×50×50 = 125,000 cells
- `maxTimeSteps: number` — maximum time iterations; default per class:
  - `"baseline"`: 10,000 steps
  - `"medium"`: 5,000 steps
  - `"coarse"`: 1,000 steps

### `DegradeControllerConfig`

- `memoryPressureThreshold: number` — fraction of budget at which auto-degrade activates (default: `0.8` = 80% of the 512 MB cap = 429 MB)
- `degradeActions: ("reduceMeshResolution" | "limitVisualizationLayers" | "pauseTimeSeriesNav")[]`
- `activeDegradeActions: string[]` — actions currently in effect (empty = normal mode)
- `notifyUser: boolean` — MUST be `true` when any degrade action is active

### `OOMGuardEvent`

- `runId: string`
- `triggeredAt: "result_loading" | "time_series_nav" | "visualization_render"`
- `estimatedPeakBytes: number`
- `fallbackActivated: boolean`
- `fallbackMode: "summary_only" | "disable_time_series" | "reduce_result_scope"`
- `userMessageShown: boolean` — MUST be `true` when fallback is activated

### `RunCapStatus`

- `activeFullResolutionRuns: number`
- `cap: number` — configurable; default `3`
- `capExceeded: boolean`
- `blockedRunId?: string` — run blocked due to cap; user must deactivate an existing run to proceed

### Rules

- **BS-001**: `MemoryBudgetEstimate` MUST be computed and checked before accepting any run submission. If `!withinBudget`, reject with `RunErrorRecord.category = "resource"` and include the estimate and budget values in the error message.
- **BS-002**: Grid dimensions and time-step count MUST be validated against `SafeZoneDefaults` for the run's scenario class before submission is accepted. Violations produce a blocking `RunErrorRecord`.
- **BS-003**: `DegradeControllerConfig.memoryPressureThreshold` defaults to `0.8`. When real-time memory pressure exceeds this threshold, the degrade controller MUST activate the configured `degradeActions` and set `notifyUser = true`.
- **BS-004**: `OOMGuardEvent.userMessageShown` MUST be `true` whenever a fallback is activated. The fallback mode must be clearly communicated to the user with a path to return to full mode (e.g., load a smaller result set).
- **BS-005**: `RunCapStatus.capExceeded = true` MUST block new full-resolution result set loading. The system MUST show `blockedRunId` in the rejection message and offer a path to deactivate an existing run.
