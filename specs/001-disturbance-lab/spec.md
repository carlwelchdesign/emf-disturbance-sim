# Feature Specification: EMF Disturbance and Interference Lab

**Feature Branch**: `002-disturbance-lab`  
**Created**: 2025-06-09  
**Status**: Draft  
**Input**: User description: "A refined single-page or hybrid interactive EMF visualization environment, architected with React, TypeScript, and the Next.js App Router, and powered by React Three Fiber and Three.js with localized state management. The document should clearly articulate product objectives, a principled UX and product strategy, phased V1 and V2 scope, representative usage scenarios, a disturbance modeling system, core simulation architecture, rendering pipeline, state management approach, testing strategy, and only essential open questions where further clarification is required."

## Clarifications

### Session 2026-04-14

- Q: What should the V1 visualization prioritize? → A: Particle / wavefront engine

### Session 2026-04-15

- Q: Should divergence/curl be explicitly shown in V1 as a conceptual overlay/animation, or kept for V2+? → A: V1 conceptual overlay (Recommended)

## Requirement Identification

- Requirements and success criteria are tracked using stable `FR-###` and `SC-###` identifiers so plan items, tasks, and checklists can map back to a single source requirement.

## Product Goals

This feature delivers a **prediction, analysis, and communication platform** for understanding EMF/RF electromagnetic exposure. The platform is structured as a three-layer model:

1. **Visualization Layer (V1 Core)**: Interactive 3D particle / wavefront visualization of electromagnetic fields, enabling users to understand field behavior and interference patterns
2. **Analysis Layer (V1)**: Tools for measuring, comparing, and analyzing field strength at specific points, with overlays showing exposure levels, near/far labels, and simplified safety indicators
3. **Professional Platform Layer (V2+)**: Reporting, assessment workflows, and EN 62232-oriented compliance outputs for professional users

The V1 focus is on establishing the visualization foundation with honest, communication-oriented UX that acknowledges model limitations and builds trust through transparency about accuracy boundaries.

### Primary Objectives

- **Prediction & Understanding**: Provide visual tools for predicting and understanding EMF/RF field behavior in real-world scenarios
- **Analysis & Measurement**: Enable users to analyze field strength, identify hotspots, and understand exposure levels relative to safety guidelines
- **Communication & Trust**: Create clear, honest visualizations that communicate uncertainty and model limitations, building trust through transparency
- **Practical V1 Scope**: Deliver a working motion-first visualization tool without overengineering; defer GPU acceleration, advanced physics, and professional reporting to future phases

### V1 Scope (MVP)

**Core Capabilities**:
- Single-page interactive 3D EMF/RF visualization with point sources rendered as a motion-first particle / wavefront engine
- Source/antenna modeling: configurable frequency, power, and position (V1: omnidirectional; beam steering deferred)
- Environment-aware simulation: basic 3D environment (room/space boundaries) with placeholder material properties
- Near-field vs far-field distinction: simplified inverse-distance model (full near-field modeling deferred to V2)
- Real-time visualization of field strength distribution using color-coded overlays, particle cadence, and wavefront motion
- Conceptual divergence/curl flow cues in V1 as an explanatory overlay, not a full solver
- Analysis overlays: field strength measurements at sample points, near/far labels, and basic exposure level indicators
- Interactive 3D camera controls (orbit, pan, zoom)
- Communication-oriented UX: honest language about model limitations, accuracy caveats, "estimated" vs "measured" labels
- Performance: CPU-based calculation for 3-5 sources (GPU acceleration deferred to V2)

**V1 Visualization Defaults**

