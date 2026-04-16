# Research: Improve Interference Point Cloud

## 1) Interference representation approach

- **Decision**: Use a point-cloud-first Maxwell interference view where each visible sample corresponds to a real field sample location and carries explicit interference-intensity semantics.
- **Rationale**: The existing "beachball" perception indicates non-data geometry dominates interpretation. A data-mapped point cloud improves causal readability between emitter layout and field behavior.
- **Alternatives considered**:
  - Keep volumetric sphere/mesh emphasis and tune styling only (rejected: still visually ambiguous and non-data heavy)
  - Use a purely decorative particle effect detached from sampled field values (rejected: violates graphical integrity)
  - Use only 2D slices (rejected for this feature scope because it weakens 3D spatial intuition in current workflows)

## 2) Interference intensity encoding semantics

- **Decision**: Define three interpretation bands (high/medium/low) from normalized field magnitude and overlap behavior, with required cue redundancy (color plus at least one non-color cue such as point size, density, or luminance contrast).
- **Rationale**: The spec requires immediate interpretability without guessing and explicitly forbids color-only communication. Band semantics provide stable language across rendering and analysis surfaces.
- **Alternatives considered**:
  - Continuous color-only gradient (rejected: fails accessibility requirement and can be perceptually unclear)
  - Binary strong/weak thresholding (rejected: too coarse to explain nuanced interference structure)
  - Manual user-tuned thresholds only (rejected for baseline because it harms repeatability)

## 3) Spatial truth and emitter causality

- **Decision**: Preserve strict world-space correspondence between sample locations and rendered points, and ensure overlap regions from multiple emitters remain visually distinguishable from single-emitter zones.
- **Rationale**: Users must relate "where emitters are" to "where interference occurs." Distorting or decorrelating positions would break core educational value and constitution integrity.
- **Alternatives considered**:
  - Screen-space post effects to fake depth/intensity (rejected: can sever physical interpretation)
  - Aggressive smoothing/interpolation that blurs source-specific structure (rejected: obscures constructive/destructive regions)

## 4) Interaction update stability

- **Decision**: Apply deterministic update behavior for emitter changes (same inputs -> same pattern class) and avoid abrupt visual collapse/saturation during frequent adjustments.
- **Rationale**: Repeatable interpretation and confidence depend on stable visual response during interactive tuning.
- **Alternatives considered**:
  - Fully stochastic particle behavior per frame (rejected: undermines consistency and trust)
  - Hard frame-by-frame threshold jumps (rejected: causes flicker and category instability)

## 5) Edge-case rendering policy

- **Decision**: Include explicit handling for single-emitter, very low-amplitude, very high-amplitude, and closely spaced emitter conditions with readable but truthful output.
- **Rationale**: These are direct spec edge cases and common failure points for field visualizations.
- **Alternatives considered**:
  - Clamp aggressively to hide extremes (rejected: can erase meaningful structure)
  - Always show full dynamic range raw (rejected: risks saturation or invisibility in practical scenes)

## 6) Internal interface contract scope

- **Decision**: Produce an internal visualization contract describing Maxwell field payload -> point-cloud encoding -> render-state obligations, including interpretation bands and quality gates.
- **Rationale**: This feature crosses solver output, rendering, and analysis boundaries; a contract prevents drift and preserves testability.
- **Alternatives considered**:
  - Rely on implicit component conventions only (rejected: too brittle across modules)
  - Put all constraints in ad-hoc inline comments (rejected: poor planning artifact discoverability)
