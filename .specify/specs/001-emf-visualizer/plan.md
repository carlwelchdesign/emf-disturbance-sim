# Implementation Plan: EMF Visualizer

**Feature ID**: 001-emf-visualizer | **Version**: 1.0 | **Date**: 2026-04-14  
**Spec**: [.specify/specs/001-emf-visualizer/spec.md](spec.md)  
**Constitution**: [.specify/memory/constitution.md](../../memory/constitution.md)

---

## Summary

The **EMF Visualizer** is an interactive 3D educational tool for visualizing electromagnetic waves with real-time animation, multiple polarization modes (linear, circular, elliptical), and render modes (curve, vector, hybrid). The implementation prioritizes mathematical correctness, 60 fps performance, and SOLID architectural boundaries. The math engine is entirely pure-functional (no side effects), the state layer is isolated in Zustand, components are dumb renderers, and all cross-layer concerns are handled through explicit dependency injection and memoization. Delivery is phased: Phase 1 establishes the math engine and basic visualization; Phase 2 adds interaction modes and presets; Phase 3 completes advanced features, accessibility, and test coverage.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**:
- React 18.x
- Next.js 14.x
- React Three Fiber (R3F) - 3D abstraction over Three.js
- Three.js 150+ - WebGL 2.0 rendering engine
- Zustand 4.x - Lightweight state management
- Jest 29.x - Test runner with ts-jest preprocessor
- React Testing Library + @react-three/test-renderer - Component testing

**Storage**: In-memory Zustand state + browser localStorage for custom presets (graceful fallback if disabled)  
**Testing**: Jest with ts-jest, React Testing Library, @react-three/test-renderer for R3F components  
**Target Platform**: Web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) with WebGL 2.0 support  
**Project Type**: React component library (feature module within Next.js application)  
**Performance Goals**: 60 fps minimum, <100ms parameter propagation latency, <50ms info panel update latency  
**Constraints**:
- Memory: <150 MB during 5-minute interactive session
- Bundle: <450 KB gzip for feature module
- Frame drops: <10ms during mode transitions
- Floating-point precision: <0.1% relative error over ±1000 unit calculations

**Scale/Scope**: Single-user interactive web tool; ~15-20 components, 8-12 custom hooks, ~25-30 pure math functions, 18 functional requirements, 4 user journeys, 3 polarization modes, 3 render modes

---

## Constitution Check

**Status**: ✅ PASS (all five principles aligned with implementation approach)

### I. Feature-Boundary Architecture ✅
- **Boundary**: EMF Visualizer is isolated in `src/features/emf-visualizer/`
- **Separation of Concerns**:
  - Renderers (`renderers/`) only handle geometry generation and R3F mesh construction; no math logic
  - Math engine (`lib/`) contains pure functions: wave generation, polarization transforms, vector operations; no React dependencies
  - UI components (`components/`) handle only rendering and user input dispatch; no direct state mutation
  - State layer (`state/`) centralizes all mutable store using Zustand; components read through selectors
- **Justification**: Routes are isolated from feature logic. Business logic (wave equations, polarization transforms) belongs in `lib/` only. New capabilities extend existing modules (e.g., new polarization type adds function to `lib/polarization.ts`, not new module).
- **Compliance**: ✅ Clear boundaries prevent changes from bleeding into unrelated layers

### II. Dependency Inversion & SOLID Delivery ✅
- **Single Responsibility**:
  - `WaveGenerator.ts`: Only generates wave samples (E, B fields) at spatial positions
  - `PolarizationTransform.ts`: Only applies polarization geometry transformation
  - `useWaveAnimation.ts`: Only manages animation loop timing and frame scheduling
  - `ControlPanel.tsx`: Only renders UI; delegates state updates via callbacks
- **Dependency Inversion**:
  - Pure math functions accept structured data (Vector3, EmfParams); no external services
  - Hooks inject store dependencies via Zustand selectors, not global imports
  - Components accept props with narrow, typed interfaces; no knowledge of sibling components
- **Substitutability**: 
  - Wave functions can be replaced with alternatives (e.g., GPU compute shader) without changing components
  - Zustand store can be swapped for Redux without touching React layer
  - R3F geometry can be swapped for Babylon.js with isolated renderer refactor
- **Compliance**: ✅ Each module has one reason to change; implementations are substitutable behind narrow interfaces

### III. Test & Validation Gates ✅
- **Phase 1 (Math Engine)**:
  - Math module: 100% unit test coverage (wave functions, polarization, vector ops)
  - Gate: All `lib/*.test.ts` tests pass before components begin
  - Validation: E ⊥ B orthogonality verified (dot product tolerance ±0.01), wavelength formula λ = c/f verified to ±2%
- **Phase 2 (Rendering)**:
  - Component tests: ControlPanel input validation, PresetSelector loading, InfoPanel accuracy
  - Integration tests: Full journey (adjust params → wave updates → canvas reflects change)
  - Gate: All tests green + no TypeScript errors before Phase 3
