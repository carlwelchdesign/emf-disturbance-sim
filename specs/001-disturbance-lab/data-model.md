# Data Model: EMF/RF Exposure Visualization Platform

**Phase**: Phase 1 - Design & Contracts  
**Date**: 2025-06-09  
**Related**: [plan.md](./plan.md), [research.md](./research.md), [spec.md](./spec.md)

## Overview

This document defines the data structures, TypeScript interfaces, and entity relationships for the EMF/RF Visualization Platform. The platform follows a three-layer model (Visualization, Analysis, Professional Platform) with modular architecture. All types are defined with validation rules, state transitions, and V1/V2 capability distinctions documented.

## Entity Definitions

### 1. RFSource (RF/EMF Source)

**Purpose**: Represents a radio frequency or electromagnetic field source (antenna, device) with configurable parameters.

**TypeScript Interface**:
```typescript
// types/source.types.ts

export interface RFSource {
  /** Unique identifier for the source */
  id: string;
  
  /** 3D position in world space (meters) */
  position: Vector3D;
  
  /** RF frequency in Hz (e.g., 2.4e9 for 2.4 GHz Wi-Fi) */
  frequency: number;
  
  /** Transmit power in watts or dBm */
  power: number;
  
  /** Power unit */
  powerUnit: 'watts' | 'dBm';
  
  /** Phase offset in radians (for multi-source scenarios, valid range: 0 - 2π) */
  phase: number;
  
  /** Antenna type (omnidirectional in V1, directional/phased in V2) */
  antennaType: 'omnidirectional' | 'directional' | 'phased_array';
  
  /** Antenna orientation (for directional antennas, V2) */
  orientation?: Vector3D;
  
  /** Antenna gain in linear units (default 1.0 for omnidirectional) */
  gain?: number;
  
  /** Whether the source is currently active */
  active: boolean;
  
  /** Display color for UI representation (optional, hex string) */
  color?: string;
  
  /** Human-readable label (optional, defaults to "Source N") */
  label?: string;
  
  /** Device type hint for UI (e.g., "Wi-Fi Router", "Cell Tower", "Bluetooth") */
  deviceType?: string;
}

export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

/** Parameters for creating a new source (id generated automatically) */
export type CreateSourceParams = Omit<RFSource, 'id'>;

/** Parameters for updating an existing source (all fields optional) */
export type UpdateSourceParams = Partial<Omit<RFSource, 'id'>>;
```

**Validation Rules**:
- `id`: Must be unique within the application, non-empty string
- `position`: Each coordinate must be finite number, recommended range based on environment size
- `frequency`: Must be in range [1e6, 100e9] Hz (1 MHz to 100 GHz, covers common RF bands)
- `power`: Must be positive; typical range [0.001, 100] watts or [-30, 50] dBm
- `powerUnit`: Either 'watts' or 'dBm'
- `phase`: Must be in range [0, 2π] radians (0-360 degrees)
- `antennaType`: V1 only supports 'omnidirectional'; 'directional' and 'phased_array' reserved for V2
- `orientation`: Required if `antennaType` is 'directional' or 'phased_array' (V2)
- `gain`: Linear gain (≥1.0), defaults to 1.0 for omnidirectional
- `active`: Boolean flag, defaults to true
- `color`: Optional hex string (e.g., "#3b82f6"), defaults to auto-assigned from palette
- `label`: Optional string, max length 50 characters
- `deviceType`: Optional hint for UI display

**Default Values**:
```typescript
export const DEFAULT_RF_SOURCE: Omit<RFSource, 'id'> = {
  position: { x: 0, y: 1.5, z: 0 }, // 1.5m height (typical device height)
  frequency: 2.4e9, // 2.4 GHz (Wi-Fi)
  power: 0.1,       // 100 mW
  powerUnit: 'watts',
  phase: 0,
  antennaType: 'omnidirectional',
  gain: 1.0,
  active: true,
};

export const SOURCE_LIMITS = {
  frequency: { min: 1e6, max: 100e9 }, // 1 MHz to 100 GHz
  power: {
    watts: { min: 0.001, max: 100 },   // 1 mW to 100 W
    dBm: { min: -30, max: 50 },        // -30 dBm to 50 dBm
  },
  phase: { min: 0, max: 2 * Math.PI },
  maxSources: {
    v1: 5,  // CPU-based limit
    v2: 50, // GPU-based limit
  },
} as const;

// Common RF frequencies for quick selection
export const COMMON_FREQUENCIES = {
  'Wi-Fi 2.4 GHz': 2.4e9,
  'Wi-Fi 5 GHz': 5.0e9,
  'Wi-Fi 6E': 6.0e9,
  'Bluetooth': 2.4e9,
  'LTE 700 MHz': 700e6,
  'LTE 1800 MHz': 1800e6,
  '5G 3.5 GHz': 3.5e9,
  '5G mmWave 28 GHz': 28e9,
} as const;
```

