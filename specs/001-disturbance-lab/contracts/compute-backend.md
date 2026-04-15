# Compute Backend Contract

**Module**: `app/lab/modules/compute/`  
**Purpose**: Strategy pattern for swappable CPU/GPU field computation backends  
**Version**: 1.0 (V1 CPU; V2 GPU via WebGPU)

---

## Interface Definition

### ComputeBackend

Abstract interface for field computation strategies.

```typescript
interface ComputeBackend {
  /**
   * Backend identifier
   */
  readonly type: ComputeBackendType;
  
  /**
   * Check if this backend is available in current browser
   */
  isAvailable(): boolean;
  
  /**
   * Initialize backend (allocate buffers, compile shaders, etc.)
   * @throws Error if initialization fails
   */
  initialize(): Promise<void>;
  
  /**
   * Clean up resources
   */
  dispose(): void;
  
  /**
   * Compute field values at given positions
   * @param positions - Array of 3D positions to calculate field
   * @param sources - Array of active EMF sources
   * @param time - Current animation time (seconds)
   * @returns Array of field magnitudes (|E| in V/m), same order as positions
   */
  computeField(
    positions: Vector3[],
    sources: EMFSource[],
    time: number
  ): Promise<Float32Array>;
  
  /**
   * Get performance metrics for this backend
   */
  getMetrics(): ComputeMetrics;
}

type ComputeBackendType = 'cpu' | 'gpu-webgpu' | 'gpu-webgl';

interface ComputeMetrics {
  lastComputeTimeMs: number;       // Time to compute last batch
  averageComputeTimeMs: number;    // Running average
  pointsPerSecond: number;         // Throughput metric
}
```

---

## V1 Implementation: CPUBackend

### CPU-Based Strategy

```typescript
class CPUBackend implements ComputeBackend {
  readonly type = 'cpu';
  
  private metrics: ComputeMetrics = {
    lastComputeTimeMs: 0,
    averageComputeTimeMs: 0,
    pointsPerSecond: 0,
  };
  
  isAvailable(): boolean {
    return true;  // CPU always available
  }
  
  async initialize(): Promise<void> {
    // No-op for CPU (no resources to allocate)
  }
  
  dispose(): void {
    // No-op for CPU
  }
  
  async computeField(
    positions: Vector3[],
    sources: EMFSource[],
    time: number
  ): Promise<Float32Array> {
    const startTime = performance.now();
    const results = new Float32Array(positions.length);
    
    for (let i = 0; i < positions.length; i++) {
      let totalReal = 0;
      let totalImag = 0;
      
      for (const source of sources) {
        if (!source.active) continue;
        
        const distance = this.calculateDistance(positions[i], source.position);
        const k = (2 * Math.PI * source.frequency) / SPEED_OF_LIGHT;
        const magnitude = source.amplitude / distance;
        const phase = 2 * Math.PI * source.frequency * time - k * distance + source.phase;
        
        totalReal += magnitude * Math.cos(phase);
        totalImag += magnitude * Math.sin(phase);
      }
      
      results[i] = Math.sqrt(totalReal ** 2 + totalImag ** 2);
    }
    
    // Update metrics
    const elapsedMs = performance.now() - startTime;
    this.metrics.lastComputeTimeMs = elapsedMs;
    this.metrics.averageComputeTimeMs = 
      0.9 * this.metrics.averageComputeTimeMs + 0.1 * elapsedMs;
    this.metrics.pointsPerSecond = 
      positions.length / (elapsedMs / 1000);
    
    return results;
  }
  
  getMetrics(): ComputeMetrics {
    return { ...this.metrics };
  }
  
  private calculateDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
```

---

## V2 Implementation: GPUBackend (Stub for V1)

### WebGPU Strategy

```typescript
class GPUBackend implements ComputeBackend {
  readonly type = 'gpu-webgpu';
  
  private device?: GPUDevice;
  private pipeline?: GPUComputePipeline;
  
  isAvailable(): boolean {
    return 'gpu' in navigator;  // Check for WebGPU support
  }
  
  async initialize(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('WebGPU not available');
    }
    
    // Request GPU adapter and device
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('Failed to get GPU adapter');
    }
    
    this.device = await adapter.requestDevice();
    
    // Compile compute shader (V2 implementation)
    const shaderModule = this.device.createShaderModule({
      code: FIELD_COMPUTE_SHADER,  // WGSL shader code
    });
    
    this.pipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'computeField',
      },
    });
  }
  
  async computeField(
    positions: Vector3[],
    sources: EMFSource[],
    time: number
  ): Promise<Float32Array> {
    if (!this.device || !this.pipeline) {
      throw new Error('GPU backend not initialized');
    }
    
    // V2 implementation: Upload positions and sources to GPU buffers,
    // dispatch compute shader, read back results
    // For V1, this is a stub
    throw new Error('GPU backend not implemented in V1');
  }
  
  dispose(): void {
    this.device?.destroy();
  }
  
  getMetrics(): ComputeMetrics {
    return {
      lastComputeTimeMs: 0,
      averageComputeTimeMs: 0,
      pointsPerSecond: 0,
    };
  }
}

// Placeholder for V2 WGSL compute shader
const FIELD_COMPUTE_SHADER = `
@group(0) @binding(0) var<storage, read> positions: array<vec3<f32>>;
@group(0) @binding(1) var<storage, read> sources: array<Source>;
@group(0) @binding(2) var<uniform> time: f32;
@group(0) @binding(3) var<storage, read_write> results: array<f32>;

