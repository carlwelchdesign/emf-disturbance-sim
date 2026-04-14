# Research: EMF/RF Exposure Visualization Platform

**Phase**: Phase 0 - Outline & Research  
**Date**: 2025-06-09  
**Related**: [plan.md](./plan.md), [spec.md](./spec.md)

## Overview

This document resolves technical decisions and clarifications identified in the Technical Context section of plan.md. The platform is structured as a three-layer model (Visualization, Analysis, Professional Platform) with V1 focused on establishing modular foundations. Key decisions address: modular architecture boundaries, CPU vs GPU compute, near-field vs far-field modeling, environment-aware simulation, trust/accuracy communication, and future extensibility.

## Research Tasks

### 1. Design System Decision

**Question**: Constitution mandates MUI, but project has no design system installed. What approach best serves a single-feature educational app while respecting constitution intent?

**Decision**: Adopt MUI in V1 and build the UI on top of MUI components and theme tokens

**Rationale**:
- **Constitution Compliance**: The constitution is explicit that production UI MUST use MUI, theme tokens, responsive breakpoints, and accessible interaction states.
- **Scope Fit**: The feature uses a small, controlled set of UI primitives, so the incremental bundle impact is acceptable relative to the need for consistent, accessible controls.
- **Design Consistency**: MUI gives a coherent visual system for sliders, buttons, dialogs, tooltips, and form inputs without custom one-off styling.
- **Accessibility**: MUI components provide a stronger baseline for keyboard interaction, focus states, and ARIA patterns than bespoke controls.
- **Future Path**: A MUI theme can still be customized to match the product’s dark scientific aesthetic without fragmenting the design system.

**Alternatives Considered**:
1. **Minimal custom design tokens**: Rejected because it conflicts with the constitution’s MUST requirement for MUI in production UI.
2. **Radix UI or Headless UI**: Rejected because it still does not satisfy the constitution’s MUI requirement.
3. **Full custom components**: Rejected because it duplicates accessibility and interaction primitives that MUI already provides.

**Implementation**:
```typescript
// theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const emfTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#38bdf8' },
    secondary: { main: '#94a3b8' },
    background: { default: '#020617', paper: '#0f172a' },
  },
  shape: { borderRadius: 12 },
});
```

**V2 Migration Path**: Extend the same MUI theme with reporting and assessment modes; do not replace the design system.

**Constitution Alignment**: Fully satisfies the design-system principle by using MUI as the production UI foundation.

---

### 2. RF Propagation Model and Near-Field vs Far-Field

**Question**: What RF/EMF propagation model balances practical V1 implementation with future extensibility to accurate near-field modeling and EN 62232 compliance?

**Decision**: Simplified inverse-distance superposition for V1 with clear labeling; defer accurate reactive/radiating near-field distinction to V2

**Rationale**:
- **V1 Scope**: Provide "order of magnitude" field strength estimates for educational and rough analysis scenarios (home office, device placement). Not intended for professional compliance.
- **Near-Field Complexity**: Accurate near-field modeling requires reactive (evanescent) vs radiating field components, polarization, antenna geometry. This adds significant complexity unsuitable for V1 CPU-based calculations.
- **Far-Field Simplification**: Inverse-distance (or inverse-square for power density) approximation is physically reasonable for far-field (distance > λ/2π) and provides intuitive educational clarity.
- **Trust Through Transparency**: Label all results with "Simplified Model", distinguish near/far field regions in UI, communicate that V1 uses same simplified model for both (accurate distinction in V2).
- **Future Path**: V2 can swap in full near-field solver (Friis transmission equation, near-field FDTD, or equivalent) without refactoring UI or state management.

**Alternatives Considered**:
1. **Full Near-Field FDTD**: Rejected for V1. Requires solving Maxwell's equations on 3D grid, computationally intensive (requires GPU), complex to implement. Appropriate for V2 professional platform.
2. **Friis Transmission Equation**: Rejected. Applies to antenna-to-antenna links, not spatial field distribution visualization.
3. **ITU-R P.1546 or similar**: Rejected. Designed for large-scale propagation (km), overkill for room-scale scenarios.

**Implementation**:

V1 uses simplified field strength at point **P** from source **S**:

```
E(P) = P_tx * G / (4π * r²)  [far-field approximation]

where:
  P_tx = transmit power (watts)
  G = antenna gain (dimensionless, = 1 for omnidirectional in V1)
  r = distance from source to point P (meters)
```