**State Transitions**:
- **Created** → `active: true` by default
- **Updated** → Any parameter can change while maintaining `id`
- **Deactivated** → `active: false` (remains in store but excluded from calculations)
- **Removed** → Deleted from store entirely
- **V1 → V2 Migration**: `antennaType` can change from 'omnidirectional' to 'directional' when V2 activated

---

### 2. FieldPoint

**Purpose**: Represents a location in 3D space where field strength is calculated for visualization.

**TypeScript Interface**:
```typescript
// types/field.types.ts

export interface FieldPoint {
  /** 3D position in world space */
  position: Vector3D;
  
  /** Calculated field strength at this point (can be negative) */
  strength: number;
  
  /** Calculated phase at this point (radians) */
  phase: number;
  
  /** Timestamp when this field value was calculated (for animation) */
  timestamp?: number;
}

/** Grid of field points for spatial sampling */
export interface FieldGrid {
  /** Resolution along each axis (e.g., 32 means 32×32×32 = 32,768 points) */
  resolution: number;
  
  /** Bounding box for the grid */
  bounds: BoundingBox;
  
  /** Flattened array of field strength values (length = resolution^3) */
  values: Float32Array;
  
  /** When this grid was last calculated */
  timestamp: number;
}

export interface BoundingBox {
  min: Vector3D;
  max: Vector3D;
  size: number; // Cube side length
}
```

**Calculation**:
Field strength at point `P` is computed via superposition:
```typescript
E(P, t) = Σ_i [ (A_i / r_i) × sin(2πf_i × t - k_i × r_i + φ_i) ]

where:
  A_i = amplitude of source i
  r_i = distance from source i to point P
  f_i = frequency of source i
  k_i = wave number = 2πf_i / c (c = 1 for simplified visualization)
  φ_i = phase of source i
  t = current time
```

**Validation Rules**:
- `strength`: Can be any finite number (negative indicates opposite phase direction)
- `phase`: Wraps to [0, 2π] range
- `timestamp`: Unix timestamp in milliseconds, used for animation synchronization

---

### 3. CameraState

**Purpose**: Tracks the 3D camera's position, orientation, and projection for rendering the scene.

**TypeScript Interface**:
```typescript
// types/camera.types.ts

export interface CameraState {
  /** Camera position in world space */
  position: Vector3D;
  
  /** Point the camera is looking at */
  target: Vector3D;
  
  /** Up vector (usually [0, 1, 0] for Y-up coordinate system) */
  up: Vector3D;
  
  /** Field of view in degrees */
  fov: number;
  
  /** Zoom level (1.0 = default, <1.0 = zoomed out, >1.0 = zoomed in) */
  zoom: number;
  
  /** Near clipping plane distance */
  near: number;
  
  /** Far clipping plane distance */
  far: number;
}

export const DEFAULT_CAMERA: CameraState = {
  position: { x: 5, y: 5, z: 5 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  fov: 75,
  zoom: 1.0,
  near: 0.1,
  far: 1000,
};
```

**Validation Rules**:
- `position`: Must be finite, recommended range [-50, 50] for each axis
- `target`: Must be finite
- `up`: Should be normalized vector (length = 1)
- `fov`: Must be in range [10, 120] degrees
- `zoom`: Must be > 0, recommended range [0.5, 5.0]
- `near`: Must be > 0 and < far
- `far`: Must be > near

