# Research

## 1. Renderer work is the main bottleneck

- **Decision**: Focus optimization on the R3F field renderer and camera sync path before considering solver rewrites.
- **Rationale**: The lab already has CPU field calculation, adaptive LOD, and FPS-based quality fallback; the "clunky" feel is more likely from per-frame scene work than from missing features in the solver layer.
- **Alternatives considered**: Replacing the simulation backend first, moving to a GPU backend, or adding a worker pipeline immediately.

## 2. Reuse the current quality controls

- **Decision**: Build on the existing `lod`, `solverProfile`, `fieldLineDensity`, and FPS monitor instead of adding a second quality system.
- **Rationale**: The store already tracks performance and can downshift quality automatically; reusing that model keeps the change small and consistent.
- **Alternatives considered**: Introducing a new render-budget object, duplicating quality flags in the component tree, or hard-coding source-count thresholds in the renderer.

## 3. Reduce per-frame allocations

- **Decision**: Treat object churn in `FieldVisualization` as a first-class target: cache geometry/material setup, minimize temporary vectors, and avoid rebuilding stable structures every frame.
- **Rationale**: The current render loop does a lot of repeated vector math and transient object creation across every particle and source, which is the kind of work that creates visible jank in Three.js scenes.
- **Alternatives considered**: Leaving the loop unchanged and only lowering particle counts, or compensating with more aggressive throttling.

## 4. Keep the physics story intact

- **Decision**: Preserve the current field math and interaction cues while optimizing presentation and sampling strategy.
- **Rationale**: The spec is about fidelity and readability, so optimization should not flatten phase, overlap, or cancellation cues into a generic animation.
- **Alternatives considered**: Simplifying the solver enough to guarantee performance, removing interaction cues, or replacing the field model with a purely decorative cloud.

## 5. No external interface contracts

- **Decision**: Do not create API contracts for this plan.
- **Rationale**: The feature is internal to the lab UI and renderer; there is no public API surface to version separately.
- **Alternatives considered**: Adding a contract folder for a private UI workflow.