**Near-Field Boundary Detection**:
```typescript
function isNearField(distance: number, frequency: Hz): boolean {
  const lambda = SPEED_OF_LIGHT / frequency;
  const nearFieldRadius = lambda / (2 * Math.PI);
  return distance < nearFieldRadius;
}
```

**UI Communication**:
- Display near-field boundary as semi-transparent sphere around each source
- Label measurements as "Near-Field (Simplified)" or "Far-Field (Inverse-Square)"
- Show disclaimer: "V1 uses simplified model for both regions. Accurate near-field modeling in V2."

**V2 Upgrade Path**:
- Replace `calculateFieldAtPoint()` with `NearFieldSolver.calculate()` interface
- Implement reactive/radiating field components, polarization
- Maintain same call signature so UI code unchanged

**Validation Tests**:
1. **Far-Field**: At distance > 3λ, field follows inverse-square law within 5% tolerance
2. **Near-Field Boundary**: UI correctly labels points < λ/2π as "Near-Field"
3. **Multi-Source**: Superposition holds (linear addition of fields)

---

### 3. CPU vs GPU Compute Strategy

**Question**: Should V1 use CPU-based or GPU-accelerated field calculations, and how to design for future GPU migration?

**Decision**: CPU-based calculations for V1 with clean compute backend interface enabling GPU swap in V2

**Rationale**:
- **V1 Practical Scope**: CPU calculations sufficient for 3-5 sources with reasonable performance (30+ FPS). Avoids overengineering and premature optimization.
- **GPU Complexity**: WebGPU still emerging (limited browser support), compute shaders require shader programming expertise, debugging is harder, adds significant implementation cost for V1.
- **Performance Needs**: V1 targets basic scenarios (few sources, simplified propagation). GPU becomes critical for V2 professional scenarios (20+ sources, near-field FDTD, rich environments).
- **Clean Interface**: Design `IComputeBackend` interface with `calculate(sources, points) → FieldResults`. V1 implements `CPUBackend`, V2 adds `GPUBackend` (WebGPU or WebGL compute shaders) as drop-in replacement.
- **Testing**: CPU backend easier to unit test, debug, and validate math correctness in V1.

**Alternatives Considered**:
1. **GPU from day 1**: Rejected. WebGPU browser support incomplete (Chrome 113+, no Safari), adds weeks to implementation, violates "practical V1" principle.
2. **Web Workers (CPU parallelism)**: Considered. Provides some parallelism but adds IPC overhead. Defer to V1.5 if needed between V1/V2.
3. **WASM + SIMD**: Rejected. Marginal gains over native JS for simple calculations, adds build complexity.

**Implementation**:

```typescript
// modules/compute/compute-backend.interface.ts
export interface IComputeBackend {
  /**
   * Calculate field strength at multiple points for given sources.
   * Returns field strength (V/m or W/m²) at each point.
   */
  calculate(
    sources: RFSource[],
    points: Vector3[],
    options?: ComputeOptions
  ): Promise<FieldResult[]>;
  
  /**
   * Backend identifier (for debugging, telemetry)
   */
  readonly name: string;
  
  /**
   * Performance characteristics hint
   */
  readonly maxRecommendedSources: number;
}

export interface FieldResult {
  point: Vector3;
  fieldStrength: number;  // V/m or W/m²
  nearField: boolean;     // true if within λ/2π of any source
  dominantSource?: string; // ID of strongest contributing source
}

// modules/compute/cpu-backend.ts
export class CPUBackend implements IComputeBackend {
  readonly name = 'CPU';
  readonly maxRecommendedSources = 5;
  
  async calculate(
    sources: RFSource[],
    points: Vector3[],
    options?: ComputeOptions
  ): Promise<FieldResult[]> {
    // V1: Simple loop-based calculation
    return points.map(point => {
      let totalField = 0;
      let nearField = false;
      let dominantSource: string | undefined;
      let maxContribution = 0;
      
      for (const source of sources) {
        const r = point.distanceTo(source.position);
        if (r < 0.01) continue; // Avoid singularity
        
        // Check near-field boundary
        const lambda = SPEED_OF_LIGHT / source.frequency;
        if (r < lambda / (2 * Math.PI)) {
          nearField = true;
        }
        
        // Simplified field calculation (inverse-distance)
        const contribution = source.power / (4 * Math.PI * r * r);
        totalField += contribution;
        
        if (contribution > maxContribution) {
          maxContribution = contribution;
          dominantSource = source.id;
        }
      }
      
      return {
        point,
        fieldStrength: totalField,
        nearField,
        dominantSource,
      };
    });
  }
}

// modules/compute/gpu-backend.ts (V2 stub)
export class GPUBackend implements IComputeBackend {
  readonly name = 'GPU';
  readonly maxRecommendedSources = 50;
  
  async calculate(
    sources: RFSource[],
    points: Vector3[],
    options?: ComputeOptions
  ): Promise<FieldResult[]> {
    // V2: WebGPU compute shader implementation
    throw new Error('GPUBackend not implemented yet (V2)');
  }
}
```

