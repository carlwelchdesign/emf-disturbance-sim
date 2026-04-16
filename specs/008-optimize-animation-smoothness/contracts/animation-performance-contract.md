# Animation Performance Internal Contract

## Purpose

Define the internal boundary for measuring and evaluating animation/camera smoothness in the non-Maxwell lab workflow, including degraded-mode signaling expectations.

## 1. Runtime Sampling Contract

### Input: `RecordRuntimeSampleRequest`

- `timestamp: number`
- `frameDurationMs: number`
- `interactionType: "rotate" | "pan" | "zoom" | "none"`
- `animationActive: boolean`
- `sceneMode: string`
- `maxwellVisible: boolean`

### Rules

- Samples with non-positive `frameDurationMs` are invalid and rejected.
- `maxwellVisible` must be `false` for this feature’s acceptance path.
- `interactionType` must be `none` only when there is no camera input.

## 2. Interaction Responsiveness Contract

### `InputResponseRecord`

- `eventId: string`
- `interactionType: "rotate" | "pan" | "zoom"`
- `inputTimestamp: number`
- `firstVisibleResponseTimestamp: number`
- `responseLatencyMs: number`
- `jankFlag: boolean`

### Rules

- `responseLatencyMs = firstVisibleResponseTimestamp - inputTimestamp`
- Negative latency values are invalid.
- Each record must map to an active interaction session.

## 3. Degraded Mode Contract

### `DegradationSignal`

- `active: boolean`
- `triggerCategory: "frame-overload" | "input-overload" | "resource-pressure"`
- `startedAt?: number`
- `userMessage: string`
- `recoveryState: "n/a" | "recovering" | "restored"`

### Rules

- When `active = true`, `userMessage` must be non-empty and understandable.
- Transition to `restored` requires `active = false`.
- Degraded mode must prefer reduced detail over hard interaction freeze.

## 4. Smoothness Evaluation Contract

### `SmoothnessWindowEvaluation`

- `windowStart: number`
- `windowEnd: number`
- `interactionSmoothPercent: number`
- `animationSmoothPercent: number`
- `severeLagIncidents: number`
- `meetsThreshold: boolean`

### Rules

- Percent values must be in `[0, 100]`.
- `meetsThreshold` is true only when both smoothness percentages satisfy configured acceptance targets.
- Evaluations must be reproducible for identical input sample windows.

## 5. Error Contract

### `PerformanceTrackingError`

- `category: "sampling" | "evaluation" | "degradation-signal"`
- `code: string`
- `message: string`
- `blocking: boolean`
- `recommendedActions: string[]`

### Rules

- Errors must include actionable remediation.
- Blocking errors must not silently suppress user interaction state.
