# Data Model: Implement Maxwell Solver

## Entities

| Entity | Key Fields | Notes |
|---|---|---|
| `SimulationConfiguration` | `id`, `name`, `methodFamily`, `domain`, `materials[]`, `boundaryConditions[]`, `runControls`, `createdAt` | User-defined full-wave setup (FR-001/003/004/005/014) |
| `MethodFamilyProfile` | `id`, `family` (`fdtd`, `fem`, `dgtd`), `status`, `supportedDimensions`, `stabilityRules`, `validationRequirements` | Capability descriptor allowing phased solver expansion (FR-002/014) |
| `DomainDefinition` | `extent`, `discretizationIntent`, `gridResolution`, `coordinateSystem` | Solver domain + discretization intent for user-facing setup |
| `MaterialRegion` | `id`, `geometryRef`, `permittivity`, `permeability`, `conductivity`, `lossModel`, `isPhysical` | Region-level EM properties with physical validity checks |
| `BoundaryConditionDefinition` | `id`, `type`, `surfaceSelector`, `parameters`, `compatibilityNotes` | Boundary-condition application metadata |
| `SimulationRun` | `runId`, `configurationId`, `status`, `statusReason`, `queuedAt`, `startedAt`, `endedAt`, `runtimeMs`, `queuePosition` | Queue and lifecycle tracking (PF-003, FR-015) |
| `FieldOutputSet` | `runId`, `timeSteps[]`, `electricFieldSeries`, `magneticFieldSeries`, `samplingMetadata`, `validationStatus` | Time-indexed E/B outputs (FR-006) |
| `DerivedMetricResult` | `runId`, `metricName`, `definition`, `seriesOrSnapshots`, `units`, `validityScope` | Derived metrics with explicit meaning/context (FR-007) |
| `ValidationScenario` | `scenarioId`, `name`, `referenceType`, `expectedBehavior`, `thresholds`, `applicableMethods` | Analytical/reference benchmark definition (FR-009/010) |
| `ValidationReport` | `runId`, `scenarioId`, `checks[]`, `aggregateStatus`, `errorMetrics`, `thresholdEvaluation`, `reviewNotes` | Run-specific correctness report (FR-009/010/016) |
| `RunProvenanceRecord` | `runId`, `inputSnapshot`, `methodVersion`, `environmentInfo`, `validationMappings`, `outcomeStatus` | Reproducibility/audit artifact (FR-016) |
| `RunErrorRecord` | `runId`, `category`, `code`, `message`, `recommendedActions[]`, `blocking` | User-facing actionable error payloads (FR-013) |

## Relationships

- One `SimulationConfiguration` references one `MethodFamilyProfile`, one `DomainDefinition`, many `MaterialRegion`, and many `BoundaryConditionDefinition`.
- One `SimulationConfiguration` can produce many `SimulationRun` entries over time.
- One `SimulationRun` produces at most one `FieldOutputSet`, many `DerivedMetricResult`, zero-or-one `ValidationReport`, and zero-or-many `RunErrorRecord`.
- One `ValidationScenario` can be mapped to many `SimulationRun` records; each mapped run yields one `ValidationReport`.
- One `SimulationRun` has exactly one `RunProvenanceRecord`.

## Validation Rules

- `SimulationConfiguration.methodFamily` must be supported and enabled (`fdtd` required for initial release).
- Domain discretization must satisfy method stability requirements before run submission (e.g., CFL-compatible step constraints for FDTD).
- Material properties must be finite, physically admissible, and non-contradictory for assigned regions.
- Boundary-condition combinations must be method-compatible; incompatible combinations are rejected pre-run.
- `SimulationRun.status = validated` is allowed only if `ValidationReport.aggregateStatus = pass`.
- Any detected instability (divergence, NaN/Inf, rule breach) forces run status to `unstable` or `failed`, never `validated`.
- Derived metrics must include a definition, unit, and validity scope; undefined metric requests generate `RunErrorRecord`.

## State Transitions

`SimulationRun.status` transitions:

1. `draft` -> `queued` (submission accepted)
2. `queued` -> `running` (worker/engine start)
3. `running` -> `completed_unvalidated` (numerical execution complete, pending validation)
4. `completed_unvalidated` -> `validated` (all threshold checks pass)
5. `completed_unvalidated` -> `non_validated` (checks fail but outputs retained with warning)
6. `queued|running` -> `rejected` (pre-run validation late failure)
7. `running` -> `unstable` (instability detection)
8. `running` -> `failed` (runtime/system error)
9. `queued` -> `cancelled` (user/system cancellation)

`MethodFamilyProfile.status` transitions:

- `planned` -> `experimental` -> `production` (or `deprecated`) as additional families are introduced under FR-014.
