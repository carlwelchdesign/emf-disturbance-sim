import { RFSource } from '../../types/source.types';
import { FieldPoint, FieldGrid } from '../../types/field.types';

/**
 * Interface for the simulation engine
 * Orchestrates field calculations using a compute backend
 */
export interface ISimulationEngine {
  /**
   * Calculate field at a specific point
   */
  calculateFieldAtPoint(
    point: { x: number; y: number; z: number },
    sources: RFSource[],
    time?: number
  ): FieldPoint;

  /**
   * Calculate field grid for visualization
   */
  calculateFieldGrid(
    resolution: number,
    bounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } },
    sources: RFSource[],
    time?: number
  ): FieldGrid;

  /**
   * Get current backend name
   */
  getBackendName(): string;

  /**
   * Check if simulation is ready
   */
  isReady(): boolean;
}
