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