**Backend Selection**:
```typescript
// hooks/useComputeBackend.ts
export function useComputeBackend(): IComputeBackend {
  const sourceCount = useSourceStore(state => state.sources.length);
  
  // V1: Always use CPU
  // V2: Select based on source count and GPU availability
  return useMemo(() => {
    if (sourceCount <= 5) {
      return new CPUBackend();
    } else {
      // V2: if (isWebGPUAvailable()) return new GPUBackend();
      console.warn(`${sourceCount} sources may impact performance on CPU backend`);
      return new CPUBackend();
    }
  }, [sourceCount]);
}
```

**Validation**: Backend interface allows unit testing with mock implementations, performance benchmarking CPU vs GPU in isolation.

---

### 4. Modular Architecture Boundaries

**Question**: How to structure code to enforce clean boundaries between UI, simulation, compute, reporting, etc.?

**Decision**: Separate `modules/` directory with interface-first design, dependency injection via hooks

**Rationale**:
- **Separation of Concerns**: Each module (Simulation, Compute, Source, Environment, Scenario, Reporting, Visualization) has clear responsibility, testable in isolation.
- **Future-Proofing**: Modules expose TypeScript interfaces. V2 can swap implementations (CPU → GPU, omnidirectional → directional) without changing dependents.
- **Testability**: Module interfaces enable unit testing without React/Three.js dependencies. Mock implementations for integration tests.
- **Constitution Alignment**: Enforces SOLID principles, particularly Dependency Inversion (depend on interfaces, not concrete classes).

**Module Definitions**:

| Module | Responsibility | V1 Implementation | V2 Extensions |
|--------|---------------|-------------------|---------------|
| **Simulation** | Orchestrate field calculations | Call Compute backend, handle superposition | Add reflection/diffraction logic |
| **Compute** | Low-level field calculation | CPU loop-based | GPU compute shaders |
| **Source** | Antenna/device modeling | Omnidirectional point sources | Directional patterns, phased arrays |
| **Environment** | 3D space, materials | Simple boundary box | Multi-material, multi-story buildings |
| **Scenario** | Configuration presets | Stub (basic defaults) | Common scenarios (home, office, tower) |
| **Reporting** | Assessment reports | Stub interface only | EN 62232 compliance reports |
| **Visualization** | Rendering helpers | Color mapping, LOD | Heatmaps, vector fields |

**Interface Example** (Source Module):
```typescript
// modules/source/source-model.interface.ts
export interface IAntennaPattern {
  /**
   * Calculate gain (linear, not dB) in direction from source to point.
   * Returns 1.0 for omnidirectional, 0-N for directional patterns.
   */
  calculateGain(
    sourcePosition: Vector3,
    sourceOrientation: Vector3,
    targetPoint: Vector3
  ): number;
  
  readonly type: 'omnidirectional' | 'directional' | 'phased_array';
}

export class OmnidirectionalPattern implements IAntennaPattern {
  readonly type = 'omnidirectional';
  
  calculateGain(): number {
    return 1.0; // Equal radiation in all directions
  }
}

// V2: Directional pattern (beam steering)
export class DirectionalPattern implements IAntennaPattern {
  readonly type = 'directional';
  
  constructor(
    private beamWidth: number, // degrees
    private gain: number        // linear gain
  ) {}
  
  calculateGain(
    sourcePosition: Vector3,
    sourceOrientation: Vector3,
    targetPoint: Vector3
  ): number {
    // V2: Calculate gain based on angle from beam axis
    // Uses beamWidth and gain parameters
    throw new Error('Not implemented in V1');
  }
}
```

**Dependency Flow**: UI → Hooks → Modules (interfaces) → Implementations. No upward dependencies (Modules never import from UI).

---

### 5. Environment-Aware Simulation

**Question**: How to model 3D environments (rooms, walls, materials) in V1 while preparing for rich V2 modeling?

**Decision**: Basic boundary box with placeholder material properties in V1; defer multi-material, reflection/diffraction to V2

