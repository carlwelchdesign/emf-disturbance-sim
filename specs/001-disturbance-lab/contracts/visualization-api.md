# Visualization API Contract

**Module**: `app/lab/modules/visualization/` and `app/lab/components/Canvas3D/`  
**Purpose**: Three.js / React Three Fiber rendering interface for EMF particle-cloud visualization  
**Version**: 1.0 (Tufte-style low-clutter particle rendering)

---

## Interface Definition

### ParticleCloudRenderer

Manages particle system rendering for a single EMF source.

```typescript
interface ParticleCloudRenderer {
  /**
   * Source ID this renderer visualizes
   */
  readonly sourceId: string;
  
  /**
   * Update particle positions, lifetimes, and visual properties
   * @param deltaTime - Time since last frame (seconds)
   * @param fieldStrength - Function to get field magnitude at position
   * @param visualSettings - Current visualization settings
   */
  update(
    deltaTime: number,
    fieldStrength: (position: Vector3) => number,
    visualSettings: VisualizationSettings
  ): void;
  
  /**
   * Emit new particles from source
   * @param source - EMF source configuration
   * @param deltaTime - Time since last frame
   */
  emitParticles(source: EMFSource, deltaTime: number): void;
  
  /**
   * Get Three.js mesh for rendering
   */
  getMesh(): THREE.InstancedMesh;
  
  /**
   * Clean up GPU resources
   */
  dispose(): void;
}
```

---

## React Three Fiber Component Contracts

### ParticleCloud Component

Declarative R3F component for particle system.

```typescript
interface ParticleCloudProps {
  source: EMFSource;                    // Source to visualize
  fieldStrength: (pos: Vector3) => number;  // Field calculation function
  visualSettings: VisualizationSettings;    // Rendering config
  maxParticles?: number;                    // Default: 2000
}

/**
 * Renders a particle cloud for a single EMF source
 * Uses InstancedMesh for efficient rendering
 */
export function ParticleCloud({
  source,
  fieldStrength,
  visualSettings,
  maxParticles = 2000,
}: ParticleCloudProps): JSX.Element;
```

**Implementation Pattern**:
```typescript
function ParticleCloud({ source, fieldStrength, visualSettings, maxParticles }: ParticleCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useParticleSystem(source, maxParticles);
  
  // Update particles every frame
  useFrame((state, deltaTime) => {
    if (!meshRef.current) return;
    
    particles.update(deltaTime, fieldStrength, visualSettings);
    particles.updateMesh(meshRef.current);
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[visualSettings.particleRadius, 8, 8]} />
      <meshBasicMaterial
        color={source.color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
```

---

### EMFSource Component

3D representation of source emitter.

```typescript
interface EMFSourceProps {
  source: EMFSource;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Renders the source emitter as a 3D object
 * Visual feedback for selection state
 */
export function EMFSource({ source, isSelected, onSelect }: EMFSourceProps): JSX.Element;
```

**Visual Requirements** (per spec and Tufte principles):
- Small sphere or icon at source position
- Color matches particle cloud
- No decorative effects (simple emissive material)
- Selection highlight: thin outline or brightness increase
- Labeled with source name on hover

---

### EnvironmentBounds Component

Render room/space boundaries for spatial context.

```typescript
interface EnvironmentBoundsProps {
  environment: Environment;
  visible: boolean;
}

/**
 * Renders environment boundaries (walls, floor, ceiling)
 * Minimal visual: thin lines, no fill (Tufte style)
 */
export function EnvironmentBounds({ environment, visible }: EnvironmentBoundsProps): JSX.Element;
```