**State Transitions**:
- **Orbit**: Rotates `position` around `target`, maintains distance
- **Pan**: Translates both `position` and `target` in tandem
- **Zoom**: Adjusts `zoom` factor or moves `position` closer/farther from `target`
- **Reset**: Returns to `DEFAULT_CAMERA` state

---

### 4. VisualizationSettings

**Purpose**: Global configuration for how fields are rendered and displayed.

**TypeScript Interface**:
```typescript
// types/visualization.types.ts

export interface VisualizationSettings {
  /** Number of field lines to render per source */
  fieldLineDensity: number;
  
  /** Color scheme for field strength mapping */
  colorScheme: ColorScheme;
  
  /** Animation speed multiplier (1.0 = real-time) */
  animationSpeed: number;
  
  /** Whether time-based animation is enabled */
  animateFields: boolean;
  
  /** Whether to show FPS counter */
  showFPS: boolean;
  
  /** Whether to show source labels in 3D view */
  showLabels: boolean;
  
  /** Whether to show coordinate grid/axes */
  showGrid: boolean;
  
  /** Current level of detail (auto-adjusted based on performance) */
  lod: LODLevel;
}

export type ColorScheme = 'thermal' | 'rainbow' | 'monochrome';

export type LODLevel = 'high' | 'medium' | 'low';

export const DEFAULT_VISUALIZATION: VisualizationSettings = {
  fieldLineDensity: 50,
  colorScheme: 'thermal',
  animationSpeed: 1.0,
  animateFields: false, // Static view by default, animation opt-in for V2
  showFPS: false,
  showLabels: true,
  showGrid: true,
  lod: 'high',
};
```

**Validation Rules**:
- `fieldLineDensity`: Must be integer in range [10, 100]
- `colorScheme`: Must be one of the defined ColorScheme values
- `animationSpeed`: Must be > 0, recommended range [0.1, 5.0]
- `animateFields`: Boolean flag
- `showFPS`: Boolean flag
- `showLabels`: Boolean flag
- `showGrid`: Boolean flag
- `lod`: Auto-adjusted by performance monitoring, can be manually overridden

**LOD Configurations**:
```typescript
export const LOD_CONFIGS: Record<LODLevel, LODConfig> = {
  high: {
    fieldLineDensity: 50,
    samplingResolution: 32,
    lineSegments: 50,
  },
  medium: {
    fieldLineDensity: 30,
    samplingResolution: 24,
    lineSegments: 30,
  },
  low: {
    fieldLineDensity: 20,
    samplingResolution: 16,
    lineSegments: 20,
  },
};

interface LODConfig {
  fieldLineDensity: number;
  samplingResolution: number;
  lineSegments: number;
}
```

---

### 5. InterferencePattern

**Purpose**: Represents identified regions of constructive or destructive interference (derived data, not stored).

**TypeScript Interface**:
```typescript
// types/field.types.ts

export interface InterferencePattern {
  /** Type of interference detected */
  type: 'constructive' | 'destructive' | 'mixed';
  
  /** Center point of the interference region */
  center: Vector3D;
  
  /** Approximate radius of the region (meters) */
  radius: number;
  
  /** Peak field strength in this region */
  peakStrength: number;
  
  /** Contributing source IDs */
  sourceIds: string[];
}

/** Detects interference patterns in a field grid */
export interface InterferenceDetector {
  detect: (grid: FieldGrid, sources: EMFSource[]) => InterferencePattern[];
  threshold: number; // Minimum strength difference to classify as pattern
}
```

**Detection Logic** (for future analysis features):
- **Constructive**: Field strength > sum of individual sources × 1.5
- **Destructive**: Field strength < sum of individual sources × 0.3
- **Mixed**: Neither constructive nor destructive, complex interference

---

## State Management Schema

### Zustand Store Structure