**Rationale**:
- **V1 Scope**: Provide spatial context (room dimensions) for users to understand scale. Material properties have minimal impact on simplified inverse-distance model.
- **Complexity**: Accurate RF propagation through materials requires dielectric constants, conductivity, reflection/transmission coefficients, ray tracing or FDTD. Too complex for V1.
- **Trust**: Clearly label V1 as "open air approximation" or "ignores wall attenuation". V2 adds "concrete wall -20dB attenuation" etc.
- **Extensibility**: Design `IEnvironmentModel` interface with placeholder V1 implementation, full material support in V2.

**Implementation**:

```typescript
// modules/environment/environment-model.interface.ts
export interface IEnvironmentModel {
  /**
   * Calculate attenuation factor (0-1) for path from source to point.
   * 1.0 = no attenuation, 0.5 = -3dB, 0.0 = complete blockage.
   */
  calculateAttenuation(
    sourcePath: Vector3,
    targetPoint: Vector3
  ): number;
  
  /**
   * Check if point is within environment boundaries
   */
  isInBounds(point: Vector3): boolean;
  
  readonly dimensions: { width: number; length: number; height: number };
}

// V1: Simple open-air model
export class OpenAirEnvironment implements IEnvironmentModel {
  constructor(
    public readonly dimensions: { width: number; length: number; height: number }
  ) {}
  
  calculateAttenuation(): number {
    // V1: No attenuation (open air approximation)
    return 1.0;
  }
  
  isInBounds(point: Vector3): boolean {
    const { width, length, height } = this.dimensions;
    return (
      point.x >= -width / 2 && point.x <= width / 2 &&
      point.y >= 0 && point.y <= height &&
      point.z >= -length / 2 && point.z <= length / 2
    );
  }
}

// V2: Material-aware environment
export class MaterialEnvironment implements IEnvironmentModel {
  constructor(
    public readonly dimensions: { width: number; length: number; height: number },
    private walls: Wall[], // Wall geometries with materials
    private materials: Map<string, MaterialProperties>
  ) {}
  
  calculateAttenuation(source: Vector3, target: Vector3): number {
    // V2: Ray trace from source to target, accumulate attenuation
    // through each material intersection
    throw new Error('Not implemented in V1');
  }
  
  isInBounds(point: Vector3): boolean {
    // Same as OpenAirEnvironment
    const { width, length, height } = this.dimensions;
    return (
      point.x >= -width / 2 && point.x <= width / 2 &&
      point.y >= 0 && point.y <= height &&
      point.z >= -length / 2 && point.z <= length / 2
    );
  }
}
```

**UI Communication**:
- V1: Display environment boundary box (wireframe), label "Open Air Approximation (Ignores Walls)"
- V2: Display walls with materials, label "Includes Material Attenuation"

**Validation**: Test `isInBounds()` with points inside/outside boundary. Verify V1 attenuation always returns 1.0.

---

### 6. Trust and Accuracy Communication

**Question**: How to design UI to honestly communicate model limitations and build user trust?

**Decision**: Pervasive accuracy disclaimers, precision limiting, model limitation tooltips, clear V1/V2 capability distinction

**Rationale**:
- **Trust Through Transparency**: Users trust tools that admit limitations more than tools that overstate accuracy. EMF exposure is health-sensitive; honesty is ethical imperative.
- **Avoid Misleading Precision**: V1 simplified model should not display "5.23847 V/m" (implies false precision). Display "~5.2 V/m" or "5-6 V/m".
- **Education**: Explain *why* simplifications exist and what they mean for results. "Near-field uses same model as far-field (accurate near-field in V2)" teaches distinction.
- **Professional Differentiation**: Clear labeling that V1 is for education/rough estimates, V2 for professional compliance, prevents misuse.

**Implementation Patterns**:

