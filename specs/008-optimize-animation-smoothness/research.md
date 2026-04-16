# Research: Optimize Animation Smoothness

## 1) Smoothness target and acceptance posture

- **Decision**: Use a user-perceived smoothness target centered on stable motion continuity during animation and camera interaction, with 60fps-class behavior as the practical benchmark for normal lab scenarios.
- **Rationale**: The feature request is explicitly about visible sluggishness; users experience this as stutter, delayed input response, and unstable camera movement.
- **Alternatives considered**:
  - Optimize only for average frame rate (rejected: hides stutter spikes and poor interaction feel)
  - Optimize only camera controls but ignore animation loop (rejected: mixed workflows still feel sluggish)

## 2) Render bottleneck isolation strategy

- **Decision**: Prioritize profiling and reduction of per-frame CPU work in field visualization updates and avoid unnecessary geometry/attribute churn during active animation.
- **Rationale**: Sluggish animation in interactive R3F scenes is commonly dominated by repeated per-frame computations and excessive buffer updates.
- **Alternatives considered**:
  - Increase visual quality settings globally to mask artifacts (rejected: worsens performance risk)
  - Rely on browser/device upgrades (rejected: not a product fix)

## 3) State-update and render-loop coordination

- **Decision**: Reduce render-triggering state subscriptions to minimal selectors and isolate fast-changing animation values from broader store updates.
- **Rationale**: Over-broad subscriptions and avoidable re-renders can degrade responsiveness even when GPU load is moderate.
- **Alternatives considered**:
  - Keep current subscription breadth and tune only math constants (rejected: does not address coordination overhead)
  - Introduce broad throttling for all interactions (rejected: may make controls feel laggy)

## 4) Camera interaction smoothness behavior

- **Decision**: Preserve direct input feel by keeping rotate/pan/zoom updates immediate while limiting expensive scene recalculations during active manipulation.
- **Rationale**: Users judge quality primarily through camera response; delayed or jumpy movement undermines trust and usability.
- **Alternatives considered**:
  - Aggressive camera damping to hide stutter (rejected: can feel unresponsive)
  - Disable animation during interaction (rejected: breaks expected workflow continuity)

## 5) Degraded mode and observability

- **Decision**: Define explicit transient degraded behavior under load (e.g., temporary density/detail reduction) and surface clear runtime signals when degradation is active.
- **Rationale**: Constitution requires safe, observable operation and graceful handling rather than silent failure.
- **Alternatives considered**:
  - No user-facing signal during degradation (rejected: invisible failures)
  - Hard-stop rendering on load spikes (rejected: breaks interaction continuity)

## 6) Scope boundary for Maxwell mode

- **Decision**: Keep Maxwell field hidden and unchanged during this optimization cycle; improvements target currently active visualization and camera workflows only.
- **Rationale**: The feature description explicitly defers Maxwell work and prioritizes smooth baseline interaction now.
- **Alternatives considered**:
  - Re-enable Maxwell with partial optimization (rejected: scope expansion and higher risk)
  - Block all optimization until Maxwell is complete (rejected: delays needed user-facing improvements)
