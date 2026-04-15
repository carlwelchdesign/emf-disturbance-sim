# Research: EMF Disturbance and Interference Lab

**Phase**: 0 - Outline & Research  
**Date**: 2025-06-09  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a physically inspired, Tufte-style EMF visualization with truthful low-clutter particle-cloud rendering, flow/curl cues, and eventual Maxwell-inspired behavior. The focus is on browser-performant real-time field simulation using React Three Fiber and Three.js, with CPU-based computation in V1 and a clear path to GPU acceleration in V2.

---

## 1. Physics Foundations: Field Equations for V1

### Decision: Simplified Superposition Model with Phase-Aware Interference

For V1, we use a **simplified plane-wave approximation** with **superposition** and **phase coherence** to enable real-time browser rendering while maintaining educational accuracy for interference patterns.

### Rationale

- **Full Maxwell solver** (solving ∇×E = -∂B/∂t, ∇×B = μ₀ε₀∂E/∂t) is computationally prohibitive for real-time browser rendering with 3-5 sources at 60 FPS on CPU.
- **Ray-tracing EMF propagation** requires too many rays for smooth interference pattern visualization.
- **Superposition principle** (linear sum of individual source contributions) is physically valid for linear media (air, vacuum) and enables efficient field calculation at arbitrary points.
- **Phase-aware superposition** preserves interference phenomena (constructive/destructive) which is the core educational value.

### Final Equations to Implement (V1)

#### 1.1 Point Source Field Contribution (Spherical Wave Approximation)

For a single omnidirectional point source at position **r₀** with frequency *f*, amplitude *A*, and phase *φ*:

```
E(r, t) = (A / |r - r₀|) * sin(2πf·t - k·|r - r₀| + φ)
```

Where:
- **r** = observation point (x, y, z)
- **r₀** = source position
- *k* = 2πf/c = wave number (c = speed of light ≈ 3×10⁸ m/s)
- *|r - r₀|* = Euclidean distance from source to observation point
- *A* = source amplitude (arbitrary units for V1; can map to power in V2)
- *φ* = source phase offset (radians or degrees)

**Physical meaning**: Electric field magnitude falls off as 1/r (far-field approximation), and phase varies linearly with distance (wavefront propagation).

#### 1.2 Superposition for Multiple Sources

For *N* sources, the total field at point **r** and time *t* is:

```
E_total(r, t) = Σᵢ₌₁ᴺ Eᵢ(r, t)
              = Σᵢ₌₁ᴺ (Aᵢ / |r - rᵢ|) * sin(2πfᵢ·t - kᵢ·|r - rᵢ| + φᵢ)
```

**Interference emerges naturally**: When two sources have the same frequency and phases align (φ₁ ≈ φ₂ + 2πn), constructive interference occurs. When phases oppose (φ₁ ≈ φ₂ + π + 2πn), destructive interference occurs.

#### 1.3 Instantaneous Field Magnitude (for Visualization)

For rendering, we often want the **magnitude** at a given instant *t*:

```
|E_total(r, t)| = |Σᵢ Eᵢ(r, t)|
```

Or, for a **time-averaged intensity** (useful for static heatmaps):

```
I(r) = ⟨E²(r, t)⟩ₜ ≈ (1/2) * |E_total(r, t)|²
```

This gives a scalar field intensity that can be mapped to particle density or color.

#### 1.4 Near-Field vs Far-Field Distinction (Conceptual in V1)

- **Far-field**: Distance *d* > λ/2π (where λ = c/f is wavelength). Use 1/r falloff.
- **Near-field**: Distance *d* < λ/2π. Full solution involves reactive fields (E ∝ 1/r² and 1/r³ terms). **V1 simplification**: Still use 1/r but label regions as "near-field (simplified)" with disclaimer.

**Gate for V2**: Replace near-field with proper reactive/radiating split using full dipole equations.

---

### 1.5 Flow/Curl Conceptual Cues (V1)

User requested **flow/curl cues** as part of a Maxwell-inspired visualization. In V1, these are **conceptual overlays**, not full solvers.

**Decision**: Visualize **Poynting vector direction** (energy flow) as directional arrows or particle drift:

```
S(r, t) = (1/μ₀) * E(r, t) × B(r, t)
```

For plane waves, **B** is perpendicular to **E** and in the direction of propagation. Simplification for V1:

```
direction(r) = normalize(r - r_source)
```

Particles drift radially outward from each source, with speed proportional to frequency (higher frequency = faster cadence).