**Visual Requirements**:
- **Line-based** (not filled faces): Minimizes non-data ink
- **Grid reference** (optional): Subtle grid on floor for scale
- **Color**: Low-contrast gray (#333 on dark bg, #ddd on light bg)
- **No shadows or reflections**: Pure geometric reference

---

### MeasurementPoint Component

3D marker for user-placed measurement points.

```typescript
interface MeasurementPointProps {
  point: MeasurementPoint;
  onMove?: (newPosition: Vector3) => void;
  onRemove?: () => void;
}

/**
 * Renders a measurement point with optional readout
 * Draggable if onMove provided
 */
export function MeasurementPoint({ point, onMove, onRemove }: MeasurementPointProps): JSX.Element;
```

**Visual Requirements**:
- **Marker**: Small sphere or pin icon (distinct from sources)
- **Label**: Floating text showing field strength + units
- **Near/far indicator**: Color or icon change if in near-field
- **Minimal**: No decorative elements, only data-encoding visuals

---

## Particle System Logic

### Particle Update Loop (Frame-by-Frame)

**Pseudocode for `ParticleCloud.update()`**:

```
function updateParticles(deltaTime, fieldStrength, visualSettings):
  1. Update emission timer:
     emissionTimer += deltaTime
     emissionInterval = 1.0 / source.frequency  // Higher freq → faster emission
  
  2. Emit new particles if timer exceeded:
     while emissionTimer >= emissionInterval:
       if particles.length < maxParticles:
         particles.push(createParticle(source.position, source.color))
       emissionTimer -= emissionInterval
  
  3. Update existing particles:
     for each particle in particles:
       a. Update position:
          particle.position += particle.velocity * deltaTime
       
       b. Age particle:
          particle.lifetime -= deltaTime
          if particle.lifetime <= 0:
            mark for removal
       
       c. Calculate field strength at particle position:
          fieldMag = fieldStrength(particle.position)
       
       d. Update brightness based on field:
          particle.brightness = normalize(fieldMag, 0, maxExpectedField)
       
       e. Fade out near end of life (visual smoothness):
          lifeFraction = particle.lifetime / particle.maxLifetime
          particle.brightness *= lifeFraction
  
  4. Remove dead particles:
     particles = particles.filter(p => p.lifetime > 0)
  
  5. Update InstancedMesh:
     for each particle at index i:
       mesh.setMatrixAt(i, particle.transformMatrix)
       mesh.setColorAt(i, particle.colorWithBrightness)
     mesh.instanceMatrix.needsUpdate = true
     mesh.instanceColor.needsUpdate = true
```

### Particle Emission Rate

**Cadence Mapping** (per research.md):
- `emissionRate = baseRate * source.frequency`
- `baseRate = 10` particles/second (tunable constant)
- Example: 1 Hz source → 10 particles/sec; 5 Hz source → 50 particles/sec

### Particle Velocity

**Radial Outward Motion** (simplified Poynting vector):
```typescript
function calculateParticleVelocity(source: EMFSource, position: Vector3): Vector3 {
  const direction = normalize(position.subtract(source.position));
  const speed = VISUAL_WAVE_SPEED; // Constant (not literal c), tuned for visibility
  return direction.multiplyScalar(speed);
}

const VISUAL_WAVE_SPEED = 2.0;  // scene units per second (tunable)
```

---

## Color Mapping for Field Strength

### Perceptually Uniform Color Scales

**Viridis** (default):
```typescript
function viridisColor(t: number): string {
  // t in [0, 1]
  // Returns hex color from Viridis scale
  // Implementation: Use chroma.js or custom LUT
  return chroma.scale('viridis')(t).hex();
}
```

**Turbo** (alternative):
```typescript
function turboColor(t: number): string {
  // Google Turbo color scale (perceptually uniform)
  return chroma.scale(['#30123b', '#7a0403', '#f9cb35', '#e3f9a1'])(t).hex();
}
```

**Custom (source-colored)** (for multi-source ownership):
- Use source.color directly for particles
- Modulate brightness by field strength
- No color scale, only intensity modulation

---

## Flow/Curl Cue Rendering (V1 Conceptual)

### Poynting Vector Arrows

```typescript
interface FlowCueProps {
  sources: EMFSource[];
  samplingDensity: number;  // Arrows per cubic meter
}

/**
 * Renders directional arrows showing energy flow (Poynting vector)
 * Optional toggle via visualSettings.showFlowCues
 */
export function FlowCues({ sources, samplingDensity }: FlowCueProps): JSX.Element;
```

**Visual Design**:
- **Arrow placement**: Uniform grid sampling (not every frame, static)
- **Arrow direction**: Radially outward from nearest source
- **Arrow length**: Proportional to field magnitude at that point
- **Arrow color**: Low-saturation white/blue (distinct from particles)
- **Minimal**: Thin lines, no 3D arrow heads (just line segments)

### Curl Indicators (∇ × E)

```typescript
interface CurlCueProps {
  sources: EMFSource[];
  showLabels: boolean;
}

/**
 * Renders conceptual curl indicators (educational overlay)
 * V1: Simplified right-hand-rule visualization
 */
export function CurlCues({ sources, showLabels }: CurlCueProps): JSX.Element;
```

**Visual Design**:
- **Indicator**: Small rotating arrows near each source
- **Rotation direction**: Right-hand rule (E → B direction)
- **Label**: "∇ × E (conceptual)" with disclaimer
- **Toggle**: `visualSettings.showCurlCues` (off by default)

---

## Performance Optimization

### Instanced Rendering

**Why InstancedMesh**:
- Single draw call for all particles of one source (huge GPU savings)
- Supports per-instance position, scale, color
- Target: 2000 particles per source = 10,000 total (5 sources) in 1 frame

### LOD (Level of Detail)

**Quality Presets**:
```typescript
const QUALITY_PRESETS = {
  low: {
    maxParticlesPerSource: 800,
    particleRadius: 0.06,
    haloIntensity: 0.6,
    geometrySegments: 6,  // Fewer sphere segments
  },
  medium: {
    maxParticlesPerSource: 1400,
    particleRadius: 0.065,
    haloIntensity: 1.0,
    geometrySegments: 8,
  },
  high: {
    maxParticlesPerSource: 2000,
    particleRadius: 0.07,
    haloIntensity: 1.3,
    geometrySegments: 8,
  },
};
```

**Auto-Adjustment**:
```typescript
function adjustQualityForFPS(currentFPS: number, visualSettings: VisualizationSettings) {
  if (currentFPS < 30 && visualSettings.particleDensity !== 'low') {
    return 'low';
  } else if (currentFPS >= 55 && visualSettings.particleDensity === 'low') {
    return 'medium';
  } else if (currentFPS >= 60 && visualSettings.particleDensity === 'medium') {
    return 'high';
  }
  return visualSettings.particleDensity;
}
```

---

## Camera Controls

### OrbitControls Configuration

```typescript
import { OrbitControls } from '@react-three/drei';

function Scene() {
  return (
    <Canvas>
      <OrbitControls
        enableDamping={false}        // Immediate response (per spec FR-047)
        minDistance={5}               // Prevent clipping into sources
        maxDistance={50}              // Keep environment in view
        minPolarAngle={Math.PI / 6}   // Prevent camera below floor
        maxPolarAngle={Math.PI / 2}   // Prevent camera upside-down
      />
      {/* Scene content */}
    </Canvas>
  );
}
```

---

## Testing Requirements

### Visual Regression Tests

1. **Particle cloud appearance**: Snapshot test with 1 source, default settings
2. **Multi-source interference**: Snapshot with 2 sources, constructive interference
3. **Environment bounds**: Boundary lines render correctly
4. **Measurement points**: Marker and label positioning

### Performance Tests

1. **FPS with 5 sources**: Maintain >= 30 FPS with 2000 particles per source
2. **InstancedMesh updates**: < 5ms per frame for 10,000 particles
3. **Memory stability**: No leaks after 100 add/remove source cycles

---

## Dependencies

- `react-three-fiber`: ^8.14.0
- `@react-three/drei`: ^9.88.0 (OrbitControls, helpers)
- `three`: ^0.158.0
- `@/app/lab/modules/simulation`: Field calculation
- `@/app/lab/hooks/useParticleSystem`: Particle state management

---

## Versioning

**V1**: InstancedMesh particle clouds, CPU-driven animation  
**V2**: GPU-accelerated particle updates via compute shaders (WebGPU)

**Migration Path**: Component interfaces remain stable; backend switches from CPU to GPU particle update loop.

---

**Visualization API Contract Complete** ✅
