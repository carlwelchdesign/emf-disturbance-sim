# Data Model: Optimize Animation Smoothness

## Entities

| Entity | Key Fields | Notes |
|---|---|---|
| `InteractionSession` | `sessionId`, `startedAt`, `endedAt`, `interactionTypes` (`rotate/pan/zoom`), `isAnimationActive`, `smoothnessRating` | Captures a continuous user interaction period for acceptance evaluation |
| `AnimationFrameSample` | `sampleId`, `timestamp`, `frameDurationMs`, `isDropped`, `activeSceneMode`, `degradedModeActive` | Represents sampled frame behavior over time |
| `InputResponseSample` | `sampleId`, `timestamp`, `inputType`, `responseLatencyMs`, `wasJanky` | Captures responsiveness of camera control inputs |
| `PerformanceDegradationEvent` | `eventId`, `startedAt`, `endedAt`, `triggerCategory`, `userSignalShown`, `recoveryState` | Tracks transient degraded behavior and recovery |
| `SmoothnessSummary` | `summaryId`, `windowStart`, `windowEnd`, `interactionSmoothPercent`, `animationSmoothPercent`, `severeLagReports` | Aggregated view used to compare against success criteria |

## Relationships

- One `InteractionSession` contains many `InputResponseSample` records.
- One `InteractionSession` overlaps many `AnimationFrameSample` records.
- One `PerformanceDegradationEvent` references a range of `AnimationFrameSample` records.
- One `SmoothnessSummary` aggregates many sessions/samples within its time window.

## Validation Rules

- `frameDurationMs` must be positive and within plausible runtime bounds.
- `responseLatencyMs` must be non-negative and tied to a valid input type.
- `InteractionSession` must include at least one interaction type when marked complete.
- `PerformanceDegradationEvent` must include recovery state before closure.
- `SmoothnessSummary` percentages must be in `[0, 100]` and derived from non-empty sample sets.
- Maxwell-hidden scope marker must remain true for this feature’s acceptance runs.

## State Transitions

`InteractionSession` lifecycle:

1. `idle` -> `active` (user starts rotate/pan/zoom input)
2. `active` -> `active-with-animation` (animation running during interaction)
3. `active` or `active-with-animation` -> `degraded` (transient load signal triggered)
4. `degraded` -> `active-with-animation` (recovery complete)
5. `active` or `active-with-animation` -> `completed` (interaction ends)

`PerformanceDegradationEvent` lifecycle:

1. `detected` -> `signaled` (user-visible indicator shown)
2. `signaled` -> `recovering` (load drops and quality ramps back)
3. `recovering` -> `resolved` (normal mode restored)
