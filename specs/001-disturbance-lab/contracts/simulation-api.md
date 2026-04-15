# Simulation API Contract

**Module**: `app/lab/modules/simulation/`  
**Purpose**: Core field calculation engine with superposition and phase-aware interference  
**Version**: 1.0 (V1 CPU-based; V2 GPU-ready)

---

## Interface Definition

### SimulationEngine

Primary interface for EMF field calculations.

```typescript
interface SimulationEngine {
  /**
   * Calculate total field magnitude and phase at a single point
   * @param point - 3D position to calculate field
   * @param sources - Array of active EMF sources
   * @param time - Current animation time (seconds)
   * @returns Field point with calculated magnitude and phase
   */
  calculateFieldAtPoint(
    point: Vector3,
    sources: EMFSource[],
    time: number
  ): FieldPoint;
  
  /**
   * Calculate field contributions from each source at a point
   * @param point - 3D position
   * @param sources - Array of active EMF sources
   * @param time - Current animation time (seconds)
   * @returns Array of source contributions (for debugging/analysis)
   */
  calculateContributions(
    point: Vector3,
    sources: EMFSource[],
    time: number
  ): SourceContribution[];
  
  /**
   * Batch calculate field at multiple points (optimized)
   * @param points - Array of 3D positions
   * @param sources - Array of active EMF sources
   * @param time - Current animation time (seconds)
   * @returns Array of field points
   */
  calculateFieldBatch(
    points: Vector3[],
    sources: EMFSource[],
    time: number
  ): FieldPoint[];
  
  /**
   * Determine if a point is in near-field region for any source
   * @param point - 3D position
   * @param sources - Array of EMF sources
   * @returns true if distance < λ/2π from any source
   */
  isNearField(point: Vector3, sources: EMFSource[]): boolean;
}
```

---

## Physics Equations (V1 Implementation)

### Single Source Field Contribution

For a point source at position **r₀** with frequency *f*, amplitude *A*, phase *φ*:

```typescript
function calculateSourceField(
  observationPoint: Vector3,
  source: EMFSource,
  time: number
): { magnitude: number; phase: number } {
  const distance = distanceBetween(observationPoint, source.position);
  const k = (2 * Math.PI * source.frequency) / SPEED_OF_LIGHT;  // wave number
  
  // Field magnitude (1/r falloff)
  const magnitude = source.amplitude / distance;
  
  // Phase at observation point
  const phase = 2 * Math.PI * source.frequency * time - k * distance + source.phase;
  
  return { magnitude, phase };
}
```

### Superposition for Multiple Sources

Total field at observation point:

```typescript
function calculateTotalField(
  observationPoint: Vector3,
  sources: EMFSource[],
  time: number
): FieldPoint {
  let totalReal = 0;
  let totalImag = 0;
  const contributions: SourceContribution[] = [];
  
  for (const source of sources) {
    if (!source.active) continue;
    
    const { magnitude, phase } = calculateSourceField(observationPoint, source, time);
    
    // Complex phasor addition for superposition
    totalReal += magnitude * Math.cos(phase);
    totalImag += magnitude * Math.sin(phase);
    
    contributions.push({
      sourceId: source.id,
      magnitude,
      phase,
    });
  }
  
  // Total field magnitude and phase
  const fieldMagnitude = Math.sqrt(totalReal ** 2 + totalImag ** 2);
  const fieldPhase = Math.atan2(totalImag, totalReal);
  
  return {
    position: observationPoint,
    fieldMagnitude,
    fieldPhase,
    isNearField: isNearField(observationPoint, sources),
    contributions,
  };
}
```

### Near-Field Classification

```typescript
function isNearField(point: Vector3, sources: EMFSource[]): boolean {
  for (const source of sources) {
    const distance = distanceBetween(point, source.position);
    const wavelength = SPEED_OF_LIGHT / source.frequency;
    const nearFieldBoundary = wavelength / (2 * Math.PI);
    
    if (distance < nearFieldBoundary) {
      return true;  // At least one source creates near-field
    }
  }
  return false;
}
```

---

## Constants

```typescript
const SPEED_OF_LIGHT = 3e8;  // m/s (used for wavelength calculation)

// V1 visual scale constants (frequency scaled for visualization, not real RF)
const FREQUENCY_MIN = 0.1;   // Hz
const FREQUENCY_MAX = 10.0;  // Hz
```

---

## Usage Examples

### Example 1: Calculate Field at Single Measurement Point

```typescript
import { SimulationEngine } from '@/app/lab/modules/simulation';
import { useLabStore } from '@/app/lab/hooks/useLabStore';

const engine = new SimulationEngine();
const { sources, measurementPoints, visualization } = useLabStore();

// Calculate field at first measurement point
const point = measurementPoints[0].position;
const time = Date.now() / 1000 * visualization.animationSpeed;

const fieldResult = engine.calculateFieldAtPoint(point, sources, time);

console.log(`Field magnitude: ${fieldResult.fieldMagnitude.toFixed(2)} V/m`);
console.log(`Phase: ${(fieldResult.fieldPhase * 180 / Math.PI).toFixed(1)}°`);
console.log(`Near-field: ${fieldResult.isNearField}`);
```

### Example 2: Batch Calculation for Particle Cloud

```typescript
// Calculate field strength at all particle positions
const particlePositions = particles.map(p => p.position);
const fieldPoints = engine.calculateFieldBatch(particlePositions, sources, time);

// Update particle brightness based on field strength
particles.forEach((particle, i) => {
  const normalizedStrength = fieldPoints[i].fieldMagnitude / maxExpectedField;
  particle.brightness = Math.min(1.0, normalizedStrength);
});
```

---

## Performance Considerations

### V1 (CPU-Based)

- **Single-threaded JavaScript**: All calculations run on main thread
- **Optimization**: Batch calculations reuse source contribution loops
- **Throttling**: Limit spatial sampling rate (don't calculate for every particle, every frame)
- **Target**: < 16ms per frame for 1000 field points (60 FPS goal)

### V2 Extension Points (GPU)

```typescript
interface SimulationEngine {
  // V2 addition: GPU-accelerated field grid calculation
  calculateFieldGrid?(
    resolution: { x: number; y: number; z: number },
    sources: EMFSource[],
    time: number
  ): GPUFieldGrid;
}
```

---

## Testing Requirements

### Unit Tests

1. **Superposition correctness**: Two identical in-phase sources → 2x amplitude at midpoint
2. **Destructive interference**: Two identical out-of-phase sources → ~0 amplitude at midpoint
3. **Phase propagation**: Phase changes linearly with distance
4. **1/r falloff**: Field magnitude decreases as 1/r in far-field
5. **Near-field classification**: Correctly identifies λ/2π boundary

### Integration Tests

1. **Multi-source calculation**: 5 sources with different parameters produce stable field
2. **Batch performance**: 1000 points calculated in < 20ms (60 FPS budget)

---

## Dependencies

- `@/app/lab/types/source.types`: EMFSource interface
- `@/app/lab/types/field.types`: FieldPoint, SourceContribution interfaces
- `@/app/lab/types/common.types`: Vector3 type
- `@/app/lab/lib/field-math`: Helper functions (distance, vector ops)

---

## Versioning

**V1**: CPU-based superposition with 1/r falloff (current)  
**V2**: GPU-accelerated with full near-field reactive/radiating split (future)

**Contract Stability**: This interface must remain stable for V1→V2 migration. GPU backend will implement the same interface with `calculateFieldGrid` extension.

---

**Simulation API Contract Complete** ✅