**Curl visualization** (∇ × E): For educational overlay, show that in the far-field, ∇ × E points in the B-field direction. V1 approach: small rotating arrows indicating right-hand-rule direction.

**Alternatives considered**:
- Full FDTD (Finite-Difference Time-Domain) solver: Too slow for real-time browser use.
- GPU-based Maxwell solver: Deferred to V2 (requires WebGPU compute shaders).

---

## 2. Visualization Approach: Tufte-Style Particle-Cloud Rendering

### Decision: Low-Clutter Particle-Cloud with Emissive Dots and Restrained Halos

Following Edward Tufte's **data-ink ratio** principle, every visual element must encode field data or be removed. No chartjunk, no decorative effects.

### Rationale

- **Particle systems** are inherently data-rich: position encodes field location, velocity/cadence encodes frequency, brightness/color encodes field strength, density encodes superposition intensity.
- **Wavefront rings** (concentric expanding circles) can encode frequency and phase, but require careful tuning to avoid visual clutter with multiple sources.
- **Hybrid approach** (particles + occasional wavefront pulses) provides clearest physics communication.

### Final Rendering Strategy (V1)

#### 2.1 Particle-Cloud System (Primary Visualization)

Each source emits a **continuous particle cloud** with:

- **Core particle radius**: 0.05-0.08 scene units (small dots, not streaks)
- **Halo radius**: 2x-3x core radius (restrained glow for visibility)
- **Emissive intensity**: 0.6-1.5 (no over-bright bloom that obscures data)
- **Color**: Encodes source ownership (e.g., Source 1 = blue, Source 2 = red)
- **Emission cadence**: Proportional to frequency (higher *f* → faster emission)
- **Particle lifetime**: Short (1-2 wavelengths), so cloud represents active wavefront zone
- **Particle drift**: Radially outward from source at speed proportional to *c* (visual, not literal speed)

**Density modulation**: In regions of constructive interference, particle density increases (superposition creates more "activity"). In destructive interference, density decreases (particles cancel out visually).

#### 2.2 Field Strength Color Mapping (Secondary Cue)

- Use a **perceptually uniform color scale** (e.g., Viridis or a custom blue→white→red scale)
- Map instantaneous field magnitude |E_total(r, t)| to color intensity
- Avoid rainbow scales (not perceptually uniform, can mislead magnitude comparisons)
- Include a **legend** with units (V/m) and value range

#### 2.3 Flow/Curl Cues (Tertiary Overlay)

- **Optional toggle**: Show directional arrows indicating Poynting vector (energy flow)
- **Curl indicators**: Small rotating arrows or field-line loops near sources (educational overlay)
- **Label clearly**: "Conceptual - Not Full Maxwell Solution" to maintain honesty

#### 2.4 Minimize Non-Data Ink

- **No decorative grids** unless they encode distance/scale
- **No 3D depth cues** (shadows, reflections) unless they aid spatial understanding
- **No excessive post-processing** (bloom, lens flares, vignette)
- **Measurement points**: Simple markers with numerical readouts, not 3D orbs

**Alternatives considered**:
- **Heatmap-only visualization**: Static, less engaging, doesn't communicate wave propagation
- **Vector field arrows everywhere**: Visual clutter with 5 sources, hard to see interference
- **Full volumetric rendering**: Too expensive for CPU, deferred to V2 GPU

---

## 3. Rendering Technology: React Three Fiber Best Practices

### Decision: React Three Fiber + Three.js with `InstancedMesh` for Particles

### Rationale

- **React Three Fiber (R3F)** provides declarative React bindings to Three.js, enabling component-based 3D scene management
- **Three.js** is the industry-standard WebGL library with robust particle system support
- **InstancedMesh**: Efficient rendering of thousands of identical geometries (particles) with different transforms/colors

### Best Practices

#### 3.1 Performance Optimization

**Use `InstancedMesh` for Particle Clouds**:
```typescript
<instancedMesh args={[geometry, material, particleCount]}>
  <sphereGeometry args={[particleRadius, 8, 8]} />
  <meshBasicMaterial color={sourceColor} />
</instancedMesh>
```

Update instance matrices in `useFrame` hook:
```typescript
useFrame(() => {
  for (let i = 0; i < count; i++) {
    // Update particle position, scale, color
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, color);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;
});
```

**Throttle expensive calculations**:
- Debounce parameter sliders (avoid recalc on every pixel dragged)
- Use `useMemo` for geometry/materials that don't change every frame
- Spatial partitioning for field calculation (e.g., octree) if particle count > 5000

