# Quickstart: Optimize Animation Smoothness

## Prerequisites

1. Install dependencies:
   - `npm install`
2. Ensure branch:
   - `008-optimize-animation-smoothness`

## 1) Launch the lab

1. Run:
   - `npm run dev`
2. Open:
   - `http://localhost:3000/lab`

## 2) Prepare baseline scenarios (Maxwell hidden)

1. Confirm Maxwell field remains hidden.
2. Scenario A: single active source with animation running.
3. Scenario B: multiple active sources with animation running.
4. Scenario C: rapid mixed rotate/pan/zoom while animation runs.

### Success-criteria scenario matrix (SC-001, SC-002, SC-003, SC-004)

| Success Criterion | Scenario(s) | Measurement Method | Pass Threshold |
|---|---|---|---|
| SC-001 Interaction smoothness | A, B, C | 5s windows: interaction smooth % | >= 95% smooth windows |
| SC-002 Animation smoothness | A, B, C | 5s windows: animation smooth % | >= 95% smooth windows |
| SC-003 2-minute explore task | C | Participant severe-lag reports | >= 90% complete w/o severe lag |
| SC-004 Sluggishness reduction | A, B, C | Baseline vs optimized incident delta | >= 75% reduction |

## 3) Verify smooth camera controls

1. Perform continuous rotate for at least 30 seconds.
2. Perform continuous pan for at least 30 seconds.
3. Perform repeated zoom in/out for at least 30 seconds.
4. Confirm movement appears smooth and directly tracks input without delayed jumps.

## 4) Verify smooth animation playback

1. Start animation and observe at least 2 minutes.
2. Confirm motion continuity is stable without persistent stutter.
3. While animation runs, repeat moderate rotate/pan/zoom and confirm playback remains smooth.

## 5) Verify degraded behavior

1. Stress interaction with rapid mixed input.
2. Confirm transient degradation, if triggered, is signaled clearly to the user.
3. Confirm the app recovers to normal smooth behavior without freezing.

## 6) Run validation commands

- `npm test`
- `npm run lint`
- `npm run type-check`

## 7) Smoothness evaluation log

| Session | Scenario | Interaction smooth? | Animation smooth? | Severe lag reported? | Notes |
|---|---|---|---|---|---|
| 1 | A | ☐ yes / ☐ no | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| 2 | B | ☐ yes / ☐ no | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| 3 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | ☐ yes / ☐ no | |

Acceptance guidance:
- Interaction smoothness target: >= 95% of sampled interaction periods.
- Animation smoothness target: >= 95% of sampled playback periods.
- Severe lag incidence target: reduced materially from baseline observations.

### SC-003 2-minute explore-task outcomes

| Participant | Scenario | Completed 2 minutes? | Severe lag reported? | Notes |
|---|---|---|---|---|
| P1 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P2 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P3 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P4 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P5 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P6 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P7 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P8 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P9 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |
| P10 | C | ☐ yes / ☐ no | ☐ yes / ☐ no | |

SC-003 summary:
- Completion rate: ___ / ___ = ___%
- Pass (>= 90%): ☐ yes / ☐ no

### SC-004 baseline vs optimized sluggishness log

| Scenario | Baseline sluggish incidents | Optimized sluggish incidents | Reduction % | Pass (>= 75%) |
|---|---:|---:|---:|---|
| A |  |  |  | ☐ |
| B |  |  |  | ☐ |
| C |  |  |  | ☐ |
| Overall |  |  |  | ☐ |

Data capture template:
- Baseline observation date:
- Optimized observation date:
- Observer(s):
- Incident counting rule used:

### Validation command outcomes

| Command | Result | Notes |
|---|---|---|
| `npm test` | ☑ pass / ☐ fail | 46/46 suites, 239/239 tests passed |
| `npm run lint` | ☑ pass / ☐ fail | ESLint completed with no errors |
| `npm run type-check` | ☑ pass / ☐ fail | `tsc --noEmit` completed with no errors |

### Navigation validation checklist (US1)

- [ ] Continuous rotate remains smooth for >= 30s with no delayed jumps
- [ ] Continuous pan remains smooth for >= 30s with no delayed jumps
- [ ] Repeated zoom in/out remains smooth for >= 30s with no delayed jumps
- [ ] Mixed rotate/pan/zoom transitions remain smooth

### Animation/accessibility/visual-integrity checklist (US2)

- [ ] Animation remains smooth over >= 2 minutes in Scenario A
- [ ] Animation remains smooth over >= 2 minutes in Scenario B
- [ ] Animation remains smooth under moderate camera interaction
- [ ] Non-color cue support remains present for interaction interpretation
- [ ] Color mapping remains accessible and perceptually coherent
- [ ] Visualization stays data-first with no decorative non-data overlays

### Non-Maxwell scope and degraded-state checklist (US3)

- [ ] Maxwell visualization remains hidden/off in this feature scope
- [ ] Degraded-state message appears when telemetry enters degraded mode
- [ ] Degraded-state message clears on recovery
- [ ] Core non-Maxwell workflows remain functional

## 8) Artifact references

- Spec: `specs/008-optimize-animation-smoothness/spec.md`
- Plan: `specs/008-optimize-animation-smoothness/plan.md`
- Research: `specs/008-optimize-animation-smoothness/research.md`
- Data model: `specs/008-optimize-animation-smoothness/data-model.md`
- Contract: `specs/008-optimize-animation-smoothness/contracts/animation-performance-contract.md`
- Tasks: `specs/008-optimize-animation-smoothness/tasks.md`
