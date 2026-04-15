# EMF Visualizer Feature Specification

**Document ID**: 001-emf-visualizer  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-04-14  

---

## Executive Summary

The **EMF Visualizer** is an interactive, animated educational tool for visualizing electromagnetic (EM) waves. It provides real-time 3D visualization of plane-polarized electromagnetic radiation, demonstrating the perpendicular relationship between electric field (E), magnetic field (B), and wave propagation direction, with interactive controls for frequency, amplitude, phase, and polarization modes. The tool targets physics students and educators seeking intuitive understanding of EM wave behavior.

---

## 1. User Scenarios & Journeys

### 1.1 Interactive Explorer
**Actor**: Physics student exploring EM wave concepts  
**Goal**: Understand how electromagnetic waves propagate and how field components interact

**Journey**:
1. Opens EMF Visualizer and sees a default EM wave animating in 3D
2. Recognizes the E field (yellow curve in Y-direction), B field (blue curve in Z-direction), and propagation on X-axis
3. Adjusts frequency slider in controls panel
4. Observes wavelength compression/expansion in real-time
5. Changes render mode from curve to vector to see field magnitudes
6. Toggles between orthogonal and circular polarization to witness field geometry changes
7. Returns to curve mode for final conceptual understanding

**Success Criteria**: 
- Wave animates smoothly (60 fps minimum)
- All parameter changes reflect visually within 100ms
- User can switch modes without animation interruption

### 1.2 Classroom Presentation
**Actor**: Physics educator conducting lecture demonstration  
**Goal**: Teach EM wave geometry and polarization modes to students

**Journey**:
1. Loads EMF Visualizer in front of class
2. Uses preset configurations (e.g., "Linear-XY", "Circular-Right-Handed") from dropdown
3. Explains current wave configuration using on-screen info panel (equation, frequency, wavelength)
4. Transitions between presets to show polarization differences
5. Adjusts amplitude to emphasize field strength
6. Freezes animation temporarily to mark up wave geometry
7. Resumes animation to show time-domain behavior

**Success Criteria**:
- Presets load within 200ms
- Info panel displays accurate mathematical representations
- Animation pause/resume preserves state

### 1.3 Wave Property Investigation
**Actor**: Advanced student investigating specific EM phenomena  
**Goal**: Quantitatively explore parameter relationships

**Journey**:
1. Opens EMF Visualizer in source mode
2. Manually inputs precise frequency and phase values via numeric input fields
3. Observes wave configuration with custom parameters
4. Exports or screenshots the current view with annotations
5. Compares against theoretical predictions

**Success Criteria**:
- Numeric inputs accept EM frequency ranges (radio to X-ray bands)
- Visualization matches mathematical model (EM equations)
- Phase relationships visually apparent between E and B

---

## 2. Functional Requirements

### 2.1 Core Wave Model
- **FR-1**: System shall render a 3D plane electromagnetic wave with:
  - E-field oscillating in Y-direction
  - B-field oscillating in Z-direction
  - Propagation along X-axis
  - E ⊥ B ⊥ propagation vector maintained at all times

- **FR-2**: Frequency range shall span 1 Hz to 10²⁴ Hz (visible spectrum emphasized via UI scaling for practical use)

- **FR-3**: Amplitude range shall be configurable from 0.1 to 10 units (proportional scaling)

- **FR-4**: Phase relationship between E and B shall remain locked at 90° offset (physics constraint)

### 2.2 Polarization Modes
- **FR-5**: System shall support three polarization modes:
  - **Linear**: E-field oscillates along fixed axis (Y)
  - **Circular**: E-field traces helical path (right-handed or left-handed)
  - **Elliptical**: E-field traces elliptical path (parametrized by eccentricity)

- **FR-6**: Mode transitions shall be smooth (cross-fade over 300ms) to avoid jarring visual changes