- Default visualization mode: animated propagation
- Static field view is available as an explicit toggle for comparison
- The toggle appears in the Visualization Settings area as a labeled, keyboard-accessible control named "Animation Mode"
- Animation speed is user-adjustable in a bounded 0.5x-2.0x range centered on a default 1.0x baseline
- Animation speed scales visual playback only; it does not change source frequency, amplitude, or field magnitude
- Particle language uses small emissive dots with restrained halos and local drift; at the default camera distance, the particles should read as dots rather than streaks
- Core particle radius should remain within a small dot envelope (roughly 0.05-0.08 scene units), halo radius should remain within 2x-3x the core radius, and emissive intensity should stay within a restrained 0.6-1.5 visual scale
- Source ownership must remain visually legible in multi-source scenes through color, glow, or localized cadence changes
- Particle density is an independent visual channel from brightness and must not be the only way source strength is represented
- Higher source frequency should increase visible emission cadence and tighten spacing in a readable way; the relationship may be simplified but must remain monotonic

**V1 Environment Behavior**

- Room/space boundaries are visible in V1 and act as spatial context only
- Environment boundaries do not change field calculations in V1; attenuation/reflection behavior remains a V2 extension
- Environment dimensions are configurable within documented minimum and maximum bounds (default 20m x 20m x 8m, valid range 5m to 100m per axis)

**V1 Analysis Behavior**

- Divergence/curl cues are shown as a conceptual overlay with its own explanatory label and accuracy disclaimer
- Measurement points are capped at 5 simultaneously active points so analysis overlays remain readable
- Measurement readouts use rounded values (one decimal place by default) and unit labels rather than overly precise raw values

**V1 Scenario Presets**

- Clean Vacuum Propagation: baseline reference with one source and no disturbances
- Metal Barrier Reflection: teaches the difference between reflection and attenuation; conceptual in V1 unless a simple reflective cue is used
- Dense Wall Attenuation: lossy region that reduces amplitude conceptually
- Dual Source Interference: two emitters with phase controls for constructive/destructive behavior
- Noisy Electronics Environment: jitter and signal corruption emphasis
- Atmospheric Scatter: coherence reduction and diffusion emphasis
- Medium Transition: simplified medium change with apparent spacing/speed changes
- Polarization Showcase: advanced educational comparison preset

Applying a preset replaces the current scene by default, with a confirmation prompt when the current scene has been modified since the preset was loaded. Modified presets remain editable in-session and should be distinguishable from the original preset name.

**Out of Scope for V1**:
- GPU-accelerated compute (CUDA, WebGPU, or compute shaders)
- Advanced near-field modeling (reactive vs radiating fields)
- Richer 3D environment modeling (detailed materials, multi-story buildings, furniture)
- Beam steering and phased array antennas
- EN 62232 compliance reporting or professional assessment workflows
- Persistent storage, multi-user accounts, or mobile optimization
- Advanced physics: full Maxwell solver, dielectric modeling, reflections/diffractions

### V2 Scope (Future Enhancements)

- Advanced analysis overlays: heatmaps showing cumulative exposure, compliance threshold visualization
- Scenario management beyond curated presets: save/load common EMF configurations (home office, cell tower proximity, Wi-Fi mesh)
- Session persistence via local storage or URL parameters

**V2 - Professional Platform Layer**:
- GPU-accelerated compute for 20+ sources and large-scale simulations
- Advanced near-field modeling: reactive/radiating field distinction for accurate close-proximity predictions
- Richer 3D environment modeling: multi-material support (concrete, wood, metal), multi-story buildings, furniture
- Beam steering and phased array antennas: directional gain patterns, 5G beamforming scenarios
- EN 62232 compliance reporting: structured assessment reports, PDF export, compliance summaries
- Reporting workflows: generate professional-grade reports for clients, regulatory submissions
- Advanced physics: reflection/diffraction modeling, multi-path propagation
- Mobile-responsive controls and touch optimization

## UX/Product Approach

### Interaction Model

**Primary Workspace**: A 3D canvas occupies the majority of the viewport, showing a motion-first EMF particle / wavefront visualization in an interactive 3D environment.

**Control Panel**: A collapsible side panel or overlay provides:
- Source management (add/remove/select sources)
- Parameter sliders for selected source (frequency, amplitude, phase, position)
- Global visualization settings (particle density, color mapping, animation speed, static/animated propagation toggle)
- Performance/quality toggles