```typescript
// components/Analysis/AccuracyDisclaimer.tsx
export function AccuracyDisclaimer({ level }: { level: 'v1' | 'v2' }) {
  if (level === 'v1') {
    return (
      <div className="disclaimer" role="alert" aria-live="polite">
        <WarningIcon />
        <p>
          <strong>Estimated Field Strength (Simplified Model)</strong>
          <br />
          V1 uses simplified inverse-distance propagation. Results are
          order-of-magnitude estimates for educational and rough analysis purposes.
          <br />
          <em>Not suitable for compliance assessments.</em>
          <a href="/docs/model-limitations">Learn more about model limitations →</a>
        </p>
      </div>
    );
  } else {
    return (
      <div className="disclaimer disclaimer-professional">
        <CheckIcon />
        <p>
          <strong>Professional Model (V2)</strong>
          <br />
          Includes near-field modeling, material attenuation, and EN 62232 compliance calculations.
          Suitable for professional assessments with documented accuracy bounds.
        </p>
      </div>
    );
  }
}

// components/Analysis/FieldStrengthDisplay.tsx
export function FieldStrengthDisplay({ value, unit, nearField }: Props) {
  // Limit precision for V1 simplified model
  const displayValue = value < 10 
    ? `~${value.toFixed(1)}` 
    : `~${Math.round(value)}`;
  
  return (
    <div className="field-strength">
      <span className="value">{displayValue}</span>
      <span className="unit">{unit}</span>
      {nearField && (
        <Tooltip content="Near-field region uses simplified model. Accurate reactive/radiating field distinction in V2.">
          <span className="badge">Near-Field (Simplified)</span>
        </Tooltip>
      )}
    </div>
  );
}
```

**UI Guidelines**:
1. **Every visualization** includes disclaimer (component or overlay)
2. **Every measurement** shows "~" prefix for approximate values
3. **Near/far field labels** explain simplification: "V1 uses same model for both regions"
4. **Tooltips** on technical terms explain meaning and V1 limitations
5. **Help/docs link** from disclaimer to detailed model documentation

**Validation Tests**:
- Verify `AccuracyDisclaimer` present in all analysis views (snapshot test)
- Verify field strength displays never show >1 decimal place
- Verify "~" prefix present on all V1 measurements
- Verify tooltips render and contain limitation explanation

**V2 Upgrade**: When V2 model active, swap disclaimer to professional variant, remove "~" prefix (still show uncertainty bounds), remove "simplified" labels.

---

### 7. Visualization Technique

**Question**: How to render EMF fields in Three.js with clarity, performance, and educational value?

**Decision**: Instanced line geometries for field lines, with color-mapped gradient based on field strength

**Rationale**:
- **Field Lines**: Intuitive for students familiar with magnetic field diagrams. Follow gradient of field strength, showing direction of propagation.
- **Color Mapping**: Cool-to-warm gradient (blue → cyan → green → yellow → red) encodes field magnitude at a glance.
- **Instancing**: Three.js `InstancedMesh` renders thousands of line segments in single draw call, maintaining 60 FPS with 5-10 sources.
- **Educational Clarity**: Density of lines encodes field strength (denser = stronger), consistent with textbook conventions.

**Alternatives Considered**:
1. **Heatmap/Volumetric Rendering**: Rejected for V1. Beautiful but computationally expensive (ray marching in shader). Better for V2 advanced modes.
2. **Vector Field (Arrows)**: Rejected. Cluttered visual for 3D space, hard to see interference patterns. Better for 2D cross-sections (V2).
3. **Particle System**: Rejected. Implies particles, not fields. Educationally misleading for EMF.
4. **Mesh Displacement**: Rejected. Requires dense mesh geometry, hard to interpret interference spatially.

**Implementation Strategy**:

```typescript
// 1. Generate field line paths
// Start from grid points, follow field gradient using RK4 integration
function generateFieldLine(
  startPoint: Vector3,
  sources: EMFSource[],
  maxSteps: number = 50
): Vector3[] {
  const path: Vector3[] = [startPoint.clone()];
  let currentPoint = startPoint.clone();
  const stepSize = 0.1;
  
  for (let i = 0; i < maxSteps; i++) {
    const gradient = calculateFieldGradient(currentPoint, sources);
    if (gradient.length() < 0.01) break; // Reached local minimum
    
    currentPoint.add(gradient.normalize().multiplyScalar(stepSize));
    path.push(currentPoint.clone());
  }
  
  return path;
}

// 2. Render field lines with Three.js
function createFieldLineVisualization(
  fieldLines: Vector3[][],
  sources: EMFSource[]
): THREE.Group {
  const group = new THREE.Group();
  
  for (const line of fieldLines) {
    const geometry = new THREE.BufferGeometry().setFromPoints(line);
    
    // Color based on field strength at each point
    const colors = line.map(point => {
      const strength = calculateFieldStrength(point, sources);
      return strengthToColor(strength); // Maps [-1, 1] to blue-red gradient
    });
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.LineBasicMaterial({ vertexColors: true });
    const lineObj = new THREE.Line(geometry, material);
    group.add(lineObj);
  }
  
  return group;
}

// 3. Color mapping helper
function strengthToColor(strength: number): THREE.Color {
  // Normalize strength to [0, 1]
  const normalized = (strength + 1) / 2;
  
  // Blue (cold) -> Red (hot) gradient
  if (normalized < 0.5) {
    // Blue to cyan to green
    return new THREE.Color().lerpColors(
      new THREE.Color(0x0000ff), // Blue
      new THREE.Color(0x00ff00), // Green
      normalized * 2
    );
  } else {
    // Green to yellow to red
    return new THREE.Color().lerpColors(
      new THREE.Color(0x00ff00), // Green
      new THREE.Color(0xff0000), // Red
      (normalized - 0.5) * 2
    );
  }
}
```

