# Interference Point Cloud Internal Contract

## Purpose

Define the internal boundary between Maxwell field outputs and the interference point-cloud rendering/analysis experience so visualization remains physically meaningful, interpretable, and consistent with constitution quality gates.

## 1. Point-Cloud Render Input Contract

### Input: `RenderInterferencePointCloudRequest`

- `runId: string`
- `timeStep: number`
- `fieldOutput: FieldOutputSet`
- `emitters: EmitterDescriptor[]`
- `encodingProfileId: string`
- `viewBounds: DomainExtent`

### Rules

- `fieldOutput.electricFieldSeries` and `fieldOutput.magneticFieldSeries` must include data for the requested `timeStep`.
- All sampled points must map to valid coordinates inside `viewBounds`.
- If input data is incomplete for the requested step, request is rejected with a structured render error.

## 2. Interference Classification Contract

### `InterferenceClassification`

- `sampleId: string`
- `normalizedIntensity: number` (0..1)
- `interferenceBand: "high" | "medium" | "low"`
- `constructiveIndicator: number` (0..1)
- `destructiveIndicator: number` (0..1)
- `spatialPosition: Vec3`

### Rules

- Classification must be deterministic for identical input payloads and thresholds.
- Band boundaries must be mutually exclusive and collectively exhaustive for rendered samples.
- High and low bands must remain distinguishable in both color and non-color cues.

## 3. Rendering Cue Contract

### `PointCueEncoding`

- `sampleId: string`
- `rgbColor: [number, number, number]`
- `pointSize: number`
- `luminanceWeight: number`
- `visibilityAlpha: number`

### Rules

- Intensity cannot be communicated by color only.
- Cue ranges must prevent visual saturation that masks neighboring band structure.
- Samples below configured noise floor may be suppressed only if spatial continuity remains interpretable.

## 4. Render State Contract

### `PointCloudRenderState`

- `runId: string`
- `timeStep: number`
- `status: "sampling" | "encoding" | "rendered" | "updating" | "degraded" | "error"`
- `visiblePointCount: number`
- `bandDistribution: { high: number; medium: number; low: number }`
- `validationStatus: "validated" | "non_validated"`
- `degradeReason?: string`

### Rules

- `status = rendered` requires non-empty valid cues unless the source data is truly empty.
- `bandDistribution` counts must match `visiblePointCount`.
- `validationStatus` from field output must be preserved and surfaced in related analysis overlays.

## 5. Interpretation Summary Contract

### `InterferenceInterpretationSummary`

- `runId: string`
- `timeStep: number`
- `strongestRegionLabel: string`
- `weakestRegionLabel: string`
- `overlapRegionPresence: boolean`
- `consistencyToken: string`

### Rules

- Summary must be derived from current rendered classification, not guessed heuristics.
- Repeated rendering of same run/step must produce identical `consistencyToken`.

## 6. Error Contract

### `InterferenceRenderError`

- `runId?: string`
- `category: "payload" | "classification" | "rendering" | "resource"`
- `code: string`
- `message: string`
- `recommendedActions: string[]`
- `blocking: boolean`

### Rules

- Errors must provide actionable guidance.
- Blocking errors prevent transition to `rendered`.
- Degraded mode is preferred over hard failure for recoverable resource pressure.