#### 3.2 Frame-Update Loop Structure

**Pseudocode for each frame**:
```
function onFrame(deltaTime, elapsedTime):
  1. Update animation time:
     t = elapsedTime * animationSpeed

  2. For each source i:
     a. Emit new particles at source position (cadence based on frequency)
     b. Update existing particles:
        - position += velocity * deltaTime
        - lifetime -= deltaTime
        - remove if lifetime <= 0

  3. For each particle p:
     a. Calculate field contribution at p.position:
        E_p = Σ_sources (A_i / distance_i) * sin(2πf_i*t - k_i*distance_i + φ_i)
     b. Set particle brightness/color based on |E_p|

  4. Update InstancedMesh matrices and colors

  5. Measure FPS, throttle quality if < 30 FPS
```

#### 3.3 Camera Controls

Use `@react-three/drei` helpers:
- `OrbitControls` for orbit/pan/zoom
- Constrain camera distance (minDistance=5, maxDistance=50)
- Disable damping for immediate response (or use light damping for smoothness)

---

## 4. Physically Inspired vs Stylized Behavior

### Decision: Hybrid Approach with Clear Separation

The simulation must distinguish:

1. **Physically Inspired Math** (lib/field-math.ts, modules/simulation/):
   - Superposition principle
   - 1/r falloff
   - Phase-aware interference
   - Frequency-wavelength relationship (λ = c/f)
   - Near/far field thresholds

2. **Stylized Visual Effects** (modules/visualization/, components/Canvas3D/):
   - Particle emission cadence (tuned for visual clarity, not literal photon speed)
   - Halo glow (artistic choice for visibility)
   - Color mapping (chosen for perceptual uniformity, not physical spectrum)
   - Animation speed control (user can slow down/speed up for educational clarity)

3. **Threat/Interference Logic** (modules/scenario/):
   - "Hostile emitters" (scenario-driven, not physics-driven)
   - "Jamming zones" (conceptual regions of high interference)
   - Safety threshold overlays (policy-driven, not physics-driven)

**Rationale**: Mixing these layers causes confusion and makes it hard to validate correctness or extend to V2 Maxwell solver.

**Implementation**: Separate modules with clear contracts (see contracts/ in Phase 1).

---

## 5. Performance and Browser Constraints

### Decision: CPU-Based Computation in V1, GPU-Ready Interface for V2

**V1 Target**: 3-5 sources, 1000-2000 particles per source, 30-60 FPS on mid-range laptops (2021+).

**Constraints**:
- **JavaScript single-threaded**: Field calculations block rendering if not throttled
- **WebGL draw call limit**: Use `InstancedMesh` to reduce draw calls (1 per source, not 1 per particle)
- **Memory**: Avoid allocating new arrays every frame (reuse buffers)

**Optimization Strategy**:
- **Spatial sampling**: Don't calculate field at every particle position; use grid sampling and interpolate
- **LOD (Level of Detail)**: Reduce particle count if FPS < 30
- **Web Workers** (optional V1.5): Offload field calculation to worker thread
- **GPU Compute** (V2): Use WebGPU compute shaders for field calculation on 1024×1024 grid

**Alternatives considered**:
- **WASM for field calculation**: Marginal speedup vs TypeScript, adds build complexity
- **Pre-calculated field textures**: Not viable for dynamic multi-source scenarios

---

## 6. Tuning Controls for UI

### Decision: Bounded, Labeled Controls with Real-Time Preview

Users need to explore parameter space without breaking the simulation or creating unreadable visualizations.

**Recommended UI Controls**:

| Parameter | Range | Default | Unit | Effect |
|-----------|-------|---------|------|--------|
| Frequency | 0.1 - 10 Hz (visual scale) | 1.0 Hz | Hz | Emission cadence, wavelength |
| Amplitude | 0 - 100 | 50 | arbitrary | Brightness, particle density |
| Phase | 0 - 360 | 0 | degrees | Interference pattern shift |
| Position | (room bounds) | center | meters | Source location |
| Animation Speed | 0.5 - 2.0x | 1.0x | multiplier | Playback speed (not physics) |
| Particle Density | Low/Med/High | Medium | preset | Visual quality vs performance |
| Color Scheme | Viridis/Turbo/Custom | Viridis | N/A | Perceptual uniformity |

