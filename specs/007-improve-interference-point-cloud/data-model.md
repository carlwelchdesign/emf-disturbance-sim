# Data Model: Improve Interference Point Cloud

## Entities

| Entity | Key Fields | Notes |
|---|---|---|
| `Emitter` | `id`, `position`, `frequency`, `power`, `phase`, `active` | Existing source definition contributing to interference behavior |
| `MaxwellFieldSample` | `sampleId`, `position`, `timeStep`, `electricMagnitude`, `magneticMagnitude`, `compositeInterferenceScore` | Field sample mapped to a single point-cloud position |
| `InterferenceIntensityBand` | `bandId`, `label` (`high`, `medium`, `low`), `lowerBound`, `upperBound`, `encodingProfileRef` | Semantic interpretation tiers required by FR-004 |
| `PointCloudEncodingProfile` | `profileId`, `colorMapName`, `sizeRule`, `densityRule`, `luminanceRule`, `noiseFloorRule` | Rendering policy ensuring non-color cue redundancy and readability |
| `PointCloudRenderState` | `runId`, `currentStep`, `visibleSampleCount`, `activeBandDistribution`, `validationStatus`, `isDegraded` | Runtime state for active Maxwell point-cloud presentation |
| `InterferenceInterpretationSnapshot` | `snapshotId`, `runId`, `timeStep`, `strongestRegionDescriptor`, `weakestRegionDescriptor`, `bandCoverageMetrics` | Analysis-facing summary for user interpretation confidence checks |

## Relationships

- One `Emitter` contributes to many `MaxwellFieldSample` values.
- One `PointCloudRenderState` references many `MaxwellFieldSample` entries at a given step.
- One `PointCloudEncodingProfile` applies to many `InterferenceIntensityBand` mappings.
- One `PointCloudRenderState` computes one `activeBandDistribution` per active step.
- One `InterferenceInterpretationSnapshot` is derived from one `PointCloudRenderState` at one `timeStep`.

## Validation Rules

- Every visible point in the point cloud must correspond to a valid field sample position in the active run domain.
- `InterferenceIntensityBand` bounds must be non-overlapping and collectively cover all rendered normalized interference values.
- High/medium/low distinction must remain detectable using at least one non-color cue.
- Rendering must not introduce decorative geometry that has no field-data correspondence.
- `PointCloudRenderState` updates must preserve deterministic classification for identical input states.
- Single-emitter scenarios must still produce a valid `activeBandDistribution` without implying multi-emitter cancellation artifacts.
- Saturation control must prevent high values from collapsing neighboring band distinction.

## State Transitions

`PointCloudRenderState` lifecycle:

1. `idle` -> `sampling` (Maxwell output selected and step requested)
2. `sampling` -> `encoding` (sample values mapped into interference bands and cues)
3. `encoding` -> `rendered` (points displayed with active profile)
4. `rendered` -> `updating` (emitter or step change triggered)
5. `updating` -> `rendered` (stable refreshed cloud available)
6. `sampling|encoding|updating` -> `degraded` (resource guard applies reduced rendering mode)
7. `degraded` -> `rendered` (conditions recover and full mode restored)
8. Any state -> `error` (invalid payload or unrecoverable render condition)

`InterferenceInterpretationSnapshot` lifecycle:

1. `pending` -> `computed` (band coverage and strongest/weakest descriptors calculated)
2. `computed` -> `superseded` (new step or emitter update replaces snapshot)