**Direct Manipulation**: Users can interact with sources directly in the 3D view:
- Click to select a source
- Drag to reposition sources in 3D space
- Visual feedback on hover and selection

### Visual Design Philosophy

- **Honest Communication**: Label all visualizations with accuracy caveats ("Estimated", "Simplified Model", "Not for Compliance Use")
- **Trust Through Transparency**: Clearly communicate model limitations, simplifications, and uncertainty bounds in the UI
- **Analysis-Oriented**: Provide overlays showing field strength values, near/far labels, safety thresholds, and measurement points
- **Progressive Disclosure**: Start with simple defaults; reveal advanced controls as users explore
- **Consistent Color Language**: Use intuitive color mapping for field strength with legend showing values and units
- **Bounded Motion Language**: Animation cadence, speed, and particle density must be described with enough specificity to distinguish them from one another

### First-Time User Experience

1. User lands on page with a single EMF source pre-configured at center
2. A dynamic particle / wavefront visualization is immediately visible
3. Prominent "Add Source" button invites exploration
4. Hovering over UI elements provides contextual tooltips
5. Default parameters are sensible and produce clear interference patterns

## User Scenarios & Testing

### User Story 1 - Observe Single EMF Source (Priority: P1)

A student wants to understand what an electromagnetic field "looks like" around a point source.

**Why this priority**: This is the foundational learning objective. Without understanding a single source, interference patterns have no context. This represents the minimal viable product that delivers educational value.

**Independent Test**: Can be fully tested by loading the page, observing the default source visualization, and adjusting its parameters. Delivers standalone value as an EMF field visualizer.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** user views the 3D canvas, **Then** a single EMF source is visible at the center with animated particles or wavefronts radiating outward
2. **Given** a source is displayed, **When** user adjusts the frequency slider, **Then** the wavefront cadence or spacing updates in real-time to reflect the new frequency
3. **Given** a source is displayed, **When** user adjusts the amplitude slider, **Then** the field strength visualization (color intensity, particle brightness, or band density) updates to reflect the new amplitude
4. **Given** a source is displayed, **When** user rotates the 3D camera, **Then** the view updates smoothly at a 60 FPS target with the wavefronts maintaining spatial relationship to the source

---

### User Story 2 - Add Multiple Sources and Observe Interference (Priority: P2)

A physics student wants to explore constructive and destructive interference between two or more EMF sources.

**Why this priority**: This is the core educational value proposition of an "interference lab." It builds directly on P1 by adding the ability to create multi-source scenarios, which is the primary reason users would choose this tool over a simpler static visualization.

**Independent Test**: Can be tested by adding 2-3 sources, positioning them at different locations, and observing interference patterns. Success is measured by visible interference fringes and the ability to create recognizable patterns (e.g., double-slit-like interference).

**Acceptance Scenarios**:

1. **Given** a single source exists, **When** user clicks "Add Source", **Then** a new EMF source appears at a default position with the particle / wavefront visualization immediately updating
2. **Given** two sources with identical frequency exist, **When** sources are positioned close together, **Then** interference patterns (constructive and destructive) are visible where the particle / wavefronts overlap
3. **Given** two sources exist, **When** user adjusts the phase of one source, **Then** the interference pattern shifts in real-time, showing phase relationship impact
4. **Given** multiple sources exist, **When** user drags a source to a new position, **Then** the interference pattern updates in real-time as the source moves
5. **Given** three or more sources exist, **When** all are visible, **Then** the visualization maintains a 60 FPS target with a 30 FPS floor under load

---

### User Story 3 - Manipulate Source Parameters (Priority: P2)

A user wants to experiment with different EMF parameters to understand their effect on field behavior and interference.

**Why this priority**: Parameter manipulation is essential for exploration and learning. It's grouped with P2 because it enhances the multi-source scenario but also applies to single-source exploration.

**Independent Test**: Can be tested by selecting any source and adjusting frequency, amplitude, and phase controls, then observing corresponding visual changes. Success is measured by real-time visual feedback for each parameter change.