### 2.3 Render Modes
- **FR-7**: System shall provide three render modes:
  - **Curve Mode**: Spatial wave representation (curves for E and B fields)
  - **Vector Mode**: Field magnitude vectors at sample points along propagation
  - **Hybrid Mode**: Combination of curve and vector visualization

- **FR-8**: Mode switching shall not interrupt animation

### 2.4 Animation & Performance
- **FR-9**: Animation shall maintain 60 fps target on systems with hardware acceleration
- **FR-10**: Wave animation shall show time-dependent field oscillation synchronized across all components
- **FR-11**: Pause/Resume controls shall preserve animation state without data loss

### 2.5 User Controls & Parameters
- **FR-12**: Interactive controls shall include sliders/inputs for:
  - Frequency (logarithmic scale for usability)
  - Amplitude
  - Phase offset
  - Animation speed multiplier (0.1x to 10x)

- **FR-13**: Preset configurations shall be instantly selectable from list:
  - "Linear-Y-Fundamental"
  - "Circular-Right-Handed"
  - "Circular-Left-Handed"
  - "Elliptical-1:2"
  - Custom user-defined presets (saved to browser localStorage)

### 2.6 Educational Information
- **FR-14**: Information panel shall display:
  - Current frequency (Hz) and wavelength (normalized units)
  - Polarization type and handedness
  - Visible spectrum indicator (if in visual range)
  - Mathematical representation (LaTeX: E(x,t) and B(x,t))

- **FR-15**: Info panel shall update in real-time with parameter changes

### 2.7 Source Mode (Advanced)
- **FR-16**: Source mode shall expose:
  - Direct numeric input for frequency, amplitude, phase
  - Polarization type selector
  - Custom preset save functionality

- **FR-17**: Source mode shall validate input ranges and reject invalid values with user feedback

### 2.8 3D Canvas
- **FR-18**: 3D canvas shall be fully interactive:
  - Orbit camera controls (drag to rotate, scroll to zoom)
  - Reset view button to return to default camera position
  - Auto-focus mode that maintains ideal viewing angle

- **FR-19**: Canvas shall render with dark theme (near-black background) for glowing wave effect

---

## 3. Acceptance Criteria

### 3.1 Geometric Correctness
- **AC-1**: E-field and B-field oscillations shall be verified as perpendicular in real-time (dot product = 0 ± 0.01 tolerance)
- **AC-2**: B-field magnitude shall equal E-field magnitude × speed-of-light factor at all times
- **AC-3**: Wavelength visualization shall match λ = c / f (where c is unit speed) to within ±2% across frequency range

### 3.2 Visual Clarity
- **AC-4**: E-field curve shall be rendered in distinct color (default: yellow/gold) with 2px line width
- **AC-5**: B-field curve shall be rendered in distinct color (default: cyan/blue) with 2px line width
- **AC-6**: Glowing effect shader shall enhance field visibility without obscuring geometry
- **AC-7**: Polarization differences shall be visually obvious when toggling between modes (user can perceive change within 2 seconds)

### 3.3 Performance
- **AC-8**: Animation frame rate shall maintain ≥60 fps on WebGL2-capable hardware (tested on RTX 3070 tier)
- **AC-9**: Parameter changes shall apply within 100ms (no visible lag)
- **AC-10**: Mode transitions shall not cause frame drops >10ms
- **AC-11**: Memory footprint shall remain <150 MB during 5-minute interactive session

### 3.4 Functionality
- **AC-12**: All presets shall load correctly and display expected polarization geometry
- **AC-13**: Pause/Resume shall work without animation state corruption
- **AC-14**: Camera controls shall respond to user input within 30ms
- **AC-15**: Info panel data shall remain synchronized with visualization (update latency <50ms)

### 3.5 Accessibility & UX
- **AC-16**: Control labels shall be clear and self-documenting
- **AC-17**: Keyboard navigation shall be available for all controls (Tab, Enter, arrow keys)
- **AC-18**: Viewport shall be responsive and usable on screens ≥1024px width

---

## 4. Edge Cases & Constraints