struct Source {
  position: vec3<f32>,
  frequency: f32,
  amplitude: f32,
  phase: f32,
}

@compute @workgroup_size(64)
fn computeField(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  if (i >= arrayLength(&positions)) {
    return;
  }
  
  let point = positions[i];
  var totalReal: f32 = 0.0;
  var totalImag: f32 = 0.0;
  
  for (var j: u32 = 0u; j < arrayLength(&sources); j = j + 1u) {
    let source = sources[j];
    let distance = length(point - source.position);
    let k = 2.0 * 3.14159 * source.frequency / 3e8;
    let magnitude = source.amplitude / distance;
    let phase = 2.0 * 3.14159 * source.frequency * time - k * distance + source.phase;
    
    totalReal += magnitude * cos(phase);
    totalImag += magnitude * sin(phase);
  }
  
  results[i] = sqrt(totalReal * totalReal + totalImag * totalImag);
}
`;
```

---

## Factory Pattern for Backend Selection

### ComputeBackendFactory

Automatically select best available backend.

```typescript
class ComputeBackendFactory {
  static async createBackend(): Promise<ComputeBackend> {
    // V1: Always use CPU
    // V2: Try GPU first, fallback to CPU
    
    const gpuBackend = new GPUBackend();
    if (gpuBackend.isAvailable()) {
      try {
        await gpuBackend.initialize();
        console.log('Using GPU compute backend');
        return gpuBackend;
      } catch (error) {
        console.warn('GPU backend initialization failed, falling back to CPU', error);
      }
    }
    
    const cpuBackend = new CPUBackend();
    await cpuBackend.initialize();
    console.log('Using CPU compute backend');
    return cpuBackend;
  }
}
```

---

## Usage in Simulation Engine

### Integration Example

```typescript
import { ComputeBackendFactory } from '@/app/lab/modules/compute';
import type { ComputeBackend } from '@/app/lab/modules/compute';

class SimulationEngine {
  private backend: ComputeBackend;
  
  constructor() {
    // Initialize with best available backend
    this.backend = await ComputeBackendFactory.createBackend();
  }
  
  async calculateFieldBatch(
    points: Vector3[],
    sources: EMFSource[],
    time: number
  ): Promise<FieldPoint[]> {
    // Use backend to compute field magnitudes
    const magnitudes = await this.backend.computeField(points, sources, time);
    
    // Convert to FieldPoint objects
    return points.map((position, i) => ({
      position,
      fieldMagnitude: magnitudes[i],
      fieldPhase: 0,  // Phase not needed for visualization in V1
      isNearField: this.isNearField(position, sources),
    }));
  }
  
  dispose() {
    this.backend.dispose();
  }
}
```

---

## Performance Targets

### V1 (CPU)

- **Target**: 1000 field points in < 10ms (for 60 FPS)
- **Constraint**: Single-threaded JavaScript
- **Optimization**: Inline math, avoid object allocation, use typed arrays

### V2 (GPU)

- **Target**: 100,000 field points in < 5ms (enables high-resolution field grids)
- **Mechanism**: WebGPU compute shaders running on GPU
- **Scaling**: Near-linear with GPU cores (1000x+ speedup vs CPU)

---

## Testing Requirements

### Backend Interface Tests

1. **CPU backend availability**: Always returns true
2. **GPU backend availability**: Correctly detects WebGPU support
3. **Field calculation correctness**: CPU and GPU backends produce identical results (within floating-point tolerance)
4. **Metrics tracking**: `getMetrics()` returns valid performance data
5. **Dispose safety**: Calling `dispose()` multiple times doesn't crash

### Integration Tests

1. **Factory creates working backend**: `createBackend()` returns initialized backend
2. **Fallback behavior**: If GPU init fails, factory returns CPU backend
3. **Batch computation**: Handles 0, 1, 100, and 1000 field points without error

---

## Dependencies

- `@/app/lab/types/source.types`: EMFSource interface
- `@/app/lab/types/common.types`: Vector3 type
- V2 only: WebGPU browser APIs (`navigator.gpu`)

---

## Versioning

**V1**: CPU-only backend (production)  
**V1.5** (optional): Web Workers for CPU parallelism  
**V2**: WebGPU compute backend for 100x+ speedup

**Migration Path**: Existing code using `ComputeBackend` interface requires no changes; factory automatically selects best backend.

---

**Compute Backend Contract Complete** ✅
