# Data Model: EMF Disturbance and Interference Lab

**Phase**: 1 - Design & Contracts  
**Date**: 2025-06-09  
**Status**: Complete

## Overview

This document defines all typed entities, their relationships, validation rules, and state transitions for the EMF visualization lab. The data model supports the V1 MVP (CPU-based, 3-5 sources) and provides extension points for V2 enhancements (GPU compute, advanced physics, EN 62232 reporting).

---

## 1. Core Entities

### 1.1 EMFSource

Represents a radio frequency / electromagnetic field emitter (antenna, device).

```typescript
interface EMFSource {
  // Identity
  id: string;                    // UUID or incremental ID
  label: string;                 // User-facing name, e.g., "Wi-Fi Router", "Cell Tower"
  
  // Physical Parameters
  position: Vector3;             // (x, y, z) in meters, relative to environment origin
  frequency: number;             // Hz (V1: 0.1-10 visual scale; V2: real RF GHz range)
  amplitude: number;             // Arbitrary units (V1); dBm or watts (V2)
  phase: number;                 // Radians (0 to 2π)
  
  // Antenna Properties
  antennaType: AntennaType;      // V1: 'omnidirectional' only; V2: 'directional', 'phased-array'
  
  // State
  active: boolean;               // Whether source contributes to field calculation
  color: string;                 // Hex color for particle cloud (source ownership)
  
  // V2 Extensions (optional in V1)
  powerDbm?: number;             // Real-world power level
  beamSteering?: {               // For directional antennas (V2)
    azimuth: number;             // degrees
    elevation: number;           // degrees
    beamWidth: number;           // degrees
  };
}

type AntennaType = 'omnidirectional'; // V1 only; V2 adds 'directional' | 'phased-array'
type Vector3 = { x: number; y: number; z: number };
```

**Validation Rules**:
- `position`: Must be within environment bounds
- `frequency`: Must be > 0 and <= 10 Hz (V1 visual scale)
- `amplitude`: Must be >= 0 and <= 100 (arbitrary units)
- `phase`: Must be in range [0, 2π]
- `color`: Must be valid hex color

**Relationships**:
- **1:N** → ParticleCloud (one source emits one particle cloud)
- **N:1** → Environment (many sources exist in one environment)

---

### 1.2 Environment

Represents the 3D space containing sources and measurement points.

```typescript
interface Environment {
  // Dimensions
  dimensions: {
    width: number;               // meters (X-axis)
    length: number;              // meters (Y-axis)
    height: number;              // meters (Z-axis)
  };
  
  // Origin (center of environment)
  origin: Vector3;               // Default: (0, 0, 0)
  
  // Boundaries (for visualization)
  showBounds: boolean;           // Render room/space boundaries
  
  // V1: Materials are placeholder; V2: detailed properties
  materials?: EnvironmentMaterial[];  // V2 feature
}

interface EnvironmentMaterial {
  name: string;                  // e.g., "Concrete Wall", "Glass Window"
  geometry: BoundingBox[];       // Regions affected by this material
  attenuation: number;           // dB/meter (V2 feature)
  reflectivity: number;          // 0-1 (V2 feature)
}

interface BoundingBox {
  min: Vector3;
  max: Vector3;
}
```

**Validation Rules**:
- `dimensions`: Each axis must be in range [5m, 100m] (per spec FR-018)
- Default: 20m × 20m × 8m

**Relationships**:
- **1:N** → EMFSource (one environment contains many sources)
- **1:N** → MeasurementPoint (one environment contains many measurement points)

---

### 1.3 FieldPoint

A location in 3D space where field strength is calculated for visualization or measurement.

```typescript
interface FieldPoint {
  // Position
  position: Vector3;             // (x, y, z) in meters
  
  // Calculated Values (from simulation engine)
  fieldMagnitude: number;        // |E_total| in V/m
  fieldPhase: number;            // radians (phase of total field)
  
  // Classification
  isNearField: boolean;          // distance < λ/2π from nearest source
  
  // Source Contributions (for debugging/analysis)
  contributions?: SourceContribution[];
}

interface SourceContribution {
  sourceId: string;
  magnitude: number;             // |E_i| from this source
  phase: number;                 // φ_i at this point
}
```

