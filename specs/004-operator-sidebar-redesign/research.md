# Research

## 1. Sidebar information architecture for high-density operator workflows

- **Decision**: Use a fixed, intent-first section order with semantic headers: Simulation Setup, Active Entities, Selected Entity, Visualization Controls, Analysis/Measurements, System/View.
- **Rationale**: Operator workflows in high-stakes systems are sequence-driven (setup -> entity tuning -> interpretation -> navigation). Stable hierarchy lowers memory load and reduces control-hunting time.
- **Alternatives considered**: Flat stacked sections (current model), dynamic section reordering, and tabbed modes that hide too much context.

## 2. Stateful selection as the primary editing model

- **Decision**: Keep source list as inventory/navigation only; route per-source editing exclusively through a dedicated Selected Entity panel keyed to selection state.
- **Rationale**: Inline editing in list rows creates high visual competition and error-prone edits when many sources exist.
- **Alternatives considered**: Inline expandable rows in source list, modal editors, and always-visible all-source control blocks.

## 3. Progressive disclosure strategy for advanced controls

- **Decision**: Expose critical controls by default (frequency, power, position, active state); collapse advanced signal controls (phase, spectral width, antenna/orientation detail) under explicit advanced groups.
- **Rationale**: Operators need immediate access to mission-critical controls while preserving deep tunability without overwhelming first-pass scan.
- **Alternatives considered**: Showing all controls by default, hiding advanced controls behind separate pages, and one-click "simple mode" toggles that fragment context.

## 4. Reducing slider fatigue with dual-mode precision controls

- **Decision**: For precision parameters, use coupled controls (compact slider + numeric input) with synchronized values; keep range presets where domain-relevant.
- **Rationale**: Sliders are fast for coarse tuning but weak for exact values; dual-mode controls support both rapid and precise workflows.
- **Alternatives considered**: Sliders only, numeric fields only, and detached popover editors for precision entry.

## 5. Multi-selection behavior in source editing

- **Decision**: Define bulk-edit contract now (shared fields editable, conflicting values shown as mixed state, non-shared controls disabled), even if initial implementation enables single-select by default.
- **Rationale**: The spec requires scalable source workflows; formalizing multi-select semantics prevents incompatible future behavior.
- **Alternatives considered**: No multi-select support, full independent inline edit for each selected source, and hidden batch actions disconnected from selected entity panel.

## 6. Accessibility and keyboard flow in dense sidebars

- **Decision**: Use keyboard-linear section traversal with explicit focus order, section expand/collapse via keyboard, and visible selection/focus/mixed-value states.
- **Rationale**: Dense operator tooling must remain navigable without pointer dependence and must communicate state transitions clearly.
- **Alternatives considered**: Pointer-first interactions with minimal keyboard affordances.

## 7. Non-functional alignment with existing architecture

- **Decision**: Implement within existing `ControlPanel`/`useLabStore` architecture and MUI design system tokens; preserve current simulation and rendering engines.
- **Rationale**: This feature is an interaction architecture redesign, not a simulation rewrite; localizing change reduces risk.
- **Alternatives considered**: Rebuilding control surface with new state libraries or introducing separate panel frameworks.