**Acceptance Scenarios**:

1. **Given** a source is selected, **When** user increases frequency, **Then** wavefront spacing tightens and particle cadence increases
2. **Given** a source is selected, **When** user increases amplitude, **Then** field strength indicators (color saturation, brightness, or particle density) increase proportionally
3. **Given** a source is selected, **When** user adjusts phase from 0° to 180°, **Then** the field pattern shifts spatially, and interference patterns with other sources change
4. **Given** multiple sources exist, **When** user changes a parameter on one source, **Then** only that source's field updates, and interference recalculates for affected regions

---

### User Story 4 - Navigate 3D Space (Priority: P1)

A user wants to view the EMF field from different angles and distances to understand its three-dimensional structure.

**Why this priority**: 3D camera control is foundational to the "3D visualization" value proposition. Without it, the tool is essentially 2D. This is P1 because it's part of the minimum viable 3D experience.

**Independent Test**: Can be tested by attempting to orbit, pan, and zoom the camera in the 3D view. Success is measured by smooth, intuitive controls that respond predictably to mouse/trackpad input.

**Acceptance Scenarios**:

1. **Given** the 3D view is active, **When** user drags with left mouse button, **Then** the camera orbits around the center point while keeping sources in view
2. **Given** the 3D view is active, **When** user scrolls mouse wheel, **Then** the camera zooms in/out smoothly with field visualization scaling appropriately
3. **Given** the 3D view is active, **When** user drags with right mouse button (or ctrl+drag), **Then** the camera pans laterally without rotating
4. **Given** camera has been moved, **When** user clicks "Reset View" button, **Then** camera returns to default position and orientation

---

### User Story 5 - Inspect Field Intensity and Measurement Points (Priority: P2)

A user wants to place measurement points, inspect local field intensity, and compare regions without leaving the main scene.

**Why this priority**: Measurement is the bridge between visualization and analysis. It is needed in V1 so users can verify what the field is doing at specific points and understand near/far behavior.

**Independent Test**: Can be tested by placing one or more measurement points, reading the displayed field strength values, and confirming the near/far labels update as the camera or sources change.

**Acceptance Scenarios**:

1. **Given** the scene is loaded, **When** user places a measurement point, **Then** the point appears in the 3D view with an estimated field intensity readout
2. **Given** a measurement point exists, **When** source parameters or positions change, **Then** the displayed value updates in real time
3. **Given** the camera or source configuration implies a near-field or far-field region, **When** user views the overlay, **Then** the UI labels the region and states that the model is simplified
4. **Given** analysis overlays are visible, **When** user toggles them off, **Then** the main visualization remains uncluttered and readable

---

### User Story 6 - Remove and Manage Sources (Priority: P3)

A user wants to remove sources or clear all sources to start a new experiment.

**Why this priority**: This is quality-of-life functionality that supports experimentation workflows. It's P3 because users can still achieve learning objectives by refreshing the page, though this is less elegant.

**Independent Test**: Can be tested by adding multiple sources, then removing them individually or all at once. Success is measured by sources disappearing from both the visualization and the control panel without errors.

**Acceptance Scenarios**:

1. **Given** a source is selected, **When** user clicks "Remove Source" button, **Then** the source and its field visualization disappear immediately
2. **Given** multiple sources exist, **When** user clicks "Clear All", **Then** all sources are removed and the view returns to empty state
3. **Given** sources are removed, **When** interference patterns depended on removed sources, **Then** the visualization updates correctly to reflect remaining sources only

---

### Edge Cases

