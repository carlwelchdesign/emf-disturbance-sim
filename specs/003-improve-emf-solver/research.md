# Research: Improve EMF Solver Fidelity

## 1. Solver approach

- **Decision**: Keep the field model Maxwell-inspired rather than replacing it with a full numerical solver.
- **Rationale**: The current product goal is a browser-interactive scientific visualization, not a research-grade solver. The existing approximation already supports phase, directionality, superposition, and vector outputs.
- **Alternatives considered**:
  - Full FDTD/FEM-style solver: rejected because it would be too expensive for the current scope and would risk degrading responsiveness.
  - Pure stylized animation: rejected because it would weaken the scientific credibility of the lab.

## 2. Spectral breadth

- **Decision**: Use a bandwidth-aware source model with sampled spectral averaging around each emitter's center frequency.
- **Rationale**: This broadens the visible footprint of each emitter and makes interference read more naturally across 2–5 source scenes.
- **Alternatives considered**:
  - Single-frequency only: rejected because it produces overly thin, brittle-looking interference.
  - Fully continuous spectral integration: rejected because it adds complexity without meaningful visual payoff for the browser target.

## 3. Multi-emitter interaction

- **Decision**: Preserve separate source identity while increasing overlap, cancellation, and reinforcement cues in shared regions.
- **Rationale**: Users need to see both the combined field and the contributing sources.
- **Alternatives considered**:
  - Merge all emitters into one field blob: rejected because it hides the underlying interactions.
  - Render each source independently with no compositing: rejected because it obscures interference.

## 4. Fidelity controls

- **Decision**: Expose a simple realism-versus-clarity control rather than multiple advanced solver toggles.
- **Rationale**: The product needs one understandable control surface for non-specialists and specialists alike.
- **Alternatives considered**:
  - Multiple solver-mode toggles: rejected because it would overcomplicate the interface.
  - No fidelity control: rejected because users explicitly want to compare scientific approximation against simpler teaching visuals.

## 5. Validation strategy

- **Decision**: Validate with type-checking, targeted physics tests, component tests, and a production build.
- **Rationale**: The feature crosses math, rendering, and interaction layers, so the lowest-cost useful validation is a mix of unit and integration checks.
- **Alternatives considered**:
  - Visual-only manual review: rejected because it misses regressions in solver behavior.
  - Heavy simulation benchmarking: rejected because it is out of proportion for this feature scope.