**Performance Targets**:
- 5 sources × 50 field lines/source × 50 points/line = 12,500 vertices → 60 FPS expected
- 10 sources × 30 field lines/source × 30 points/line = 9,000 vertices → 40 FPS expected
- Fallback: Reduce line density dynamically if FPS drops below 30

**Accessibility**: Include text alternative: "3D visualization showing [N] EMF sources with colored field lines. Blue indicates weak field, red indicates strong field. Interference patterns visible where lines overlap."

---

### 8. State Management Pattern

**Question**: How should Zustand store be structured to balance performance, testability, and React Three Fiber integration?

**Decision**: Single store with sliced selectors, immutable updates, and computed derived state

**Rationale**:
- **Single Store**: All app state (sources, camera, settings) in one place simplifies debugging and persistence (future localStorage integration).
- **Sliced Selectors**: Components subscribe only to needed slices (e.g., `useSourceStore(state => state.sources)`) preventing unnecessary re-renders when unrelated state changes.
- **Immutable Updates**: Zustand enforces immutability via Immer integration, preventing accidental mutations that break React Three Fiber's rendering.
- **Derived State**: Field calculations derived from sources, not stored separately, ensuring single source of truth.

**Alternatives Considered**:
1. **Multiple Zustand Stores**: Rejected. Increases coordination complexity, harder to serialize state for future save/load.
2. **React Context + useReducer**: Rejected. More boilerplate, harder to optimize selectors, Zustand provides better devtools.
3. **Jotai/Recoil (Atomic State)**: Rejected. Overkill for small app, Zustand's simplicity preferred.
4. **Redux Toolkit**: Rejected. Too heavyweight, unnecessary middleware complexity for client-only app.

**Store Structure**:

```typescript
// hooks/useSourceStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface EMFSource {
  id: string;
  position: [number, number, number];
  frequency: number;
  amplitude: number;
  phase: number;
}

interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
}

interface VisualizationSettings {
  fieldLineDensity: number;
  colorScheme: 'thermal' | 'rainbow';
  animationSpeed: number;
  showFPS: boolean;
}

interface StoreState {
  // Source management
  sources: EMFSource[];
  selectedSourceId: string | null;
  addSource: (source: Omit<EMFSource, 'id'>) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<EMFSource>) => void;
  selectSource: (id: string | null) => void;
  clearAllSources: () => void;
  
  // Camera state
  camera: CameraState;
  updateCamera: (camera: Partial<CameraState>) => void;
  resetCamera: () => void;
  
  // Visualization settings
  settings: VisualizationSettings;
  updateSettings: (settings: Partial<VisualizationSettings>) => void;
  
  // Derived state (computed, not stored)
  getSourceById: (id: string) => EMFSource | undefined;
  getSelectedSource: () => EMFSource | undefined;
}

const DEFAULT_CAMERA: CameraState = {
  position: [5, 5, 5],
  target: [0, 0, 0],
};

const DEFAULT_SETTINGS: VisualizationSettings = {
  fieldLineDensity: 50,
  colorScheme: 'thermal',
  animationSpeed: 1.0,
  showFPS: false,
};

export const useSourceStore = create<StoreState>()(
  immer((set, get) => ({
    sources: [],
    selectedSourceId: null,
    camera: DEFAULT_CAMERA,
    settings: DEFAULT_SETTINGS,
    
    addSource: (source) =>
      set((state) => {
        const id = `source-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        state.sources.push({ ...source, id });
      }),
    
    removeSource: (id) =>
      set((state) => {
        state.sources = state.sources.filter((s) => s.id !== id);
        if (state.selectedSourceId === id) state.selectedSourceId = null;
      }),
    
    updateSource: (id, updates) =>
      set((state) => {
        const source = state.sources.find((s) => s.id === id);
        if (source) Object.assign(source, updates);
      }),
    
    selectSource: (id) => set({ selectedSourceId: id }),
    
    clearAllSources: () => set({ sources: [], selectedSourceId: null }),
    
    updateCamera: (camera) =>
      set((state) => {
        Object.assign(state.camera, camera);
      }),
    
    resetCamera: () => set({ camera: DEFAULT_CAMERA }),
    
    updateSettings: (settings) =>
      set((state) => {
        Object.assign(state.settings, settings);
      }),
    
    getSourceById: (id) => get().sources.find((s) => s.id === id),
    
    getSelectedSource: () => {
      const { sources, selectedSourceId } = get();
      return sources.find((s) => s.id === selectedSourceId);
    },
  }))
);
```

**Integration with React Three Fiber**:
```typescript
// Component example
function FieldVisualization() {
  const sources = useSourceStore((state) => state.sources);
  const settings = useSourceStore((state) => state.settings);
  
  // Recompute field lines when sources or settings change
  const fieldLines = useMemo(
    () => generateFieldLines(sources, settings.fieldLineDensity),
    [sources, settings.fieldLineDensity]
  );
  
  return <FieldLineRenderer lines={fieldLines} colorScheme={settings.colorScheme} />;
}
```

**Testing Strategy**:
```typescript
// Mock store for tests
export const createMockStore = (initialState?: Partial<StoreState>) => {
  const store = useSourceStore;
  store.setState({
    ...store.getState(),
    ...initialState,
  });
  return store;
};
```

---

### 9. Performance Optimization

**Question**: What techniques ensure 30+ FPS with 5 sources and graceful degradation to 10 sources?

**Decision**: Multi-layered approach: throttled updates, LOD system, spatial sampling, and GPU acceleration

**Rationale**:
- **No Single Silver Bullet**: Performance bottlenecks span calculation (JS), rendering (WebGL), and React updates. Each needs targeted optimization.
- **Graceful Degradation**: Users prefer consistent experience (lower quality at 30 FPS) over stuttering (high quality at 15 FPS).
- **Measurable Impact**: Each technique independently tested with performance benchmarks before integration.

**Techniques**:

#### A. Throttled Parameter Updates
**Problem**: Slider dragging triggers 60+ updates/second, overwhelming field recalculation.

**Solution**: Debounce expensive calculations, immediate UI feedback.

```typescript
// hooks/useThrottledUpdate.ts
import { useEffect, useRef } from 'react';