```typescript
// hooks/useSourceStore.ts

export interface StoreState {
  // === Source Management ===
  sources: EMFSource[];
  selectedSourceId: string | null;
  
  // === Camera State ===
  camera: CameraState;
  
  // === Visualization Settings ===
  settings: VisualizationSettings;
  
  // === Performance Metrics ===
  performance: {
    currentFPS: number;
    averageFPS: number;
    isLowPerformance: boolean;
  };
  
  // === Actions (State Mutations) ===
  // Source actions
  addSource: (params: CreateSourceParams) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, params: UpdateSourceParams) => void;
  selectSource: (id: string | null) => void;
  toggleSourceActive: (id: string) => void;
  clearAllSources: () => void;
  
  // Camera actions
  updateCamera: (params: Partial<CameraState>) => void;
  resetCamera: () => void;
  orbitCamera: (deltaAzimuth: number, deltaPolar: number) => void;
  panCamera: (deltaX: number, deltaY: number) => void;
  zoomCamera: (deltaZoom: number) => void;
  
  // Settings actions
  updateSettings: (params: Partial<VisualizationSettings>) => void;
  setLOD: (lod: LODLevel) => void;
  
  // Performance actions
  updatePerformance: (fps: number) => void;
  
  // === Selectors (Derived State) ===
  getSourceById: (id: string) => EMFSource | undefined;
  getSelectedSource: () => EMFSource | undefined;
  getActiveSources: () => EMFSource[];
  getSourceCount: () => number;
  shouldReduceQuality: () => boolean; // Based on performance metrics
}
```

### Initial State

```typescript
export const INITIAL_STATE: Pick<StoreState, 'sources' | 'selectedSourceId' | 'camera' | 'settings' | 'performance'> = {
  sources: [
    // Start with one default source for first-time user experience
    {
      id: 'default-source',
      position: { x: 0, y: 0, z: 0 },
      frequency: 1.0,
      amplitude: 1.0,
      phase: 0,
      active: true,
      label: 'Source 1',
    },
  ],
  selectedSourceId: 'default-source',
  camera: DEFAULT_CAMERA,
  settings: DEFAULT_VISUALIZATION,
  performance: {
    currentFPS: 60,
    averageFPS: 60,
    isLowPerformance: false,
  },
};
```

---

## Component Props Interfaces

### Canvas3D

```typescript
// components/Canvas3D/Canvas3D.tsx

export interface Canvas3DProps {
  /** Sources to visualize (from store) */
  sources: EMFSource[];
  
  /** Visualization settings (from store) */
  settings: VisualizationSettings;
  
  /** Camera state (from store) */
  camera: CameraState;
  
  /** Callback when source is clicked in 3D view */
  onSourceClick?: (sourceId: string) => void;
  
  /** Callback when source is dragged to new position */
  onSourceDrag?: (sourceId: string, newPosition: Vector3D) => void;
  
  /** Callback for camera state changes */
  onCameraChange?: (camera: Partial<CameraState>) => void;
  
  /** Callback for FPS updates */
  onFPSUpdate?: (fps: number) => void;
}
```

### ControlPanel

```typescript
// components/ControlPanel/ControlPanel.tsx

export interface ControlPanelProps {
  /** Whether the panel is collapsed */
  collapsed?: boolean;
  
  /** Callback when collapse state changes */
  onToggleCollapse?: (collapsed: boolean) => void;
  
  /** Optional custom styling */
  className?: string;
}
```

### ParameterSliders

```typescript
// components/ControlPanel/ParameterSliders.tsx

export interface ParameterSlidersProps {
  /** The source being edited */
  source: EMFSource | null;
  
  /** Callback when any parameter changes */
  onParameterChange: (sourceId: string, params: UpdateSourceParams) => void;
  
  /** Whether controls are disabled */
  disabled?: boolean;
}
```

### SourceList

```typescript
// components/ControlPanel/SourceList.tsx

export interface SourceListProps {
  /** All available sources */
  sources: EMFSource[];
  
  /** Currently selected source ID */
  selectedId: string | null;
  
  /** Callback when source is selected */
  onSelect: (sourceId: string) => void;
  
  /** Callback when source is removed */
  onRemove: (sourceId: string) => void;
  
  /** Callback when new source is added */
  onAdd: () => void;
  
  /** Maximum number of sources allowed */
  maxSources?: number;
}
```

---

## Hook Interfaces

### useFieldCalculator