- **What happens when sources are positioned at identical locations?** The dynamic field visualization should superimpose correctly, potentially showing maximum constructive interference if in phase. No crashes or visual artifacts should occur.
- **How does the system handle 10+ simultaneous sources?** Performance should degrade gracefully with visual quality settings automatically adjusting if frame rate drops below 30 FPS, or a warning message appears suggesting source reduction.
- **What happens when frequency/amplitude values reach extreme ranges?** Sliders should have reasonable min/max bounds (e.g., frequency: 0.1-10 Hz for visualization purposes, amplitude: 0-100 arbitrary units). Values at extremes should still produce valid visualizations without overflow errors.
- **How does the system handle rapid parameter changes (slider dragging)?** Visualization updates should be throttled or debounced to maintain frame rate stability without causing visual stuttering.
- **What happens when the browser window is resized?** The 3D canvas should resize responsively while maintaining aspect ratio and camera perspective. Field visualizations should scale appropriately.
- **What happens if WebGL is not supported or disabled?** A clear error message should appear explaining that 3D visualization requires WebGL support, with instructions for enabling it or trying a different browser.

## Requirements

### Functional Requirements - Core Visualization

- **FR-001**: System MUST render a 3D coordinate space representing the laboratory environment
- **FR-002**: System MUST visualize electromagnetic field behavior around each source using a motion-first particle / wavefront representation or an equivalent dynamic field language
- **FR-003**: System MUST update field visualization in real-time (< 100ms latency) when source parameters change
- **FR-004**: System MUST support at least 5 simultaneous EMF point sources without dropping below 30 FPS
- **FR-005**: System MUST display interference patterns where multiple sources' fields overlap
- **FR-006**: Field visualization MUST use consistent color mapping to represent field strength (e.g., blue for weak, red for strong)
- **FR-007**: System MUST maintain visual clarity: particle / wavefront cues or strength indicators must remain distinguishable even with multiple sources

### Functional Requirements - EMF Source Management

- **FR-008**: Users MUST be able to add new RF/EMF sources up to a reasonable limit (at least 5 for V1, with performance warnings beyond this)
- **FR-009**: Users MUST be able to remove individual EMF sources
- **FR-010**: Users MUST be able to select an EMF source to make it active for parameter editing
- **FR-011**: Each source MUST have adjustable frequency parameter (Hz, common RF bands: Wi-Fi 2.4/5GHz, cellular 700MHz-5GHz)
- **FR-012**: Each source MUST have adjustable power/amplitude parameter (dBm or watts)
- **FR-013**: Each source MUST have adjustable phase parameter (degrees or radians) for multi-source scenarios
- **FR-014**: Users MUST be able to reposition sources in 3D space via drag interaction or coordinate inputs
- **FR-015**: Selected sources MUST have visual distinction (highlight, outline, or other indicator)
- **FR-016**: Each source MUST be labeled as "omnidirectional" in V1 (beam steering/directional antennas deferred to V2)

### Functional Requirements - Environment Modeling

- **FR-017**: System MUST support a 3D environment boundary (room/space) for context
- **FR-018**: Environment MUST have configurable dimensions (width, length, height in meters)
- **FR-019**: System MUST display basic environment geometry (walls, floor, ceiling) for spatial reference (V1)
- **FR-020**: System SHOULD support placeholder material properties (e.g., "concrete wall" vs "open air") with simplified attenuation (V2)
- **FR-021**: Advanced multi-material modeling and reflection/diffraction deferred to V2

### Functional Requirements - Trust & Communication

- **FR-036**: All visualizations MUST include accuracy disclaimers visible in UI ("Estimated Field Strength", "Simplified Physics Model")
- **FR-037**: System MUST clearly label near-field vs far-field regions and indicate which simplifications apply
- **FR-038**: System MUST provide "Learn More" or tooltip explanations for model limitations and uncertainty
- **FR-039**: Any safety threshold comparisons MUST be labeled "Informational Only - Not for Compliance Use"
- **FR-040**: System MUST avoid misleading precision (e.g., show "~5.2 V/m" not "5.23847 V/m" for simplified models)

### Functional Requirements - Disturbance System

- **FR-041**: System MUST support time-based animation showing wave propagation from sources
- **FR-042**: System MUST allow toggling between static field view and animated propagation view
- **FR-043**: Animation speed MUST be adjustable for educational clarity

### Functional Requirements - Interaction & Camera