- **Phase 3 (Polish)**:
  - End-to-end tests: Keyboard navigation, pause/resume state consistency, camera control responsiveness
  - Performance profiling: Frame rate maintained, memory footprint <150MB
  - Gate: >90% code coverage, all acceptance criteria validated
- **Compliance**: ✅ Behavior validated at module, component, and integration boundaries; cross-layer paths checked

### IV. Design System & Accessibility Compliance ✅
- **Design System**:
  - Color palette: Dark theme (#0a0e27 background, yellow/gold E-field #FFD700, cyan/blue B-field #00BFFF)
  - Typography: No hardcoded fonts; uses system font stack
  - Spacing: CSS custom properties (CSS variables) for margins/padding consistency
  - MUI-ready hooks: Theming system prepared for MUI integration (color tokens exported as TypeScript object)
- **Accessibility (WCAG 2.1 AA)**:
  - Keyboard Navigation: All controls accessible via Tab, Enter, arrow keys; focus visibility via CSS outline
  - Live Regions: Info panel updates trigger aria-live announcements for screen readers
  - Color Contrast: E-field gold on dark bg meets AAA (ratio >7:1); B-field cyan meets AA (ratio >4.5:1)
  - Labels: All inputs have explicit `<label>` elements; buttons have descriptive text or aria-labels
- **Compliance**: ✅ UI production-ready; accessibility assessment included in Phase 3 gate

### V. Observable, Safe Operations ✅
- **Observability**:
  - Animation telemetry hook: Logs frame times, FPS drops, performance warnings
  - Parameter change logging: Each update to EmfParams logged with timestamp and delta
  - Error boundaries: Graceful fallback if WebGL unavailable; console warnings for out-of-range inputs
- **State Safety**:
  - Additive state machine: Animation states (playing, paused, stopped) never corrupt each other
  - Immutable state mutations: Zustand enforces immutability; no direct store mutation
  - Migration strategy: Custom presets use versioning; unsupported formats gracefully skipped
- **Security**:
  - No external API calls (all computation local)
  - localStorage access wrapped in try-catch; no sensitive data persisted
  - No eval() or dynamic code execution
- **Compliance**: ✅ Observable signals enable debugging; state operations are safe and predictable

---

## Project Structure

### Feature Module Layout

```
src/features/emf-visualizer/
├── components/
│   ├── VisualizerCanvas.tsx      # React Three Fiber canvas component
│   ├── ControlPanel.tsx          # Frequency, amplitude, phase, animation speed controls
│   ├── InfoPanel.tsx             # Real-time math display (E(x,t), B(x,t), λ, f)
│   ├── PresetSelector.tsx        # Preset dropdown + load/save UI
│   ├── SourceMode.tsx            # Advanced numeric input interface
│   ├── CameraControls.tsx        # Orbit camera wrapper
│   └── __tests__/
│       ├── ControlPanel.test.tsx
│       ├── InfoPanel.test.tsx
│       ├── PresetSelector.test.tsx
│       └── VisualizerCanvas.test.tsx
│
├── hooks/
│   ├── useWaveAnimation.ts       # Animation loop: requestAnimationFrame + time stepping
│   ├── useEmfParams.ts           # Parameter state selector (Zustand)
│   ├── useCameraControls.ts      # Orbit camera state (position, rotation)
│   ├── useWaveSamples.ts         # Memoized wave sample generation
│   └── __tests__/
│       ├── useWaveAnimation.test.ts
│       ├── useEmfParams.test.ts
│       └── useWaveSamples.test.ts
│
├── lib/
│   ├── wave.ts                   # Wave equation solver (linear, circular, elliptical)
│   ├── polarization.ts           # Polarization geometry transformations
│   ├── math.ts                   # Vector3 ops, cross/dot product, normalization
│   ├── constants.ts              # Physical constants (c, μ₀, ε₀, etc.)
│   ├── sampling.ts               # Sample point generation along propagation
│   ├── validators.ts             # Input range validation, error messages
│   └── __tests__/
│       ├── wave.test.ts          # E ⊥ B verification, polarization correctness
│       ├── polarization.test.ts  # Mode transitions, eccentricity handling
│       ├── math.test.ts          # Vector operations, precision
│       ├── sampling.test.ts      # Sample distribution, frequency sensitivity
│       └── validators.test.ts    # Boundary conditions (f=0, A=0, etc.)
│
├── renderers/
│   ├── FieldGeometry.tsx         # Memoized curve rendering (E and B field lines)
│   ├── VectorField.tsx           # Vector magnitude visualization
│   ├── HybridRenderer.tsx        # Combined curve + vector mode
│   └── shaders/
│       ├── glowing.glsl          # Fragment shader for glow effect
│       └── field.glsl            # Vertex shader for field rendering
│
├── state/
│   ├── visualizerStore.ts        # Zustand store (EmfParams, RenderMode, cameraPos, etc.)
│   ├── selectors.ts              # Typed selector functions (memoized derivations)
│   └── __tests__/
│       └── visualizerStore.test.ts
│
├── types/
│   ├── index.ts                  # Type exports (Vector3, EmfParams, WaveSample, etc.)
│   └── shaders.ts                # Shader type definitions
│
├── utils/
│   ├── presets.ts                # Preset configurations + save/load logic
│   ├── storage.ts                # localStorage wrapper with error handling
│   └── telemetry.ts              # Performance logging hooks
│
├── __tests__/
│   └── integration.test.ts       # Full user journey tests
│
├── index.ts                      # Public API exports
└── README.md                     # Feature documentation

```

### Documentation Files (`.specify/specs/001-emf-visualizer/`)

```
specs/001-emf-visualizer/
├── spec.md                 # Feature specification (input)
├── plan.md                 # This file (implementation strategy)
├── research.md             # Phase 0 research findings (R3F perf, WebGL2 support)
├── data-model.md           # Entity model deep-dive (type definitions, state schema)
├── quickstart.md           # Developer onboarding guide
└── contracts/
    ├── wave-engine.contract.ts    # Math API contract (inputs → outputs → examples)
    ├── state-machine.contract.ts  # Animation state contract
    └── component-props.contract.ts # Component interface definitions
```

---

## Data Flow Architecture

### Animation Loop Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser RequestAnimationFrame          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  useWaveAnimation Hook  │
        │  - Measures elapsed Δt  │
        │  - Scales by animation  │
        │    speed multiplier     │
        └────────────┬────────────┘
                     │
        ┌────────────▼──────────────────┐
        │  Zustand Store Update        │
        │  - Dispatch: timeAdvance()   │
        │  - Internal: t → t + Δt      │
        └────────────┬──────────────────┘
                     │
        ┌────────────▼────────────────────┐
        │  useWaveSamples Hook (memoized)│
        │  - Read: EmfParams, time t     │
        │  - compute: WaveSample[] along │
        │    X-axis at n positions       │
        └────────────┬────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │  Renderer (FieldGeometry / Vector)    │
        │  - Input: WaveSample[]               │
        │  - Generate: BufferGeometry vertices │
        │  - Memoize: Prev geometry cached     │
        └────────────┬──────────────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │  React Three Fiber Canvas         │
        │  - Render: Mesh objects          │
        │  - Apply: Camera pos, lighting   │
        └────────────┬──────────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │  WebGL 2.0 GPU Rasterization     │
        │  - Output: Pixel data → Screen   │
        └──────────────────────────────────┘
```

### User Input Flow

```
┌──────────────────────────────────────┐
│   User Interacts: Adjust Slider      │
│   (e.g., frequency control)          │
└────────┬─────────────────────────────┘
         │
┌────────▼───────────────────────────────┐
│  ControlPanel Component Handler        │
│  - Validate input (range check)        │
│  - Dispatch: updateParams(newFreq)    │
└────────┬───────────────────────────────┘
         │
┌────────▼──────────────────────────────┐
│  Zustand Store Reducer                │
│  - Immutably update EmfParams.freq    │
│  - Trigger subscribers                │
└────────┬──────────────────────────────┘
         │
┌────────▼────────────────────────────────┐
│  Zustand Selectors (auto-subscribed)   │
│  - Components re-render with new param │
│  - useEmfParams() hook returns updated │
│  - InfoPanel displays new λ = c/f      │
└────────┬────────────────────────────────┘
         │
┌────────▼──────────────────────────────┐
│  Wave Samples Recomputed (useMemo)    │
│  - Math engine re-runs for new freq   │
│  - Sample buffer invalidated          │
└────────┬──────────────────────────────┘
         │
┌────────▼──────────────────────────────┐
│  Geometry Regenerated & Rendered      │
│  - Canvas updates within 100ms        │
└──────────────────────────────────────┘
```

### Mathematical Pipeline

```
Input: EmfParams {f, A, φ, pol_mode, t}
  │
  ├─► polarization_matrix = getPolarization(pol_mode, eccentricity)
  │
  ├─► wavelength λ = c / f  (handle f=0 gracefully)
  │
  ├─► For each sample position x along propagation:
  │   │
  │   ├─► ω = 2πf  (angular frequency)
  │   ├─► k = 2π/λ  (wave number)
  │   ├─► phase_arg = ωt - kx  (space-time phase)
  │   │
  │   ├─► E_magnitude = A × sin(phase_arg)
  │   ├─► B_magnitude = E_magnitude × c_factor
  │   │
  │   ├─► Apply polarization_matrix to get E vector
  │   ├─► Compute B = normalize(propagation) × E / c
  │   │
  │   └─► Verify: dot(E, B) ≈ 0 ✓
  │
  └─► Output: WaveSample[] for rendering

```

---

## Complexity Tracking

| Issue | Why Needed | Simpler Alternative Rejected Because |
|-------|-----------|--------------------------------------|
| R3F abstraction layer | React Three Fiber adds complexity vs. raw Three.js | Necessary for React ecosystem integration, hooks compatibility, proper cleanup + memory management |
| Memoization strategy | useCallback/useMemo adds logic to hooks | Required to prevent geometry re-generation on every render (60fps constraint); without it, frame drops inevitable |
| Zustand selectors | Adds store subscription pattern vs. direct read | Enables component isolation; each component only re-renders on its specific selector change, not store-wide updates |
| Shader code (GLSL) | Binary file dependencies + compilation overhead | E-field glow effect requires fragment shader; CSS not sufficient for visual quality target |
| localStorage wrapper | Error handling + graceful fallback | Browser can disable localStorage; presets must work in-session without persistence |

**Conclusion**: None of these represent an architectural violation of the Constitution. All are justified by performance constraints (60fps, <100ms latency) or SOLID compliance (single responsibility, dependency inversion). Each adds complexity intentionally to improve isolation and testability.

---

## Phase-Gated Delivery

### Phase 1: Core Math Engine & Basic Visualization (Weeks 1-2)

**User Story**: *As a student, I want to see an electromagnetic wave animating in 3D so I can understand wave propagation.*

**Deliverables**:

1. **Types** (`src/features/emf-visualizer/types/index.ts`)
   - Vector3, Vector4 for 3D geometry
   - EmfParams (frequency, amplitude, phase, polarization mode)
   - WaveSample (point + E field + B field + timestamp)
   - RenderSettings (camera position, animation state)
   - Preset configuration type

2. **Math Engine** (`src/features/emf-visualizer/lib/`)
   - `wave.ts`: Generate E(x,t) and B(x,t) for linear polarization
   - `polarization.ts`: Transformation matrix for linear mode (stub for circular/elliptical Phase 2)
   - `math.ts`: Vector operations (dot, cross, magnitude, normalize)
   - `sampling.ts`: Generate n sample points along X-axis
   - `constants.ts`: Physical constants (c = 1.0 normalized, μ₀, ε₀)
   - `validators.ts`: Input range checking, error factory

3. **State Management** (`src/features/emf-visualizer/state/`)
   - Zustand store with EmfParams, animation time, render settings
   - Selectors for components (memoized derivations)
   - Integration tests verifying state immutability

4. **Basic Canvas Component** (`src/features/emf-visualizer/components/VisualizerCanvas.tsx`)
   - React Three Fiber canvas wrapper
   - Render curve visualization of E and B fields
   - Linear polarization only

5. **Animation Hook** (`src/features/emf-visualizer/hooks/useWaveAnimation.ts`)
   - requestAnimationFrame loop with Δt calculation
   - Game loop pattern: advance time, compute samples, render

6. **Simple Control Panel** (`src/features/emf-visualizer/components/ControlPanel.tsx`)
   - Sliders for frequency, amplitude, phase
   - State dispatch via Zustand
   - Input validation with error feedback

7. **Unit Tests** (`src/features/emf-visualizer/lib/__tests__/`)
   - Math module: 100% coverage
     - Wave equation: E ⊥ B (dot product tolerance ±0.01)
     - Wavelength formula: λ = c/f accurate to ±2%
     - Phase continuity across sample boundaries
   - Validator tests: Boundary conditions (f=0, A=0, φ=2π)
   - Sampling tests: Even distribution, correct count

**Exit Criteria**:
- ✅ Canvas renders at 60 fps (profiled on RTX 3070)
- ✅ Parameter changes appear in visualization within 100ms
- ✅ All math tests pass with 100% coverage
- ✅ TypeScript: No errors in strict mode
- ✅ VCS: Code merged with passing CI

---

### Phase 2: Polarization Modes & Interaction (Weeks 3-4)

**User Story**: *As an educator, I want to toggle between polarization modes (linear, circular, elliptical) and save preset configurations, so I can teach different EM phenomena.*

**Deliverables**:

1. **Polarization Transforms** (`src/features/emf-visualizer/lib/polarization.ts`)
   - Circular-right-handed: E field traces helix clockwise
   - Circular-left-handed: E field traces helix counter-clockwise
   - Elliptical: Parametrized by eccentricity angle
   - Smooth transitions on mode change (cross-fade over 300ms)

2. **Render Modes**
   - `renderers/FieldGeometry.tsx`: Curve mode (Phase 1 continuation)
   - `renderers/VectorField.tsx`: Vector mode (magnitude arrows at sample points)
   - `renderers/HybridRenderer.tsx`: Curve + vectors combined

3. **Preset System** (`src/features/emf-visualizer/utils/presets.ts`)
   - Built-in presets (Linear-Y, Circular-RH, Circular-LH, Elliptical-1:2)
   - localStorage persistence with error handling
   - Custom preset save/load UI

4. **Component Additions**
   - `PresetSelector.tsx`: Dropdown + load/save buttons
   - `InfoPanel.tsx`: Display current freq, wavelength, polarization, LaTeX equations
   - `CameraControls.tsx`: Orbit camera (drag rotate, scroll zoom, reset button)

5. **State Extensions**
   - Store: selectedRenderMode, currentPresetId, cameraPosition/rotation
   - Selectors: derivedWaveLength, isCameraDefault, etc.

6. **Component Tests** (`src/features/emf-visualizer/components/__tests__/`)
   - PresetSelector: Load preset → state updates correctly
   - InfoPanel: Displays accurate wavelength, polarization label
   - CameraControls: Orbit interactions update camera state
   - ControlPanel: Mode switching doesn't interrupt animation

**Exit Criteria**:
- ✅ All 3 render modes functional
- ✅ Presets switch within 200ms, no animation stutter
- ✅ InfoPanel updates real-time (latency <50ms)
- ✅ Camera controls responsive (latency <30ms)
- ✅ Component tests >85% coverage
- ✅ localStorage fallback works (custom presets don't persist but no errors)

---

### Phase 3: Polish, Advanced Features & Testing (Weeks 5-6)

**User Story**: *As an advanced student, I want to input precise parameter values, adjust animation speed, pause/resume, and have full keyboard access so I can explore specific EM phenomena and present findings accessibly.*

**Deliverables**:

1. **Source Mode** (`src/features/emf-visualizer/components/SourceMode.tsx`)
   - Numeric inputs for frequency, amplitude, phase with unit display
   - Input validation with helpful error messages
   - Custom preset save from current params

2. **Animation Control**
   - Pause/Resume button (preserves animation state, toggles isAnimating)
   - Animation speed multiplier (0.1x to 10x via slider)
   - Frame rate monitor (FPS display in dev mode)

3. **Accessibility Polish**
   - Keyboard navigation: Tab through all controls, Enter to activate
   - Focus: Visible focus outline on all interactive elements
   - Live regions: InfoPanel updates broadcast via aria-live
   - Labels: All inputs have explicit `<label>` elements
   - Color: Verify WCAG AA contrast (E-field gold >7:1, B-field cyan >4.5:1)
   - Error handling: Graceful WebGL fallback message if canvas unsupported

4. **Advanced Polarization**
   - Elliptical eccentricity slider (0 = circular, 1 = linear)
   - Handedness toggle (right-handed vs. left-handed)
   - Animated transitions between eccentricity values

5. **Shaders & Visuals**
   - Glow effect shader (fragment shader for E and B field lines)
   - Dark theme configuration (background #0a0e27, glowing curves)
   - Line rendering optimization (memoized BufferGeometry)

6. **Testing Suite Completion**
   - Integration tests: Full user journey (adjust params → preset load → pause → resume)
   - E2E tests: Edge cases (f=0 Hz, A=0, rapid slider drag, WebGL unavailable)
   - Performance profiling: Memory baseline, frame rate under load
   - Accessibility audit: axe-core automated tests for WCAG AA

7. **Documentation**
   - Feature README with usage guide
   - API docs (JSDoc comments on all public functions)
   - Type definitions exported for external consumers
   - Developer onboarding guide (setup, test running, build commands)

**Exit Criteria**:
- ✅ All 18 functional requirements implemented
- ✅ All 4 user journeys validated (manual + automated tests)
- ✅ All acceptance criteria met (AC-1 through AC-18)
- ✅ Test coverage >90% (line + branch)
- ✅ Performance: ≥60 fps, <100ms latency, <150MB memory
- ✅ Accessibility: WCAG 2.1 AA (keyboard nav, contrast, focus, labels)
- ✅ Bundle size <450 KB gzip
- ✅ VCS: Merged with all reviews approved

---

## Data Model Deep-Dive

### Core Types

```typescript
// Fundamental 3D point/vector
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Polarization mode enumeration
type PolarizationMode = 
  | 'linear' 
  | 'circular-right' 
  | 'circular-left' 
  | 'elliptical';

// Render visualization style
type RenderMode = 'curve' | 'vector' | 'hybrid';

// Primary parameter configuration
interface EmfParams {
  frequency: number;              // Hz (1 - 10^24)
  amplitude: number;              // Field magnitude (0.1 - 10)
  phase: number;                  // Radians (0 - 2π)
  polarization: PolarizationMode;
  ellipticityAngle?: number;      // Radians (0 - π/2)
  handedness?: 'right' | 'left';  // For circular/elliptical
  animationSpeed: number;         // Multiplier (0.1 - 10)
}

// Single sample point in animation
interface WaveSample {
  position: Vector3;              // Point along X-axis
  eField: Vector3;                // Electric field vector
  bField: Vector3;                // Magnetic field vector
  timestamp: number;              // Animation time (seconds)
}

// Preset configuration for quick loading
interface PresetConfig {
  id: string;
  name: string;
  description: string;
  params: EmfParams;
  renderMode: RenderMode;
  createdAt: number;              // Timestamp
}

// Complete visualizer state
interface VisualizerState {
  params: EmfParams;
  renderMode: RenderMode;
  isAnimating: boolean;
  currentTime: number;            // Animation timeline (seconds)
  cameraPosition: Vector3;        // Orbit camera position
  cameraRotation: { x: number; y: number };
  selectedPresetId: string | null;
  presets: PresetConfig[];        // User-defined presets
  fpsMonitor: { fps: number; avgFrameTime: number };
}
```

### Zustand Store Schema

```typescript
// Zustand store state
type VisualizerStore = VisualizerState & {
  // Actions
  updateParams: (params: Partial<EmfParams>) => void;
  setRenderMode: (mode: RenderMode) => void;
  advanceTime: (deltaTime: number) => void;
  toggleAnimation: () => void;
  setCameraPosition: (pos: Vector3) => void;
  setCameraRotation: (rot: { x: number; y: number }) => void;
  loadPreset: (id: string) => void;
  savePreset: (preset: PresetConfig) => void;
  updateFpsMonitor: (fps: number, frameTime: number) => void;
};

// Memoized selectors (derived state)
const selectEmfParams = (state: VisualizerState) => state.params;
const selectWaveLength = (state: VisualizerState) => 1.0 / state.params.frequency; // normalized c=1
const selectIsCameraDefault = (state: VisualizerState) => 
  state.cameraPosition.x === 0 && state.cameraPosition.y === 0;
```

---

## Design System Integration

### Color Palette (Dark Theme)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Near-black | #0a0e27 | Canvas background, UI bg |
| E-field (linear, Y) | Gold | #FFD700 | 3D curve rendering |
| B-field (linear, Z) | Cyan | #00BFFF | 3D curve rendering |
| Focus outline | Lime | #00FF00 | Keyboard focus indicator |
| Error text | Red | #FF6B6B | Validation messages |
| Info text | Gray | #CCCCCC | Labels, help text |

### CSS Variables (for theming)

```css
:root {
  /* Colors */
  --emf-bg-primary: #0a0e27;
  --emf-field-e: #FFD700;
  --emf-field-b: #00BFFF;
  --emf-focus: #00FF00;
  --emf-error: #FF6B6B;
  --emf-text: #CCCCCC;
  
  /* Spacing */
  --emf-spacing-xs: 4px;
  --emf-spacing-sm: 8px;
  --emf-spacing-md: 16px;
  --emf-spacing-lg: 24px;
  
  /* Typography */
  --emf-font-family: system-ui, sans-serif;
  --emf-font-size-sm: 12px;
  --emf-font-size-md: 14px;
  --emf-font-size-lg: 16px;
  
  /* Animation */
  --emf-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Testing Strategy

### Unit Tests (Math Engine) — Phase 1

**Coverage Target**: 100% of `lib/` directory

```
lib/wave.test.ts:
  ✓ Linear polarization: E and B orthogonal (dot product tolerance ±0.01)
  ✓ Wavelength formula: λ = c/f accurate to ±2% across range [1Hz, 10^24Hz]
  ✓ Phase continuity: Sample at x=0, x=0.5λ, x=λ consistent
  ✓ Frequency=0: Returns static field (no oscillation)
  ✓ Amplitude=0: Returns zero vectors

lib/polarization.test.ts:
  ✓ Circular-right: E field traces clockwise helix
  ✓ Circular-left: E field traces counter-clockwise helix
  ✓ Elliptical: Eccentricity 0→1 smoothly transitions
  ✓ Mode transition: Cross-fade preserves continuity

lib/math.test.ts:
  ✓ Dot product: orthogonal vectors = 0±0.01
  ✓ Cross product: |A × B| = |A||B|sin(θ)
  ✓ Normalization: |normalize(v)| = 1
  ✓ Precision: ±1000 unit calculations <0.1% error

lib/validators.test.ts:
  ✓ Frequency in [1Hz, 10^24Hz] accepted
  ✓ Out-of-range rejected with error message
  ✓ Invalid polarization mode caught
```

### Component Tests (React Layer) — Phase 2

**Coverage Target**: >85% of `components/` directory

```
components/__tests__/ControlPanel.test.tsx:
  ✓ Frequency slider: Changes dispatched to store
  ✓ Input validation: Out-of-range values rejected
  ✓ Error message: Displayed for invalid input

components/__tests__/PresetSelector.test.tsx:
  ✓ Load preset: Store params updated correctly
  ✓ Save custom preset: localStorage called (or graceful failure)
  ✓ Preset list: Populated and selectable

components/__tests__/InfoPanel.test.tsx:
  ✓ Wavelength display: Matches calculated λ = c/f
  ✓ Polarization label: Updated on mode change
  ✓ Updates in real-time: Sub-50ms latency

components/__tests__/VisualizerCanvas.test.tsx (R3F):
  ✓ Canvas renders (using @react-three/test-renderer)
  ✓ E and B curves rendered
  ✓ Mode switching: Doesn't unmount canvas
```

### Integration Tests (Cross-Layer) — Phase 3

**Coverage Target**: >90% overall code coverage

```
integration.test.ts:
  ✓ User journey: Open → Adjust freq → Observe animation
  ✓ Preset workflow: Select preset → Load → Verify state
  ✓ Pause/Resume: State preserved, animation continues correctly
  ✓ Camera interaction: Drag updates view, reset returns to default
  ✓ Keyboard navigation: Tab through all controls + Shift+Tab reverse
  ✓ Edge case: Frequency=0 → display static field
  ✓ Edge case: WebGL unavailable → show fallback message
  ✓ Performance: Frame rate maintained >60fps, memory <150MB
```

### Accessibility Tests — Phase 3

```
Automated (axe-core):
  ✓ WCAG AA Contrast: E-field >7:1, B-field >4.5:1
  ✓ Focus visibility: Outline present on all controls
  ✓ Labels: All inputs have associated labels
  ✓ Keyboard access: Tab order logical, no traps

Manual (checklist):
  ✓ Screen reader: Info panel updates announced via aria-live
  ✓ Keyboard: All features accessible without mouse
  ✓ Error handling: Validation messages clear and helpful
```

---

## Implementation Milestones & Checkpoints

| Milestone | Date | Deliverable | Gate |
|-----------|------|-------------|------|
| **Phase 1 Kickoff** | Week 1, Day 1 | Types + Math module skeleton | ✅ Reviewed in PR |
| **Phase 1 Math Complete** | Week 1, Day 5 | wave.ts, polarization.ts test coverage 100% | ✅ All tests green, CI pass |
| **Phase 1 Canvas Basic** | Week 2, Day 1 | VisualizerCanvas renders E+B curves | ✅ 60fps baseline, <100ms latency |
| **Phase 1 Exit Gate** | Week 2, Day 5 | State + controls + animation loop | ✅ Phase 1 acceptance criteria met |
| **Phase 2 Kickoff** | Week 3, Day 1 | Renderer layer refactor + presets skeleton | ✅ Design review pass |
| **Phase 2 Presets Complete** | Week 3, Day 5 | PresetSelector, InfoPanel, all modes working | ✅ Component tests >85%, localStorageOK |
| **Phase 2 Exit Gate** | Week 4, Day 5 | Full interaction model validated | ✅ Phase 2 acceptance criteria met |
| **Phase 3 Kickoff** | Week 5, Day 1 | SourceMode skeleton + shader research | ✅ Design review pass |
| **Phase 3 Polish** | Week 5, Day 5 | Accessibility audit, performance profiling | ✅ WCAG AA pass, axe-core clean |
| **Phase 3 Exit Gate** | Week 6, Day 5 | All features, tests >90%, docs complete | ✅ Final review approval |
| **Release** | Week 6, Day 10 | Deploy to production | ✅ VCS tag, changelog, announcement |

---

## Success Metrics & Validation Plan

### Metric 1: Performance (60 fps)
- **Target**: ≥60 fps during 5-minute animation session
- **Measurement**: GPU profiler (Chrome DevTools > Performance tab)
- **Validation**: Automated performance test in CI; manual profiling before Phase 1 exit
- **Acceptance**: p95 frame time <16ms, p99 <25ms

### Metric 2: Interaction Latency (<100ms)
- **Target**: Parameter change → visual update <100ms
- **Measurement**: Timestamp deltas (Date.now() at input → at render)
- **Validation**: Integration test with synthetic parameter updates
- **Acceptance**: >95% of updates meet target

### Metric 3: Mathematical Correctness (E ⊥ B)
- **Target**: dot(E, B) ≈ 0 to ±0.01 tolerance
- **Measurement**: Math test assertions with 1000 samples across parameter space
- **Validation**: Jest unit tests in Phase 1
- **Acceptance**: 100% pass rate

### Metric 4: Polarization Accuracy (λ formula)
- **Target**: Rendered wavelength = c/f to ±2% across [1Hz, 10²⁴Hz]
- **Measurement**: Computed λ vs. formula result
- **Validation**: Parametrized property test (100+ frequency points)
- **Acceptance**: 100% within ±2%

### Metric 5: User Clarity (Educator Feedback)
- **Target**: 90% of educators report understanding E ⊥ B after demo
- **Measurement**: Post-demo survey or user testing session
- **Validation**: Qualitative feedback from 3-5 physics educators
- **Acceptance**: Clear visual distinction between E/B, smooth animation

### Metric 6: Code Quality (>90% test coverage)
- **Target**: >90% line + branch coverage
- **Measurement**: Jest coverage report
- **Validation**: Coverage enforced in CI; fail build if <90%
- **Acceptance**: Green coverage report before Phase 3 exit

### Metric 7: Bundle Size (<450 KB gzip)
- **Target**: Feature module <450 KB gzip
- **Measurement**: webpack-bundle-analyzer or bundle-size npm script
- **Validation**: Automated check in CI
- **Acceptance**: No regression; Phase 3 exit requires clean report

### Metric 8: Accessibility (WCAG 2.1 AA)
- **Target**: All controls navigable via keyboard; contrast ≥4.5:1 (AA)
- **Measurement**: Manual keyboard test + axe-core automated audit
- **Validation**: Phase 3 gate; axe violations 0
- **Acceptance**: Full keyboard access, no contrast failures

---

## Risks, Mitigations & Contingencies

| Risk | Probability | Impact | Mitigation | Contingency |
|------|-------------|--------|-----------|------------|
| R3F / Three.js performance below 60fps target | Medium | High | Profile early (Phase 1 week 2); benchmark on RTX 3070; optimize geometry batching | Reduce sample count; switch to instanced rendering; defer to Phase 2 if critical |
| Polarization math errors (E ⊥ B not maintained) | Low | High | 100% math test coverage; all transforms verified against canonical refs; peer review | Roll back polarization changes; revert to linear-only; extend Phase 1 |
| State sync bugs during rapid parameter changes | Low | Medium | Zustand selector tests; mutation tests; limit update frequency (debounce) | Add state validation layer; log state transitions; manual testing |
| Browser WebGL support inconsistent | Medium | Low | Test on Chrome, Firefox, Safari; fallback message if WebGL 2 unavailable | Provide non-WebGL fallback (canvas 2D or static image) |
| localStorage disabled → custom presets lost | Low | Low | Graceful fallback; no error thrown; in-session functionality preserved | Document limitation; suggest localStorage re-enable |
| Floating-point precision issues at extreme frequencies | Low | Medium | Extend math test coverage near boundaries; use double-precision calculations | Cap frequency output to practical range; document limitation |
| Keyboard navigation accessibility missed | Low | Medium | Phase 3 gate: manual tab-through test; axe-core automated audit | Extend Phase 3 timeline; allocate accessibility sprint |
| User confusion on polarization modes (UX fail) | Medium | Medium | Rich InfoPanel with equations + visual indicators; preset descriptions; docs | Iterate on preset names/descriptions; gather educator feedback early |

---

## Dependencies & External Constraints

### Build & Runtime
- Node.js 18+ (for TS compilation, jest, webpack)
- npm 9+ or yarn 4+ (package management)
- TypeScript 5.x (strict mode mandatory)
- Next.js 14.x build pipeline

### Browser APIs Required
- WebGL 2.0 (Three.js requirement; fallback message if unavailable)
- requestAnimationFrame (animation loop)
- localStorage (custom presets; graceful fallback if disabled)
- ResizeObserver (canvas responsiveness)

### Third-Party Libraries (Fixed Versions in package.json)
- react@18.x (React core)
- three@150.x (WebGL engine)
- @react-three/fiber@8.x (React Three Fiber)
- zustand@4.x (state management)
- @react-three/test-renderer@13.x (component testing)
- jest@29.x + ts-jest (testing framework)

### External Services
- None (all computation local; no API calls)

---

## Constitutional Compliance Summary

✅ **I. Feature-Boundary Architecture**
- EMF Visualizer isolated in feature module with clear layer separation
- Math engine in `lib/` reusable without React dependency
- No cross-feature dependencies or global state pollution

✅ **II. Dependency Inversion & SOLID**
- Each module has single responsibility (wave gen, polarization, rendering, state, UI)
- Components dumb/presentational; hooks manage logic; services encapsulate business rules
- All math functions pure; Zustand store injected via hooks; no hard-coded dependencies

✅ **III. Test & Validation Gates**
- Math module: 100% coverage before Phase 2 begins
- Components: >85% coverage before Phase 3 begins
- Integration tests: Full user journey validated before exit gate
- Acceptance criteria: AC-1 through AC-18 explicitly verified

✅ **IV. Design System & Accessibility**
- Dark theme with CSS custom properties (MUI-compatible tokens)
- WCAG 2.1 AA compliance: keyboard nav, focus visibility, contrast, labels
- Glow shader for visual enhancement; no hardcoded colors in component code

✅ **V. Observable, Safe Operations**
- Telemetry hooks for FPS monitoring and performance logging
- State immutability enforced by Zustand; no direct mutations
- Error boundaries for WebGL fallback; logging for parameter changes
- Zero security concerns (local-only computation, no external APIs)

**Final Status**: ✅ **PLAN APPROVED** — All 5 constitutional principles satisfied. No violations recorded. Complexity tracking shows all design decisions justified by performance or SOLID constraints.

---

## Next Steps & Hand-Off

1. **Review & Approval** (by engineering lead)
   - Constitution check reviewed
   - Project structure approved
   - Task breakdown validated

2. **Phase 1 Task Generation** (via `/speckit.tasks` command)
   - Generate granular tasks from Phase 1 deliverables
   - Assign story points and dependencies
   - Create VCS branch `001-emf-visualizer-phase1`

3. **Development Begins**
   - Engineer checks out Phase 1 branch
   - Sets up TypeScript strict mode, Jest, linting
   - Implements types and math module first (unblocks rendering work)
   - Runs test suite continuously (CI/CD gate)

4. **Weekly Reviews**
   - Monday: Milestone checkpoint (tasks on track?)
   - Thursday: Phase gate evaluation (exit criteria met?)
   - Friday: Risk/mitigation review (obstacles surfaced?)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-14 | Engineering Team | Initial plan from specification; all phases detailed |

---

**Status**: ✅ Ready for implementation  
**Approval Date**: [To be filled in by review lead]  
**Approved By**: [Engineering lead signature or GitHub review approval]
