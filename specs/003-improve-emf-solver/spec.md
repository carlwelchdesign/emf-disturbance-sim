# Feature Specification: Improve EMF Solver Fidelity

**Feature Branch**: `003-improve-emf-solver`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "Have we fully use Maxwell's solver or is there still work we can do to make this even better?"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scientific Field Comparison (Priority: P1)

As a user, I can view multiple EMF emitters interacting in a scientifically grounded way so I can distinguish propagation, interference, and field overlap without the display collapsing into decorative motion.

**Why this priority**: This is the core value of the feature: the visualization must read as a field interaction study, not a generic animation.

**Independent Test**: Can be tested by loading a scene with multiple emitters and confirming the display shows visible constructive and destructive overlap, directional influence, and distance falloff.

**Acceptance Scenarios**:

1. **Given** two or more active emitters with different phases, **When** the scene is displayed, **Then** the field shows regions of reinforcement and cancellation.
2. **Given** emitters placed at different distances and orientations, **When** the scene is displayed, **Then** nearer and directional sources influence the field more strongly than distant or off-axis sources.

---

### User Story 2 - Solver Fidelity Controls (Priority: P2)

As a user, I can adjust how physically grounded or visually simplified the field model appears so I can compare clearer teaching visuals with more faithful scientific behavior.

**Why this priority**: Users need a way to tune realism versus clarity without changing the experience into a black box.

**Independent Test**: Can be tested by changing fidelity settings and confirming the same scene produces visibly different levels of detail, smoothing, and field responsiveness.

**Acceptance Scenarios**:

1. **Given** a baseline scene, **When** the fidelity setting is increased, **Then** field structure, overlap, and directionality become more detailed.
2. **Given** a baseline scene, **When** the fidelity setting is reduced, **Then** the visualization remains understandable while using simpler field behavior.

---

### User Story 3 - Interference Study Presets (Priority: P3)

As a user, I can load curated scenarios with multiple emitters and clear explanations so I can quickly study field behavior under common interaction patterns.

**Why this priority**: Presets make the feature easier to explore and help users understand what the solver is showing.

**Independent Test**: Can be tested by selecting presets and confirming each preset produces a distinct, explainable field pattern.

**Acceptance Scenarios**:

1. **Given** a preset with aligned emitters, **When** it is loaded, **Then** the scene emphasizes reinforcement and stable propagation.
2. **Given** a preset with out-of-phase emitters, **When** it is loaded, **Then** the scene emphasizes cancellation and unstable overlap.

### Edge Cases

- What happens when all emitters are inactive? The scene should remain stable and clearly indicate that no active field is present.
- What happens when several emitters share nearly identical frequency and phase? The display should still separate individual sources while showing stronger overlap.
- What happens when emitter settings push beyond normal operating ranges? Values should remain bounded and the scene should not explode into unreadable artifacts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST visualize field interaction from multiple emitters in a way that shows overlap, reinforcement, and cancellation.
- **FR-002**: The system MUST distinguish between direct propagation, interference regions, and weaker far-field influence.
- **FR-003**: The system MUST preserve visible source identity when multiple emitters are active at once.
- **FR-004**: The system MUST allow users to compare a clearly labeled simpler field view against a clearly labeled more physically grounded field view.
- **FR-005**: The system MUST support scenarios with two, three, four, and five emitters.
- **FR-006**: The system MUST make it clear when a scene has no active emitters by showing an explicit empty-state cue instead of an active field visualization.
- **FR-007**: The system MUST keep field intensity and direction changes bounded so the scene remains readable.
- **FR-008**: The system MUST support curated presets that each communicate a different field behavior.
- **FR-009**: The system MUST allow users to understand whether they are viewing a teaching simplification or a more scientific approximation through visible labels or controls.
- **FR-010**: The system MUST maintain consistent interpretation of frequency, phase, amplitude, and distance across the visualization.

### Key Entities *(include if feature involves data)*

- **Emitter**: A source of electromagnetic behavior with location, strength, phase, frequency, bandwidth, and directional influence.
- **Field Sample**: A sampled point in space that reflects combined contributions from all active emitters.
- **Interaction Zone**: A region where emitters significantly reinforce, cancel, or destabilize one another.
- **Solver Profile**: A user-selectable fidelity setting that controls how detailed or simplified the field behavior appears.
- **Scenario Preset**: A curated arrangement of emitters and settings designed to illustrate a specific field behavior.

### Non-Functional Requirements *(include if applicable)*

**Visualization Quality** (when feature includes EMF rendering):
- **VQ-001**: Visualization MUST maximize data-ink ratio and avoid decorative clutter.
- **VQ-002**: Visualization MUST show field behavior directly through particles, vectors, or other truthful field cues.
- **VQ-003**: Visualization MUST minimize misleading visual effects that do not correspond to field behavior.
- **VQ-004**: Visualization MUST preserve graphical integrity so stronger fields appear stronger and weaker fields appear weaker.
- **VQ-005**: Color treatment MUST remain consistent, perceptually clear, and accessible.

**Performance**:
- **PF-001**: The field display MUST maintain 60 FPS during normal interaction with up to three active emitters and MUST avoid sustained drops below 45 FPS when up to five active emitters are active.
- **PF-002**: The scene MUST apply source-parameter changes and preset switches within 250 ms and remain responsive to camera input while those updates are applied.
- **PF-003**: When frame rate falls below 30 FPS for more than one second, the scene MUST reduce visual detail automatically while preserving readable field cues.

**Accessibility**:
- **A11Y-001**: All controls used to inspect or adjust field behavior MUST be reachable without requiring pointer-only input.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of users can correctly identify reinforcement versus cancellation in a multi-emitter scene after brief exploration.
- **SC-002**: Users can switch between simplified and more scientific views and see a clear difference in field behavior within one interaction.
- **SC-003**: Multi-emitter scenes with up to five emitters remain readable and responsive during normal use.
- **SC-004**: Users report that the display better matches their expectation of a scientific EM field interaction study rather than a generic animation.

## Assumptions

- The feature extends the current field model rather than replacing it with a fully rigorous numerical Maxwell solver.
- The primary audience is technical and scientific users who value clarity, comparison, and explanation.
- The visualization should favor interpretability over exhaustive physical completeness.
- Existing emitter controls and scenario presets will be reused and refined rather than redesigned from scratch.