**Validation**:
- Sliders have min/max bounds (no infinite frequency)
- Input fields validate on blur (reject NaN, negative values)
- Changes debounced (100ms delay) to avoid frame rate spikes

**Disclaimers**:
- "Animation speed does not change physics, only visual playback"
- "Amplitude is arbitrary units in V1; maps to dBm in V2"
- "Frequency scale is adjusted for visualization; real RF is GHz range"

---

## 7. Enhanced Version: Collision Zones, Jamming, Scattering

### Decision: Deferred to V1.5 or V2, but Plan Architecture Now

**Enhanced Features** (not in V1 MVP):

1. **Collision Zones**: Regions where field strength exceeds threshold → visual "hotspot" indicator
2. **Jamming**: Intentional destructive interference to suppress a target frequency
3. **Resonance**: When source frequency matches a spatial mode → amplification
4. **Scattering**: Particles scatter off obstacles (simplified diffraction)

**Architecture Plan** (enable future extension):
- **Scenario module** defines collision rules (threshold-based)
- **Simulation module** supports material attenuation (V2 feature, stub in V1)
- **Visualization module** adds "collision zone" overlay layer

**V1 Foundation**: Ensure `modules/scenario/presets.ts` can define arbitrary rules without rewriting simulation engine.

---

## 8. Recommended Architecture (Module Boundaries)

### Decision: 8 Modules with Clean Interfaces

Following SOLID and Principle I (Feature-Boundary Architecture):

1. **UI Module** (`components/`): React components, no business logic
2. **Simulation Module** (`modules/simulation/`): Field calculation, superposition, phase math
3. **Compute Module** (`modules/compute/`): CPU/GPU backend abstraction (strategy pattern)
4. **Source Module** (`modules/source/`): Antenna models, emission patterns
5. **Environment Module** (`modules/environment/`): Room bounds, materials (V2)
6. **Scenario Module** (`modules/scenario/`): Presets, curated setups, rules
7. **Visualization Module** (`modules/visualization/`): Three.js rendering, color maps
8. **Reporting Module** (`modules/reporting/`): V2 EN 62232 compliance (stub in V1)

**Contracts** (Phase 1 deliverable):
- Each module exposes TypeScript interfaces
- Simulation module can run headless (testable without WebGL)
- Compute backend is swappable (CPU ↔ GPU)

---

## 9. Data Structures (Preview for Phase 1)

### Typed Entities (to be detailed in data-model.md)

```typescript
// Source entity
interface EMFSource {
  id: string;
  position: Vector3;
  frequency: number;  // Hz
  amplitude: number;  // arbitrary units
  phase: number;      // radians
  antennaType: 'omnidirectional'; // V1 only
}

// Field point (for calculation)
interface FieldPoint {
  position: Vector3;
  fieldMagnitude: number;  // |E| in V/m
  fieldPhase: number;      // radians
  isNearField: boolean;    // distance < λ/2π
}

// Particle (for rendering)
interface Particle {
  position: Vector3;
  velocity: Vector3;
  lifetime: number;       // seconds
  sourceId: string;       // which source emitted this
  brightness: number;     // 0-1
}
```

---

## 10. Summary of Decisions

| Topic | Decision | Rationale | Alternatives Rejected |
|-------|----------|-----------|----------------------|
| **Physics Model** | Superposition of spherical waves, 1/r falloff | Real-time browser performance, educational accuracy | Full Maxwell FDTD (too slow), ray-tracing (too many rays) |
| **Visualization** | Particle-cloud with emissive dots, restrained halos | Tufte data-ink ratio, truthful representation | Heatmap-only (static), vector arrows (cluttered) |
| **Rendering** | React Three Fiber + InstancedMesh | Industry standard, efficient instancing | Custom WebGL (too low-level), A-Frame (less flexible) |
| **Compute** | CPU in V1, GPU-ready interface | V1 simplicity, V2 extensibility | WASM (marginal gain), Web Workers (complexity) |
| **Flow/Curl** | Conceptual overlay (Poynting direction) | Educational value without full solver cost | Full ∇×E solver (deferred to V2) |
| **Architecture** | 8 modules with clean interfaces | SOLID, testability, V2 extensibility | Monolithic (hard to test), over-engineered (premature) |

---

## Next Steps (Phase 1)

1. **data-model.md**: Define typed entities, relationships, validation rules
2. **contracts/**: Document module interfaces (simulation API, compute backend API, visualization API)
3. **quickstart.md**: Developer onboarding, architecture tour, how to add a new scenario

---

**Research Phase Complete** ✅