### 4.1 Parameter Boundaries
- **EC-1**: Frequency = 0 Hz: Shall show static field configuration (B-field constant, E-field constant)
- **EC-2**: Amplitude = 0: Shall render zero field magnitudes (invisible elements)
- **EC-3**: Very high frequency (>10²³ Hz): System shall not crash; wavelength may become visually sub-pixel (graceful handling)
- **EC-4**: Very low frequency (<1 Hz): Wavelength may exceed viewport; shall pan/auto-scale to show meaningful portion

### 4.2 Rendering Edge Cases
- **EC-5**: WebGL unsupported: Shall detect and show fallback message (not crash)
- **EC-6**: Low-end GPU: Animation may drop below 60 fps; system shall degrade gracefully without crashing
- **EC-7**: Rapid parameter changes (user dragging slider): System shall queue updates and render latest state without buffering lag

### 4.3 State & Persistence
- **EC-8**: User closes browser tab mid-animation: No data loss (animation state is transient)
- **EC-9**: localStorage disabled: Presets shall work in-session; custom presets not persisted (graceful fallback)
- **EC-10**: Multiple tabs open: Each tab maintains independent visualization state

### 4.4 Polarization Edge Cases
- **EC-11**: Elliptical polarization with eccentricity → 1: Shall smoothly transition toward linear polarization
- **EC-12**: Elliptical polarization with eccentricity → 0: Shall smoothly transition toward circular polarization
- **EC-13**: Phase offset = 360°: Shall be equivalent to phase = 0° (modulo arithmetic)

### 4.5 Mathematical Constraints
- **EC-14**: Division by zero protection: Wavelength calculation shall handle f=0 gracefully (return ∞ or "undefined" UI text)
- **EC-15**: Floating-point precision: Calculations over ±1000 units shall maintain <0.1% relative error

---

## 5. Key Entities & Data Structures

### 5.1 Vector3
```typescript
interface Vector3 {
  x: number;
  y: number;
  z: number;
}
```
Represents a 3D point or direction in Cartesian coordinates.

### 5.2 PolarizationMode
```typescript
type PolarizationMode = 
  | 'linear' 
  | 'circular-right' 
  | 'circular-left' 
  | 'elliptical'
```
Enum representing E-field polarization geometry.

### 5.3 RenderMode
```typescript
type RenderMode = 
  | 'curve' 
  | 'vector' 
  | 'hybrid'
```
Enum representing visualization style for fields.

### 5.4 EmfParams
```typescript
interface EmfParams {
  frequency: number;           // Hz
  amplitude: number;           // Field magnitude
  phase: number;              // Radians, 0 to 2π
  polarization: PolarizationMode;
  ellipticityAngle?: number;   // For elliptical mode
  animationSpeed: number;      // Multiplier, 0.1 to 10
}
```
Configuration parameters for wave rendering.

### 5.5 WaveSample
```typescript
interface WaveSample {
  position: Vector3;           // Position along X-axis
  eField: Vector3;             // Electric field vector
  bField: Vector3;             // Magnetic field vector
  timestamp: number;           // Animation time parameter
}
```
A snapshot of field values at a point in space-time during animation.

### 5.6 PresetConfig
```typescript
interface PresetConfig {
  name: string;
  description: string;
  params: EmfParams;
  renderMode: RenderMode;
}
```
User-selectable preset configuration.

### 5.7 VisualizerState
```typescript
interface VisualizerState {
  params: EmfParams;
  renderMode: RenderMode;
  isAnimating: boolean;
  cameraPosition: Vector3;
  selectedPreset: string | null;
}
```
Global state managed by Zustand store.

---

## 6. Scope Boundaries