- **FR-044**: Users MUST be able to orbit the camera around the scene using mouse drag
- **FR-045**: Users MUST be able to zoom in/out using mouse wheel or pinch gestures
- **FR-046**: Users MUST be able to pan the camera laterally
- **FR-047**: Camera controls MUST maintain stable orientation (no unintended flipping or spinning)
- **FR-048**: System MUST provide a "Reset Camera" control to return to default view
- **FR-049**: Users MUST be able to interact with UI controls (sliders, buttons) without triggering 3D camera movement

### Functional Requirements - Simulation Model

- **FR-022**: System MUST calculate field strength at visualization points using superposition principle (sum of all source contributions)
- **FR-023**: Field calculation MUST use simplified inverse-distance model for V1 (inverse-square for far-field approximation)
- **FR-024**: System MUST distinguish conceptually between near-field (< λ/2π from source) and far-field regions, with UI labels indicating which applies
- **FR-025**: V1 uses simplified model for both regions; accurate reactive/radiating near-field modeling deferred to V2
- **FR-026**: Field calculation MUST account for phase relationships between sources for interference visualization
- **FR-027**: System MUST use appropriate spatial sampling resolution to balance visual quality and performance
- **FR-028**: Calculation model MUST support real-time updates when source parameters change
- **FR-029**: Calculations run on CPU in V1; GPU-accelerated compute (WebGPU, compute shaders) deferred to V2

### Functional Requirements - Analysis & Overlays

- **FR-030**: System MUST provide field strength measurements at user-selected sample points
- **FR-031**: Analysis overlays MUST show field strength values in appropriate units (V/m, W/m², or dBm)
- **FR-032**: System SHOULD display safety threshold indicators (e.g., ICNIRP reference levels) with "approximate" labels (V1)
- **FR-033**: System SHOULD support comparison against exposure guidelines (informational only, not for compliance) (V1)
- **FR-034**: All analysis results MUST be labeled with accuracy caveats ("Estimated", "Simplified Model", "Not for Compliance")
- **FR-035**: EN 62232 compliance reporting and professional assessment workflows deferred to V2

### Functional Requirements - State Management

- **FR-050**: System MUST maintain state of all active sources (position, frequency, power, phase, antenna type)
- **FR-051**: System MUST track currently selected source for parameter editing
- **FR-052**: System MUST maintain camera state (position, target, orientation)
- **FR-053**: System MUST track environment configuration (dimensions, materials if applicable)
- **FR-054**: System MUST track analysis settings (measurement points, overlay visibility, safety thresholds, near/far labels)
- **FR-055**: System MUST track global visualization settings (color scheme, quality level)
- **FR-056**: State MUST be held in client-side memory (no server persistence required for V1)
- **FR-057**: State changes MUST trigger appropriate re-renders of affected visualizations only (no full-page refresh)

### Functional Requirements - UI & Controls

- **FR-058**: System MUST provide a control panel for adding sources and adjusting parameters
- **FR-059**: Control panel MUST display parameter values numerically alongside sliders with appropriate units
- **FR-060**: System MUST provide visual feedback for interactive elements (hover states, active states)
- **FR-061**: System MUST support keyboard input for precise parameter values
- **FR-062**: Control panel MUST be collapsible or hideable to maximize 3D view area
- **FR-063**: System MUST display current FPS or performance indicator if frame rate drops below acceptable threshold
- **FR-064**: System MUST include prominent accuracy disclaimers and model limitation warnings in UI

### Functional Requirements - Performance & Rendering

- **FR-065**: System MUST achieve initial render within 2 seconds on modern hardware (< 3 years old)
- **FR-066**: System MUST maintain a 60 FPS target during interaction with up to 3-5 sources, with 30 FPS as the minimum acceptable floor under load (V1 target with CPU calculation)
- **FR-067**: System MUST use level-of-detail (LOD) or quality reduction if performance degrades
- **FR-068**: System MUST debounce or throttle expensive calculations during rapid parameter changes
- **FR-069**: Rendering MUST use hardware acceleration (WebGL) for 3D visualization
- **FR-070**: System MUST gracefully handle loss of WebGL context and attempt recovery
- **FR-071**: System MUST warn users if attempting to add more sources than performance allows