**Validation Rules**:
- `position`: Must be within environment bounds
- `fieldMagnitude`: >= 0
- `fieldPhase`: in range [0, 2π]

**Relationships**:
- **N:N** → EMFSource (field point receives contributions from all active sources)

---

### 1.4 MeasurementPoint

User-defined location for precise field strength analysis (inherits from FieldPoint).

```typescript
interface MeasurementPoint extends FieldPoint {
  // Identity
  id: string;                    // UUID
  label: string;                 // User-defined label, e.g., "Desk Corner"
  
  // Display
  visible: boolean;              // Show in 3D view
  showReadout: boolean;          // Show numerical readout overlay
  
  // Safety Analysis (V1 informational, V2 compliance)
  safetyThreshold?: {
    value: number;               // V/m or W/m²
    standard: string;            // e.g., "ICNIRP 2020", "FCC"
    exceedsThreshold: boolean;   // Calculated from fieldMagnitude
  };
}
```

**Validation Rules**:
- Maximum 5 active measurement points (per spec FR-032)
- `label`: Max 50 characters
- `safetyThreshold.value`: Must be > 0

**Relationships**:
- **N:1** → Environment (many measurement points in one environment)

---

### 1.5 Particle

Individual particle in the visual particle-cloud system.

```typescript
interface Particle {
  // Identity
  id: string;                    // Particle ID (for tracking)
  sourceId: string;              // Which source emitted this particle
  
  // Kinematics
  position: Vector3;             // Current position (meters)
  velocity: Vector3;             // Current velocity (m/s, visual not literal)
  
  // Lifecycle
  lifetime: number;              // Remaining lifetime (seconds)
  maxLifetime: number;           // Initial lifetime (for fade calculations)
  
  // Visual Properties
  brightness: number;            // 0-1 (modulated by field strength)
  color: string;                 // Hex color (inherited from source)
  radius: number;                // Core particle radius (scene units)
  haloRadius: number;            // Glow halo radius (scene units)
}
```

**Validation Rules**:
- `lifetime`: >= 0
- `brightness`: in range [0, 1]
- `radius`: in range [0.05, 0.08] (per research.md)
- `haloRadius`: in range [2*radius, 3*radius]

**Relationships**:
- **N:1** → EMFSource (many particles emitted by one source)

---

### 1.6 ParticleCloud

Collection of particles emitted by a single source.

```typescript
interface ParticleCloud {
  // Identity
  sourceId: string;              // Owning source
  
  // Particles
  particles: Particle[];         // Active particles in this cloud
  
  // Emission State
  emissionRate: number;          // Particles/second (derived from frequency)
  timeSinceLastEmission: number; // Seconds (used to schedule next particle)
  
  // Visual Config
  maxParticles: number;          // Cap on active particles (performance)
  particleLifetime: number;      // Default lifetime for new particles (seconds)
}
```

**Validation Rules**:
- `emissionRate`: > 0
- `maxParticles`: <= 2000 (per source, per research.md performance target)
- `particles.length`: <= maxParticles

**Relationships**:
- **1:1** → EMFSource (one cloud per source)

---

## 2. State Management Entities

### 2.1 LabState

Global application state (Zustand store).

```typescript
interface LabState {
  // Sources
  sources: EMFSource[];
  selectedSourceId: string | null;
  
  // Environment
  environment: Environment;
  
  // Measurement
  measurementPoints: MeasurementPoint[];
  
  // Camera
  camera: CameraState;
  
  // Visualization Settings
  visualization: VisualizationSettings;
  
  // Analysis Overlays
  analysis: AnalysisSettings;
  
  // Performance
  performance: PerformanceMetrics;
  
  // Actions (Zustand actions)
  addSource: (source: Partial<EMFSource>) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<EMFSource>) => void;
  selectSource: (id: string | null) => void;
  
  addMeasurementPoint: (point: Partial<MeasurementPoint>) => void;
  removeMeasurementPoint: (id: string) => void;
  
  updateVisualization: (updates: Partial<VisualizationSettings>) => void;
  updateEnvironment: (updates: Partial<Environment>) => void;
}
```

---

### 2.2 CameraState

User's viewpoint in 3D space.

```typescript
interface CameraState {
  position: Vector3;             // Camera position
  target: Vector3;               // Look-at point
  fov: number;                   // Field of view (degrees)
  zoom: number;                  // Zoom level (1.0 = default)
}
```