### 6.1 In Scope
✅ Real-time 3D electromagnetic wave visualization  
✅ Multiple polarization modes (linear, circular, elliptical)  
✅ Multiple render modes (curve, vector, hybrid)  
✅ Interactive parameter controls (frequency, amplitude, phase, animation speed)  
✅ Preset configurations  
✅ Educational information display  
✅ 3D camera controls (orbit, zoom, reset)  
✅ Dark theme with glowing effects  
✅ LocalStorage persistence for custom presets  
✅ Unit tests for math engine  
✅ Component tests for React Three Fiber integration  
✅ Documentation and user guide  

### 6.2 Out of Scope
❌ Non-plane waves (spherical, cylindrical) — future feature  
❌ Relativistic effects — simplified Newtonian model only  
❌ Anisotropic media — homogeneous medium only  
❌ Multiple waveform synthesis — single wave focus  
❌ Export/import to external formats — screenshot/copy only  
❌ Collaborative real-time editing — single-user tool  
❌ Mobile touch optimization (phase 2 enhancement, not MVP)  
❌ Accessibility audio descriptions — visual focus  
❌ VR/AR integration — desktop-only MVP  

### 6.3 Tech Stack Constraints
- **Framework**: React + TypeScript + Next.js
- **3D Rendering**: React Three Fiber (R3F) + Three.js
- **State Management**: Zustand
- **Math Library**: Three.js utils + pure functions
- **Styling**: CSS modules or Tailwind CSS dark theme
- **Testing**: Jest + React Testing Library + React Three Test Renderer

### 6.4 Performance Targets
- **Render Performance**: ≥60 fps on RTX 3070 tier GPU
- **Interaction Latency**: <100ms parameter propagation
- **Bundle Size**: <450 KB (gzip) for feature module
- **Memory**: <150 MB during typical use session

### 6.5 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- **Requirement**: WebGL 2.0 support

---

## 7. Implementation Architecture

### 7.1 Feature Module Structure
```
src/features/emf-visualizer/
├── components/          # React components
│   ├── VisualizerCanvas.tsx      # React Three Fiber canvas
│   ├── ControlPanel.tsx          # Interactive controls
│   ├── InfoPanel.tsx             # Educational information display
│   ├── PresetSelector.tsx        # Preset dropdown/list
│   └── SourceMode.tsx            # Advanced input controls
├── hooks/              # Custom React hooks
│   ├── useWaveAnimation.ts       # Animation loop
│   ├── useEmfParams.ts           # Parameter state manager
│   └── useCameraControls.ts      # Orbit camera
├── lib/                # Pure utility functions
│   ├── wave.ts                   # Wave generation functions
│   ├── polarization.ts           # Polarization transformations
│   ├── math.ts                   # Vector operations
│   └── constants.ts              # Physical constants
├── renderers/          # R3F renderer components
│   ├── FieldGeometry.tsx         # Memoized curve rendering
│   ├── VectorField.tsx           # Vector visualization
│   └── HybridRenderer.tsx        # Combined rendering
├── state/              # Zustand store
│   └── visualizerStore.ts        # Global state management
└── tests/              # Test suite
    ├── wave.test.ts              # Math engine tests
    ├── VisualizerCanvas.test.tsx # Component tests
    └── integration.test.ts       # End-to-end scenarios
```

### 7.2 Data Flow
```
User Input (Controls)
    ↓
EmfParams Update (Zustand Store)
    ↓
Wave Generation (Math Engine)
    ↓
Sample Buffer (WaveSample[])
    ↓
Memoized Geometry (R3F Meshes)
    ↓
3D Render (React Three Fiber)
    ↓
Browser Viewport
```

### 7.3 Engineering Rules
- **TypeScript**: Strict mode enabled; no implicit `any`
- **SOLID Principles**: Single responsibility per module; open/closed for extensions
- **Pure Functions**: All math functions side-effect free; deterministic
- **Memoization**: Geometry cached using `useMemo` to prevent unnecessary recomputation
- **Testing**: Unit tests for math; component tests for React; integration tests for workflows
- **Documentation**: JSDoc comments on public APIs; inline comments for complex logic

---

## 8. Testing Strategy