### Key Entities

- **RF/EMF Source**: Represents a radio frequency or electromagnetic field source (antenna, device)
  - Attributes: unique ID, 3D position (x, y, z), frequency (Hz), power (dBm/watts), phase, antenna type (omnidirectional in V1), active state
  - Behavior: Emits field that contributes to overall field calculation at any point in space using simplified propagation model

- **Environment**: Represents the 3D space containing sources and measurement points
  - Attributes: dimensions (width, length, height), material properties (placeholder in V1, detailed in V2), boundary visualization
  - Behavior: Provides spatial context and optional attenuation/reflection for field calculations (V2)

- **Field Point**: A location in 3D space where field strength is calculated for visualization or measurement
  - Attributes: 3D position, calculated field strength (magnitude in V/m or W/m²), near-field/far-field classification
  - Behavior: Receives contributions from all active sources via superposition, distinguishes near vs far field

- **Measurement Point**: User-defined location for precise field strength analysis
  - Attributes: 3D position, label, calculated field strength with units, safety threshold comparison (optional)
  - Behavior: Displays exact numerical values with uncertainty indicators

- **Analysis Overlay**: Visual layer showing field strength distribution and safety thresholds
  - Attributes: color mapping scheme, legend with values and units, accuracy disclaimer labels
  - Behavior: Updates dynamically as sources or environment changes

- **Camera State**: User's viewpoint in 3D space
  - Attributes: position, target/look-at point, up vector, zoom level
  - Behavior: Controlled by user input, affects rendering perspective

- **Visualization Settings**: Global parameters controlling rendering and analysis display
  - Attributes: color scheme, quality level, overlay visibility, performance mode
  - Behavior: Applied to rendering and compute pipeline

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add their first RF source and see animated particle / wavefront visualization within 5 seconds of page load
- **SC-002**: System maintains a 60 FPS target with a 30 FPS floor under load for 3-5 simultaneous sources during active parameter manipulation (V1 CPU-based target)
- **SC-003**: Parameter changes (frequency, power, position) produce visible visual feedback within 100ms
- **SC-004**: All visualizations include visible accuracy disclaimers ("Estimated", "Simplified Model")
- **SC-005**: Users can place measurement points and see field strength values with units (V/m or W/m²) and near/far labeling within 100ms
- **SC-006**: Near-field vs far-field regions are visually distinguishable or labeled in the UI
- **SC-007**: Camera orbit, zoom, and pan controls respond smoothly without perceptible lag
- **SC-008**: System provides clear feedback when performance limits are approached (source count warnings)
- **SC-009**: First-time users understand model limitations through UI communication within 30 seconds

## Assumptions

- **Target Environment**: Users are accessing the platform via modern desktop/laptop browsers (Chrome, Firefox, Safari, Edge) with WebGL 2.0 support
- **Input Devices**: Primary input is mouse and keyboard; touch support is out of scope for V1
- **Physics Simplification**: Visualization uses simplified EMF/RF propagation models grounded in the supplied formulas (plane wave, superposition, attenuation, reflection, noise, point source, near/far falloff) rather than a full Maxwell solver or ray-tracing for real-time performance
- **Use Case**: Primary users are learning about RF/EMF exposure, assessing home/office scenarios, or exploring "what-if" scenarios; not intended for professional compliance assessments in V1
- **Accuracy Level**: V1 provides "order of magnitude" estimates suitable for education and rough analysis; professional-grade accuracy with EN 62232 compliance deferred to V2
- **Single User**: No collaborative or multi-user features; each session is independent
- **No Persistence**: Users do not expect to save/load sessions in V1; acceptable to lose work on page refresh (deferred to V1.5)
- **Performance Target**: Target hardware is mid-range laptops from last 3 years with CPU-based calculations; GPU acceleration deferred to V2
- **Network**: Application runs entirely client-side after initial load; no ongoing network requirements
- **Screen Size**: Optimized for desktop displays (1366x768 minimum, 1920x1080 typical); mobile responsive design is V2
- **Trust Model**: Users understand this is a simplified simulator, not a measurement tool; transparent communication of limitations builds trust