```typescript
// hooks/useFieldCalculator.ts

export interface UseFieldCalculatorResult {
  /** Calculate field strength at a single point */
  calculatePoint: (point: Vector3D, time?: number) => number;
  
  /** Generate a spatial grid of field values */
  generateGrid: (resolution: number, bounds: BoundingBox, time?: number) => FieldGrid;
  
  /** Calculate field gradient at a point (for field line generation) */
  calculateGradient: (point: Vector3D, time?: number) => Vector3D;
  
  /** Detect interference patterns in current configuration */
  detectInterference: () => InterferencePattern[];
}

export function useFieldCalculator(sources: EMFSource[]): UseFieldCalculatorResult;
```

### useCameraControls

```typescript
// hooks/useCameraControls.ts

export interface UseCameraControlsResult {
  /** Current camera state */
  camera: CameraState;
  
  /** Update camera programmatically */
  updateCamera: (params: Partial<CameraState>) => void;
  
  /** Reset to default view */
  reset: () => void;
  
  /** Orbit around target */
  orbit: (deltaAzimuth: number, deltaPolar: number) => void;
  
  /** Pan camera */
  pan: (deltaX: number, deltaY: number) => void;
  
  /** Zoom in/out */
  zoom: (delta: number) => void;
  
  /** Whether camera is currently animating */
  isAnimating: boolean;
}

export function useCameraControls(): UseCameraControlsResult;
```

### useFPSMonitor

```typescript
// hooks/useFPSMonitor.ts

export interface UseFPSMonitorResult {
  /** Current frames per second */
  fps: number;
  
  /** Average FPS over last 5 seconds */
  averageFPS: number;
  
  /** Whether performance is below threshold (< 30 FPS) */
  isLowPerformance: boolean;
  
  /** Recommended LOD level based on current performance */
  recommendedLOD: LODLevel;
}

export function useFPSMonitor(): UseFPSMonitorResult;
```

---

## Relationships & Dependencies

```text
┌─────────────────────────────────────────────────────────┐
│                     Application State                   │
│                    (Zustand Store)                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Sources    │  │    Camera    │  │  Settings    │ │
│  │ EMFSource[]  │  │ CameraState  │  │ Visualization│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
           │                   │                   │
           ▼                   ▼                   ▼
┌───────────────────┐  ┌──────────────┐  ┌──────────────────┐
│  FieldCalculator  │  │  Canvas3D    │  │  ControlPanel    │
│  (Derived Data)   │  │  (Renderer)  │  │  (UI Controls)   │
│                   │  │              │  │                  │
│  • calculatePoint │  │ • Sources    │  │ • SourceList     │
│  • generateGrid   │  │ • FieldLines │  │ • Sliders        │
│  • detectPattern  │  │ • Camera     │  │ • Settings       │
└───────────────────┘  └──────────────┘  └──────────────────┘
           │                                        │
           └────────────────┬───────────────────────┘
                           ▼
                  ┌──────────────────┐
                  │  Field Rendering │
                  │  (Three.js/GPU)  │
                  │                  │
                  │  • Field Lines   │
                  │  • Source Markers│
                  │  • Color Mapping │
                  └──────────────────┘
```

**Key Relationships**:
1. **Sources → Field Calculation**: EMFSource array is input to all field calculations
2. **Field Calculation → Rendering**: Calculated FieldGrid drives Three.js geometry generation
3. **UI Controls → Store**: User interactions update Zustand store via actions
4. **Store → Components**: Components subscribe to store slices via selectors
5. **Performance → Settings**: FPS monitor auto-adjusts LOD in visualization settings
6. **Camera → Rendering**: Camera state directly controls Three.js PerspectiveCamera

---

## Validation & Error Handling

### Source Validation

