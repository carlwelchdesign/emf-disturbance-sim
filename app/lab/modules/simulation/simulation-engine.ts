import { ISimulationEngine } from './types';
import { IComputeBackend } from '../compute/compute-backend.interface';
import { createCPUBackend } from '../compute/cpu-backend';
import { RFSource } from '../../types/source.types';
import { FieldPoint, FieldGrid } from '../../types/field.types';
import { BoundingBox } from '../../types/common.types';

/**
 * Simulation engine orchestrating field calculations
 * Delegates actual computation to a backend (CPU or GPU)
 */
export class SimulationEngine implements ISimulationEngine {
  private backend: IComputeBackend;

  constructor(backend?: IComputeBackend) {
    // Default to CPU backend if none provided
    this.backend = backend || createCPUBackend();
  }

  /**
   * Calculate field at a specific point
   */
  calculateFieldAtPoint(
    point: { x: number; y: number; z: number },
    sources: RFSource[],
    time: number = 0
  ): FieldPoint {
    return this.backend.calculateFieldAtPoint(point, sources, time);
  }

  /**
   * Calculate field grid for visualization
   */
  calculateFieldGrid(
    resolution: number,
    bounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } },
    sources: RFSource[],
    time: number = 0
  ): FieldGrid {
    // Calculate bounding box size
    const sizeX = bounds.max.x - bounds.min.x;
    const sizeY = bounds.max.y - bounds.min.y;
    const sizeZ = bounds.max.z - bounds.min.z;
    const size = Math.max(sizeX, sizeY, sizeZ);

    const boundingBox: BoundingBox = {
      min: bounds.min,
      max: bounds.max,
      size,
    };

    return this.backend.calculateFieldGrid(
      {
        resolution,
        bounds: boundingBox,
      },
      sources,
      time
    );
  }

  /**
   * Get current backend name
   */
  getBackendName(): string {
    return this.backend.name;
  }

  /**
   * Check if simulation is ready
   */
  isReady(): boolean {
    return this.backend.isAvailable;
  }

  /**
   * Switch to a different backend
   * Allows runtime swapping between CPU and GPU (for V2)
   */
  setBackend(backend: IComputeBackend): void {
    if (!backend.isAvailable) {
      throw new Error(`Backend ${backend.name} is not available`);
    }
    this.backend = backend;
  }
}

/**
 * Factory function to create simulation engine
 */
export function createSimulationEngine(backend?: IComputeBackend): ISimulationEngine {
  return new SimulationEngine(backend);
}