## Architecture Principles

### Modular Boundaries

The architecture must maintain clear separation of concerns across these modules:

1. **UI Module**: React components for controls, panels, buttons, inputs (no business logic)
2. **Simulation Module**: Field calculation engine, propagation models, superposition logic (independent of rendering)
3. **Compute Module**: Performance-critical calculation layer (CPU in V1, GPU-ready interface for V2)
4. **Reporting Module**: Future assessment and EN 62232 report generation (V2, stub interface in V1)
5. **Scenario Module**: Environment configuration, source templates, curated presets, and analysis workflows (V1)
6. **Environment Module**: 3D space definition, material properties, boundary modeling (basic in V1, rich in V2)
7. **Source Module**: Antenna/device modeling, power patterns, frequency management (omnidirectional in V1, directional in V2)
8. **Visualization Module**: 3D rendering, overlays, color mapping, camera controls (Three.js/R3F wrapper)

### Interface Design

- Each module exposes a clean TypeScript interface (no direct implementation dependencies)
- Compute module interface must support both CPU and GPU backends (swap in V2)
- Simulation module must not depend on visualization specifics (can run headless for testing)
- Reporting module interface defined in V1 even if implementation is V2 (enables testing, prototyping)

### Future-Proofing

- V1 implementations should avoid decisions that block V2 enhancements (e.g., hardcoding CPU-only calculations deeply)
- Use dependency injection or strategy pattern for swappable components (compute backend, antenna patterns)
- Keep V1 simple but V2-aware: don't overengineer, but leave clear extension points

## Testing Approach

### Unit Testing

- **Component Tests**: React components (source controls, parameter sliders, buttons) render correctly with various props
- **State Management Tests**: State updates (adding/removing sources, parameter changes) produce correct new state
- **Calculation Tests**: Field strength calculations at various points produce expected values given source configurations
- **Utility Tests**: Helper functions (coordinate transformations, phase calculations, color mapping) return correct outputs

### Integration Testing

- **Source Lifecycle**: Adding, selecting, modifying, and removing sources updates both state and visualization correctly
- **Camera Integration**: Camera controls update both camera state and render view without breaking source interactions
- **Performance Integration**: Verify that multiple simultaneous updates (e.g., dragging source while adjusting parameters) maintain frame rate targets
- **UI-to-Visualization Sync**: Verify that all UI interactions produce corresponding visual updates without desync

### Visual/Rendering Testing

- **Field Visualization**: Verify particle / wavefront cues and strength indicators appear correctly around sources
- **Interference Patterns**: Verify that two identical in-phase sources show constructive interference, and out-of-phase sources show destructive interference
- **Snapshot Testing**: Use visual regression testing to catch unintended changes in rendering
- **Performance Testing**: Measure FPS under various load conditions (1, 5, 10 sources) and verify degradation is graceful

### End-to-End Testing

- **User Journey 1**: Load page → see default source → adjust parameters → observe changes (P1 validation)
- **User Journey 2**: Load page → add second source → position sources → observe interference pattern (P2 validation)
- **User Journey 3**: Create multi-source setup → navigate 3D view from multiple angles → verify visual consistency (P1/P2 validation)

### Cross-Browser Testing

- Test core functionality on Chrome, Firefox, Safari, and Edge
- Verify WebGL initialization and performance on each browser
- Test fallback error messages on browsers without WebGL support

### Performance Testing

- Measure initial load time and time-to-interactive
- Profile rendering performance with 1, 5, and 10 sources
- Identify bottlenecks in field calculation, rendering, or state updates
- Test memory stability over extended use (20+ minutes of interaction)

## Open Questions

None at this time. All critical decisions have reasonable defaults defined in the Assumptions section. If ambiguities arise during implementation, they should be resolved through rapid prototyping and user feedback.