```typescript
// lib/validation.ts

export class SourceValidator {
  static validate(source: Partial<EMFSource>): ValidationResult {
    const errors: string[] = [];
    
    if (source.frequency !== undefined) {
      if (source.frequency < SOURCE_LIMITS.frequency.min || 
          source.frequency > SOURCE_LIMITS.frequency.max) {
        errors.push(`Frequency must be between ${SOURCE_LIMITS.frequency.min} and ${SOURCE_LIMITS.frequency.max} Hz`);
      }
    }
    
    if (source.amplitude !== undefined) {
      if (source.amplitude < SOURCE_LIMITS.amplitude.min || 
          source.amplitude > SOURCE_LIMITS.amplitude.max) {
        errors.push(`Amplitude must be between ${SOURCE_LIMITS.amplitude.min} and ${SOURCE_LIMITS.amplitude.max}`);
      }
    }
    
    if (source.phase !== undefined) {
      if (source.phase < SOURCE_LIMITS.phase.min || 
          source.phase > SOURCE_LIMITS.phase.max) {
        errors.push(`Phase must be between 0 and 2π radians`);
      }
    }
    
    if (source.position !== undefined) {
      if (!isFiniteVector(source.position)) {
        errors.push('Position must have finite coordinates');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isFiniteVector(v: Vector3D): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}
```

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class Canvas3DErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  // Catches WebGL context loss, Three.js errors, calculation errors
  // Displays user-friendly message with recovery options
}
```

---

## Type Exports

All types are exported from a central types module:

```typescript
// types/index.ts

export type {
  EMFSource,
  CreateSourceParams,
  UpdateSourceParams,
  Vector3D,
} from './source.types';

export type {
  FieldPoint,
  FieldGrid,
  BoundingBox,
  InterferencePattern,
  InterferenceDetector,
} from './field.types';

export type {
  CameraState,
} from './camera.types';

export type {
  VisualizationSettings,
  ColorScheme,
  LODLevel,
  LODConfig,
} from './visualization.types';

export {
  DEFAULT_SOURCE,
  SOURCE_LIMITS,
} from './source.types';

export {
  DEFAULT_CAMERA,
} from './camera.types';

export {
  DEFAULT_VISUALIZATION,
  LOD_CONFIGS,
} from './visualization.types';
```

---

## Testing Strategy

### Unit Tests for Data Models

```typescript
// __tests__/types/source-validation.test.ts