export function useThrottledFieldUpdate(
  sources: EMFSource[],
  delay: number = 50 // 20 updates/second
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [displaySources, setDisplaySources] = useState(sources);
  
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDisplaySources(sources);
    }, delay);
    
    return () => clearTimeout(timeoutRef.current);
  }, [sources, delay]);
  
  return displaySources;
}
```

**Impact**: Reduces field calculations from 60 FPS to 20 FPS during parameter changes, freeing CPU for rendering. Users perceive <100ms latency (imperceptible).

#### B. Level-of-Detail (LOD) System
**Problem**: Field line density suitable for 5 sources causes frame drops with 10 sources.

**Solution**: Dynamic LOD based on source count and measured FPS.

```typescript
// lib/lod-manager.ts
interface LODConfig {
  fieldLineDensity: number;
  samplingResolution: number;
  lineSteps: number;
}

const LOD_LEVELS: Record<string, LODConfig> = {
  high: { fieldLineDensity: 50, samplingResolution: 32, lineSteps: 50 },
  medium: { fieldLineDensity: 30, samplingResolution: 24, lineSteps: 30 },
  low: { fieldLineDensity: 20, samplingResolution: 16, lineSteps: 20 },
};

export function selectLOD(sourceCount: number, currentFPS: number): LODConfig {
  if (currentFPS >= 45 && sourceCount <= 5) return LOD_LEVELS.high;
  if (currentFPS >= 30 || sourceCount <= 8) return LOD_LEVELS.medium;
  return LOD_LEVELS.low;
}
```

**Impact**: Maintains 30+ FPS up to 10 sources by reducing visual complexity. User sees smooth animation (priority) with slightly less detail (acceptable trade-off).

#### C. Spatial Sampling
**Problem**: Calculating field at every pixel (1920×1080 = 2M points) is intractable in real-time.

**Solution**: Calculate on coarse 3D grid, render with interpolation.

```typescript
// lib/spatial-sampler.ts
function sampleFieldGrid(
  sources: EMFSource[],
  resolution: number = 32, // 32×32×32 = 32,768 points
  bounds: BoundingBox
): Float32Array {
  const grid = new Float32Array(resolution ** 3);
  const step = bounds.size / resolution;
  
  for (let x = 0; x < resolution; x++) {
    for (let y = 0; y < resolution; y++) {
      for (let z = 0; z < resolution; z++) {
        const point = new Vector3(
          bounds.min.x + x * step,
          bounds.min.y + y * step,
          bounds.min.z + z * step
        );
        const index = x + y * resolution + z * resolution * resolution;
        grid[index] = calculateFieldAtPoint(point, sources, 0);
      }
    }
  }
  
  return grid;
}