**Validation Rules**:
- `fov`: in range [30, 90] degrees
- `zoom`: in range [0.5, 3.0]

---

### 2.3 VisualizationSettings

Global parameters controlling rendering and analysis display.

```typescript
interface VisualizationSettings {
  // Animation
  animationMode: 'animated' | 'static';  // Toggle per spec FR-042
  animationSpeed: number;                // 0.5x to 2.0x (spec default: 1.0)
  
  // Particle System
  particleDensity: 'low' | 'medium' | 'high';  // Quality preset
  particleRadius: number;                      // Core radius (0.05-0.08)
  haloIntensity: number;                       // Glow intensity (0.6-1.5)
  
  // Color Mapping
  colorScheme: ColorScheme;
  showFieldStrengthOverlay: boolean;
  
  // Flow/Curl Cues
  showFlowCues: boolean;                 // Poynting vector arrows
  showCurlCues: boolean;                 // ∇×E indicators
  
  // Environment
  showEnvironmentBounds: boolean;
}

type ColorScheme = 'viridis' | 'turbo' | 'custom';
```

**Validation Rules**:
- `animationSpeed`: in range [0.5, 2.0] (per spec)
- `particleRadius`: in range [0.05, 0.08]
- `haloIntensity`: in range [0.6, 1.5]

---

### 2.4 AnalysisSettings

Analysis overlay configuration.

```typescript
interface AnalysisSettings {
  // Measurement Points
  showMeasurementPoints: boolean;
  maxMeasurementPoints: number;          // Max 5 (per spec)
  
  // Field Strength Display
  showFieldStrengthOverlay: boolean;
  fieldStrengthUnit: 'V/m' | 'W/m²' | 'dBm';
  
  // Near/Far Field Labels
  showNearFarLabels: boolean;
  
  // Safety Thresholds (V1 informational)
  showSafetyThresholds: boolean;
  safetyStandard: 'ICNIRP 2020' | 'FCC' | 'custom';
  customThreshold?: number;
  
  // Disclaimers
  showAccuracyDisclaimers: boolean;      // Always true for V1
}
```

**Validation Rules**:
- `maxMeasurementPoints`: <= 5
- `customThreshold`: if set, must be > 0

---

### 2.5 PerformanceMetrics

Real-time performance monitoring.

```typescript
interface PerformanceMetrics {
  // FPS
  currentFPS: number;                    // Frames per second
  targetFPS: number;                     // 60 (V1 target)
  minAcceptableFPS: number;              // 30 (V1 floor)
  
  // Particle Counts
  totalParticles: number;                // Sum across all sources
  particlesPerSource: Record<string, number>;
  
  // Calculation Time
  lastCalcDurationMs: number;            // Time to compute field for one frame
  
  // Quality State
  qualityLevel: 'high' | 'medium' | 'low';  // Auto-adjusted if FPS drops
  performanceWarning: string | null;        // e.g., "Too many sources, reduce for 60 FPS"
}
```

---

## 3. Validation Rules Summary

### Source Validation