describe('SourceValidator', () => {
  it('accepts valid source parameters', () => {
    const result = SourceValidator.validate({
      frequency: 1.0,
      amplitude: 1.0,
      phase: 0,
    });
    expect(result.valid).toBe(true);
  });
  
  it('rejects frequency out of range', () => {
    const result = SourceValidator.validate({ frequency: 20.0 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Frequency must be between 0.1 and 10 Hz');
  });
  
  it('rejects non-finite position', () => {
    const result = SourceValidator.validate({
      position: { x: NaN, y: 0, z: 0 },
    });
    expect(result.valid).toBe(false);
  });
});
```

### State Mutation Tests

```typescript
// __tests__/store/source-actions.test.ts

describe('Source Store Actions', () => {
  it('addSource generates unique ID', () => {
    const store = useSourceStore.getState();
    store.addSource(DEFAULT_SOURCE);
    const newSource = store.sources[store.sources.length - 1];
    expect(newSource.id).toBeDefined();
    expect(newSource.id).not.toBe('');
  });
  
  it('updateSource merges parameters', () => {
    const store = useSourceStore.getState();
    store.addSource({ ...DEFAULT_SOURCE, frequency: 1.0 });
    const sourceId = store.sources[0].id;
    
    store.updateSource(sourceId, { frequency: 2.0 });
    
    const updated = store.getSourceById(sourceId);
    expect(updated?.frequency).toBe(2.0);
    expect(updated?.amplitude).toBe(1.0); // Unchanged
  });
  
  it('removeSource deselects if selected', () => {
    const store = useSourceStore.getState();
    store.addSource(DEFAULT_SOURCE);
    const sourceId = store.sources[0].id;
    store.selectSource(sourceId);
    
    store.removeSource(sourceId);
    
    expect(store.selectedSourceId).toBeNull();
  });
});
```

---

## Migration & Versioning

**Current Version**: v1.0.0

**Future Considerations**:
- **localStorage persistence** (V2): Serialize StoreState to JSON, restore on page load
- **URL state** (V2): Encode source configurations in URL query params for sharing
- **Export/Import** (V2): Save/load configurations as `.emf` JSON files

**Schema Evolution**:
- All interfaces include explicit types (no implicit `any`)
- Optional fields use `?` suffix for backward compatibility
- Add new fields as optional, migrate existing data with defaults
- Use TypeScript discriminated unions for variant types (e.g., future source types: point, dipole, line)

---

## Summary

This data model provides:
- **Type Safety**: Full TypeScript coverage for all entities and store state
- **Validation**: Runtime checks for parameter ranges and constraints
- **Testability**: Clear interfaces enable comprehensive unit and integration tests
- **Extensibility**: Optional fields and discriminated unions support V2 enhancements
- **Performance**: Optimized structures (Float32Array, LOD configs) for real-time rendering
- **Accessibility**: Documented defaults and constraints for developer onboarding

All entities align with Constitution Principle II (SOLID delivery) through narrow interfaces, single responsibilities, and dependency inversion (components depend on abstract StoreState, not Zustand implementation details).

### 3. Environment

**Purpose**: Represents the 3D space containing sources and measurement points, with optional material properties.

**TypeScript Interface**:
```typescript
// types/environment.types.ts

export interface Environment {
  /** Unique identifier */
  id: string;
  
  /** Environment dimensions (meters) */
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  
  /** Material model type (open-air V1, material-aware V2) */
  modelType: 'open_air' | 'material_aware';
  
  /** Walls (V2 only, empty array in V1) */
  walls?: Wall[];
  
  /** Floor material (V2 only) */
  floorMaterial?: string;
  
  /** Human-readable label */
  label?: string;
}

export interface Wall {
  /** Wall identifier */
  id: string;
  
  /** Corner points defining wall geometry */
  geometry: Vector3D[];
  
  /** Material type (V2: concrete, wood, metal; V1: placeholder) */
  material: string;
  
  /** Thickness in meters */
  thickness: number;
}

export const DEFAULT_ENVIRONMENT: Omit<Environment, 'id'> = {
  dimensions: { width: 10, length: 10, height: 3 }, // 10m x 10m x 3m room
  modelType: 'open_air',
  walls: [],
};
```

---

### 4. MeasurementPoint

**Purpose**: User-defined location for precise field strength analysis with accuracy disclaimers.

**TypeScript Interface**:
```typescript
// types/measurement.types.ts

export interface MeasurementPoint {
  /** Unique identifier */
  id: string;
  
  /** 3D position */
  position: Vector3D;
  
  /** Calculated field strength (V/m or W/m²) */
  fieldStrength?: number;
  
  /** Field strength unit */
  unit: 'V/m' | 'W/m²';
  
  /** Whether this point is in near-field region of any source */
  nearField: boolean;
  
  /** ID of dominant (strongest) contributing source */
  dominantSource?: string;
  
  /** Human-readable label */
  label: string;
  
  /** Timestamp when measurement was taken */
  timestamp?: number;
}

export const createMeasurementPoint = (
  position: Vector3D,
  label?: string
): Omit<MeasurementPoint, 'id'> => ({
  position,
  label: label || `Point ${Date.now()}`,
  unit: 'V/m',
  nearField: false,
});
```

---

### 5. AnalysisOverlay

**Purpose**: Visual layer showing field strength distribution, safety thresholds, and accuracy disclaimers.

**TypeScript Interface**:
```typescript
// types/visualization.types.ts

export interface AnalysisOverlay {
  /** Overlay type */
  type: 'field_strength' | 'safety_threshold' | 'near_far_field';
  
  /** Whether overlay is currently visible */
  visible: boolean;
  
  /** Color mapping scheme */
  colorScheme: 'blue_red' | 'grayscale' | 'viridis';
  
  /** Legend showing value-to-color mapping */
  legend: {
    minValue: number;
    maxValue: number;
    unit: string;
    steps: ColorLegendStep[];
  };
  
  /** Accuracy disclaimer text */
  disclaimer: string;
}

export interface ColorLegendStep {
  value: number;
  color: string; // hex color
  label: string;
}

export const DEFAULT_OVERLAYS: AnalysisOverlay[] = [
  {
    type: 'field_strength',
    visible: true,
    colorScheme: 'blue_red',
    legend: {
      minValue: 0,
      maxValue: 10,
      unit: 'V/m',
      steps: [
        { value: 0, color: '#0000ff', label: 'Weak' },
        { value: 5, color: '#ffff00', label: 'Moderate' },
        { value: 10, color: '#ff0000', label: 'Strong' },
      ],
    },
    disclaimer: 'Estimated field strength (simplified model). Not for compliance use.',
  },
];
```