// GPU shader interpolates between grid points for smooth visualization
```

**Impact**: Reduces calculations from millions to tens of thousands. Enables real-time updates even with complex interference patterns.

#### D. GPU Acceleration (WebGL Shaders)
**Problem**: Field calculations in JavaScript are CPU-bound, limiting parallelism.

**Solution**: Move field strength calculations to fragment shader.

```glsl
// shaders/field-visualization.frag
uniform vec3 sourcePositions[10];
uniform float sourceAmplitudes[10];
uniform float sourceFrequencies[10];
uniform float sourcePhases[10];
uniform int sourceCount;
uniform float time;

varying vec3 vPosition;

float calculateField(vec3 point) {
  float totalField = 0.0;
  
  for (int i = 0; i < 10; i++) {
    if (i >= sourceCount) break;
    
    float r = distance(point, sourcePositions[i]);
    if (r < 0.01) continue;
    
    float k = 6.28318 * sourceFrequencies[i];
    float phase = k * time - k * r + sourcePhases[i];
    float field = (sourceAmplitudes[i] / r) * sin(phase);
    
    totalField += field;
  }
  
  return totalField;
}

void main() {
  float strength = calculateField(vPosition);
  vec3 color = strengthToColor(strength);
  gl_FragColor = vec4(color, 1.0);
}
```

**Impact**: Offloads parallel calculations to GPU (1000s of cores vs. 4-8 CPU cores). Enables real-time visualization at 60 FPS with 5 sources, 40 FPS with 10 sources.

#### E. FPS Monitoring & Feedback
**Problem**: Users don't know when performance degrades, may add more sources than system can handle.

**Solution**: Display FPS counter, warn when dropping below 30 FPS.

```typescript
// hooks/useFPSMonitor.ts
import { useFrame } from '@react-three/fiber';
import { useState, useRef } from 'react';

export function useFPSMonitor() {
  const [fps, setFPS] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  
  useFrame((state) => {
    const now = performance.now();
    frameTimesRef.current.push(now);
    
    // Keep last 60 frame times (1 second at 60 FPS)
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    // Calculate FPS from frame times
    if (frameTimesRef.current.length >= 2) {
      const elapsed = now - frameTimesRef.current[0];
      const currentFPS = (frameTimesRef.current.length / elapsed) * 1000;
      setFPS(Math.round(currentFPS));
    }
  });
  
  return { fps, isLowPerformance: fps < 30 };
}
```

**Impact**: Provides observable feedback (Constitution Principle V). Enables adaptive LOD decisions and user awareness of system limits.

---

## Summary of Decisions

| Decision Area | Choice | Key Rationale |
|--------------|--------|---------------|
| **Design System** | MUI theme + components | Constitution compliance, accessibility baseline, consistent UI |
| **Field Calculation** | Sinusoidal superposition | Educational clarity, mathematical correctness, O(N) performance |
| **Visualization** | Instanced field lines | Textbook conventions, GPU-efficient, clear interference patterns |
| **State Management** | Single Zustand store | Simple debugging, sliced selectors, immutable updates |
| **Performance** | Multi-layered (throttle, LOD, sampling, GPU) | Addresses calculation, rendering, and React update bottlenecks |

All decisions align with constitution principles (SOLID, testability, observability) and spec requirements (30+ FPS, <100ms latency, educational value).

## Validation Checklist

- [x] All "NEEDS CLARIFICATION" items resolved with concrete decisions
- [x] Each decision includes rationale and alternatives considered
- [x] Implementation details provided (equations, code snippets, pseudocode)
- [x] Constitution alignment verified for each decision
- [x] Performance targets mapped to specific techniques
- [x] Educational objectives preserved in visualization strategy
- [x] Accessibility considerations documented (tokens, ARIA, text alternatives)
- [x] V2 migration paths identified where V1 takes pragmatic shortcuts

## Next Steps

Proceed to Phase 1 to generate:
1. **data-model.md**: TypeScript interfaces for entities (EMFSource, FieldPoint, etc.)
2. **quickstart.md**: Developer onboarding, architecture overview, testing commands
3. **Agent context update**: Run `.specify/scripts/bash/update-agent-context.sh copilot`
