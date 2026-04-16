# Quickstart: Improve Interference Point Cloud

## Prerequisites

1. Install dependencies:
   - `npm install`
2. Ensure branch:
   - `007-improve-interference-point-cloud`

## 1) Launch lab

1. Run:
   - `npm run dev`
2. Open:
   - `http://localhost:3000/lab`

## 2) Prepare validation scenarios

1. Scenario A: single emitter (baseline coherence check).
2. Scenario B: two emitters with overlapping coverage (constructive/destructive distinction check).
3. Scenario C: closely spaced emitters (high-detail separation check).
4. Scenario D: dynamic emitter adjustments during active view (stability check).

## 3) Verify meaningful point-cloud rendering

1. Activate Maxwell field visualization.
2. Confirm the field appears as a point cloud rather than large opaque "beachball" volumes.
3. Confirm overlap regions are distinguishable from non-overlap regions in Scenario B.
4. Confirm high/medium/low intensity distinctions are perceivable at a glance.

## 4) Verify interpretation clarity

1. In Scenario B, identify strongest and weakest interference regions from the visualization only.
2. Repeat the same scenario reload and confirm interpretation remains consistent.
3. Confirm analysis context (if shown) aligns with visible point-cloud pattern.

## 5) Verify interaction stability

1. Adjust emitter location, phase, and power while viewing the active field.
2. Confirm point-cloud pattern updates reflect configuration changes without collapsing into indistinct blobs.
3. Confirm abrupt visual saturation does not obscure surrounding structure.

## 6) Verify edge-case behavior

1. Single-emitter scenario remains coherent and does not imply false multi-emitter cancellation.
2. Very low field values remain represented enough to preserve pattern continuity.
3. Very high local values remain bounded so nearby structures are still interpretable.
4. Closely spaced emitters still produce visible spatial variation.

## 7) Verify accessibility and quality gates

1. Confirm interference intensity is not conveyed by color alone (additional cue present).
2. Confirm visual encodings maintain readable contrast against scene background.
3. Confirm visualization remains data-first with minimal non-data geometry.

## 8) Verification commands before handoff

- `npm test`
- `npm run lint`
- `npm run type-check`

## 9) Evaluation rubric workflow (SC-001 / SC-002)

Use the following structured protocol for reference scenarios:

| Scenario | First-attempt strongest/weakest correct? (SC-001) | Clarity rating 1-5 (SC-002) | Notes |
|---|---|---|---|
| Scenario B (2 emitters overlap) | ☐ yes / ☐ no | ☐1 ☐2 ☐3 ☐4 ☐5 | |
| Scenario C (close emitters) | ☐ yes / ☐ no | ☐1 ☐2 ☐3 ☐4 ☐5 | |
| Scenario D (dynamic adjustments) | ☐ yes / ☐ no | ☐1 ☐2 ☐3 ☐4 ☐5 | |

Acceptance guidance:
- SC-001 target: >= 90% first-attempt strongest/weakest identification accuracy.
- SC-002 target: >= 85% of ratings are clear or better (4+).

## 10) Spec/task references

- Spec: `specs/007-improve-interference-point-cloud/spec.md`
- Plan: `specs/007-improve-interference-point-cloud/plan.md`
- Data model: `specs/007-improve-interference-point-cloud/data-model.md`
- Contract: `specs/007-improve-interference-point-cloud/contracts/interference-point-cloud-contract.md`
- Tasks: `specs/007-improve-interference-point-cloud/tasks.md`

## 11) Verification result log

Record command outcomes here:

- `npm test`: _pending_
- `npm run lint`: _pending_
- `npm run type-check`: _pending_
- Last verification run:
  - `npm test -- --runInBand`: ✅ Pass (`46/46` suites, `223/223` tests)
  - `npm run lint`: ✅ Pass
  - `npm run type-check`: ✅ Pass

## 12) Scenario evaluation results

Record SC-001/SC-002 outcomes from rubric execution:

- Run date: _pending_
- Participants: _pending_
- SC-001 result: _pending_
- SC-002 result: _pending_