### 8.1 Unit Tests (Math Engine)
- Wave equation correctness for linear/circular/elliptical polarization
- Polarization transformation matrices
- Vector operations (dot product, cross product, magnitude)
- Frequency ↔ wavelength conversion
- Phase relationship maintenance (E ⊥ B)

### 8.2 Component Tests
- ControlPanel input validation and callbacks
- PresetSelector preset loading and switching
- InfoPanel data accuracy
- VisualizerCanvas render performance baseline

### 8.3 Integration Tests
- Full user journey: Load preset → Adjust params → Observe animation
- Edge cases: Frequency = 0, Amplitude = 0, WebGL unavailable
- State persistence: Pause/Resume, camera position retention

### 8.4 Performance Tests
- Frame rate monitoring under various parameter loads
- Memory profiling during prolonged animation
- Bundle size regression tests

---

## 9. Phased Delivery

### Phase 1: Core Math & Basic Visualization (Weeks 1-2)
**Deliverables**:
- Type definitions (Vector3, EmfParams, WaveSample, etc.)
- Math engine (wave functions, polarization, sample generation)
- Unit tests for math module
- Zustand state store
- Basic VisualizerCanvas with curve-mode rendering
- Simple control panel (frequency, amplitude, phase)
- Default linear polarization only

**Exit Criteria**:
- Math engine 100% test coverage
- Canvas renders smooth 60fps animation
- Parameter controls responsive
- E ⊥ B orthogonality verified

### Phase 2: Modes & Presets (Weeks 3-4)
**Deliverables**:
- Polarization mode transitions (linear → circular → elliptical)
- Vector and hybrid render modes
- Preset configuration manager
- PresetSelector component
- Info panel with mathematical display
- Camera orbit controls

**Exit Criteria**:
- All render modes functional
- Presets load and switch correctly
- Info panel displays accurate data
- Camera controls responsive

### Phase 3: Polish & Advanced Features (Weeks 5-6)
**Deliverables**:
- Elliptical polarization control (eccentricity slider)
- Source mode (advanced parameter input)
- Animation speed multiplier
- Pause/Resume functionality
- Dark theme with glowing shaders
- Component tests and integration tests
- Documentation and user guide

**Exit Criteria**:
- All acceptance criteria met
- Test coverage >90%
- Performance benchmarks achieved
- User documentation complete

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame Rate | ≥60 fps | GPU profiler during 5min session |
| Parameter Latency | <100ms | Event timestamp to render update |
| Polarization Accuracy | E ⊥ B to ±0.01 rad | Math test assertions |
| User Clarity | 90% understand E⊥B⊥prop | Educator feedback |
| Code Quality | >90% test coverage | Jest coverage reports |
| Bundle Size | <450 KB gzip | webpack-bundle-analyzer |
| Accessibility | WCAG 2.1 AA | axe-core automated tests |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| WebGL performance below target | Medium | High | Profile early; optimize geometry batching |
| Complex polarization math errors | Low | High | Extensive unit tests; peer review math module |
| State sync issues during animation | Low | Medium | Zustand selector tests; reducer coverage |
| User confusion on polarization concepts | Medium | Medium | Rich info panel; preset descriptions; docs |
| Mobile device incompatibility | Medium | Low | Document desktop-only (phase 2 for mobile) |

---

## 12. Glossary

- **EMF**: Electromagnetic Field; wave composed of E and B fields
- **Polarization**: Orientation of E-field oscillation in space
- **Wavelength (λ)**: Distance between successive wave peaks
- **Frequency (f)**: Number of oscillations per unit time
- **Phase**: Time offset between periodic cycles
- **Linear Polarization**: E-field oscillates along fixed axis
- **Circular Polarization**: E-field traces helical path (right or left-handed)
- **Elliptical Polarization**: E-field traces elliptical path
- **Orthogonal**: Perpendicular; dot product = 0

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-14 | Engineering Team | Initial specification document |

---

**Approval**: Pending engineering review and stakeholder sign-off.