```typescript
function validateSource(source: Partial<EMFSource>, environment: Environment): ValidationResult {
  const errors: string[] = [];
  
  // Position bounds check
  if (source.position) {
    const { x, y, z } = source.position;
    const { width, length, height } = environment.dimensions;
    if (Math.abs(x) > width / 2 || Math.abs(y) > length / 2 || Math.abs(z) > height / 2) {
      errors.push('Source position exceeds environment bounds');
    }
  }
  
  // Frequency range
  if (source.frequency !== undefined && (source.frequency <= 0 || source.frequency > 10)) {
    errors.push('Frequency must be in range (0, 10] Hz');
  }
  
  // Amplitude range
  if (source.amplitude !== undefined && (source.amplitude < 0 || source.amplitude > 100)) {
    errors.push('Amplitude must be in range [0, 100]');
  }
  
  // Phase range
  if (source.phase !== undefined && (source.phase < 0 || source.phase > 2 * Math.PI)) {
    errors.push('Phase must be in range [0, 2π]');
  }
  
  return { isValid: errors.length === 0, errors };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

### Environment Validation

```typescript
function validateEnvironment(env: Partial<Environment>): ValidationResult {
  const errors: string[] = [];
  
  if (env.dimensions) {
    const { width, length, height } = env.dimensions;
    if (width < 5 || width > 100) errors.push('Width must be in range [5, 100] meters');
    if (length < 5 || length > 100) errors.push('Length must be in range [5, 100] meters');
    if (height < 5 || height > 100) errors.push('Height must be in range [5, 100] meters');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 4. State Transitions

### 4.1 Source Lifecycle

```
[None] --addSource--> [Active]
[Active] --updateSource--> [Active] (modified)
[Active] --source.active = false--> [Inactive] (still in list, not calculated)
[Active|Inactive] --removeSource--> [Deleted]
```

**State Change Triggers**:
- `addSource`: User clicks "Add Source" → new source created with defaults
- `updateSource`: User adjusts slider → source parameters updated
- `removeSource`: User clicks "Remove Source" → source and its particle cloud deleted

### 4.2 Measurement Point Lifecycle

```
[None] --addMeasurementPoint--> [Active]
[Active] --updatePosition--> [Active] (moved)
[Active] --removeMeasurementPoint--> [Deleted]
```

**Constraint**: Maximum 5 active measurement points (spec FR-032)

### 4.3 Particle Lifecycle

```
[None] --emit--> [Active]
[Active] --updateFrame--> [Active] (moved, aged)
[Active] --lifetime <= 0--> [Deleted]
```

**Emission Rate**: Derived from source frequency (higher frequency → faster emission)

### 4.4 Performance State Transitions

```
[High Quality] --FPS < 45--> [Medium Quality]
[Medium Quality] --FPS < 30--> [Low Quality]
[Low Quality] --FPS >= 35--> [Medium Quality]
[Medium Quality] --FPS >= 55--> [High Quality]
```

**Quality Adjustments**:
- **High**: Full particle count, detailed halos
- **Medium**: Reduce particle count by 30%, simpler halos
- **Low**: Reduce particle count by 60%, minimal halos, warn user

---

## 5. Relationships Diagram

```
Environment (1)
  ├── contains (N) EMFSource
  │     └── emits (1) ParticleCloud
  │           └── contains (N) Particle
  └── contains (N) MeasurementPoint (extends FieldPoint)

LabState (global)
  ├── manages (N) EMFSource
  ├── manages (1) Environment
  ├── manages (N) MeasurementPoint
  ├── manages (1) CameraState
  ├── manages (1) VisualizationSettings
  ├── manages (1) AnalysisSettings
  └── tracks (1) PerformanceMetrics

FieldPoint (calculation unit)
  └── receives contributions from (N) EMFSource
```

---

## 6. Extension Points for V2

### 6.1 GPU Compute Backend

V2 will add GPU-accelerated field calculation. Data model extensions:

```typescript
interface GPUFieldGrid {
  resolution: { x: number; y: number; z: number };  // Grid resolution (e.g., 128³)
  fieldTexture: WebGPUTexture;                      // 3D texture storing field values
  updateFrequency: number;                          // Hz (how often to recompute)
}
```

### 6.2 Advanced Antenna Patterns

V2 adds directional antennas and beam steering:

```typescript
type AntennaType = 'omnidirectional' | 'directional' | 'phased-array';

interface DirectionalAntenna extends AntennaProperties {
  gainPattern: (azimuth: number, elevation: number) => number;  // dB
  beamWidth: number;                                            // degrees
}
```

### 6.3 EN 62232 Compliance

V2 adds professional reporting:

```typescript
interface ComplianceReport {
  id: string;
  timestamp: Date;
  environment: Environment;
  sources: EMFSource[];
  assessmentPoints: MeasurementPoint[];
  complianceStandard: 'EN 62232' | 'ICNIRP 2020' | 'FCC';
  results: ComplianceResult[];
}

interface ComplianceResult {
  pointId: string;
  fieldStrength: number;
  limit: number;
  exceedsLimit: boolean;
  margin: number;  // dB
}
```

---

## 7. Summary

All entities support V1 MVP requirements (FR-001 through FR-071) while providing clear extension points for V2 GPU compute, advanced physics, and EN 62232 compliance. Validation rules enforce constitutional gate requirements (Principle III, V) and maintain graphical integrity (Principle VI).

**Data Model Complete** ✅
