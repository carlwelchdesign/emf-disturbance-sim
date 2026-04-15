import { RFSource } from '../../types/source.types';
import { FieldPoint, FieldGrid } from '../../types/field.types';

/**
 * Interface for compute backends (CPU, GPU)
 * Implementations provide field calculation strategies
 */
export interface IComputeBackend {
  /**
   * Calculate field strength at a single point from all active sources
   * @param point - 3D position to calculate field at
   * @param sources - Array of active RF sources
   * @param time - Current simulation time (for animation)
   * @returns Field strength and phase at the point
   */
  calculateFieldAtPoint(
    point: { x: number; y: number; z: number },
    sources: RFSource[],
    time?: number
  ): FieldPoint;

  /**
   * Calculate field strength across a 3D grid
   * @param grid - Grid configuration (resolution and bounds)
   * @param sources - Array of active RF sources
   * @param time - Current simulation time
   * @returns Populated field grid with strength values
   */
  calculateFieldGrid(
    grid: Omit<FieldGrid, 'values' | 'timestamp'>,
    sources: RFSource[],
    time?: number
  ): FieldGrid;

  /**
   * Backend name/identifier
   */
  readonly name: string;

  /**
   * Whether this backend is available on the current platform
   */
  readonly isAvailable: boolean;
}
