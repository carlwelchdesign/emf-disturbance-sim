import { IComputeBackend } from './compute-backend.interface';
import { RFSource } from '../../types/source.types';
import { FieldPoint, FieldGrid } from '../../types/field.types';
import { Vector3D } from '../../types/common.types';
import { distance } from '../../lib/math-utils';
import { calculateWaveNumber } from '../../lib/field-math';
import { createOmnidirectionalPattern } from '../source/antenna-patterns';

/**
 * CPU-based field calculator using simplified inverse-distance model
 * V1 implementation: omnidirectional sources, superposition principle
 */
export class CPUBackend implements IComputeBackend {
  readonly name = 'CPU';
  readonly isAvailable = true;

  private omnidirectionalPattern = createOmnidirectionalPattern();

  /**
   * Calculate field strength at a single point from all active sources
   * Uses superposition: sum of contributions from each source
   * Field strength from each source: E = (sqrt(P * G) / r)
   * where P = power, G = antenna gain, r = distance
   */
  calculateFieldAtPoint(
    point: Vector3D,
    sources: RFSource[],
    time: number = 0
  ): FieldPoint {
    if (![point.x, point.y, point.z, time].every(Number.isFinite)) {
      return {
        position: point,
        strength: 0,
        phase: 0,
        timestamp: time,
      };
    }

    let real = 0;
    let imag = 0;

    // Filter to active sources only
    const activeSources = sources.filter((s) => s.active);

    for (const source of activeSources) {
      const r = distance(source.position, point);

      // Handle the case where observation point is at source location
      if (r < 0.001) {
        // Very close to source - use small distance to avoid division by zero
        // In reality, this would require near-field calculation
        continue;
      }

      if (![source.position.x, source.position.y, source.position.z, source.frequency, source.power].every(Number.isFinite)) {
        continue;
      }

      // Get antenna gain in direction of observation point
      const gain = source.gain || this.omnidirectionalPattern.getGain({ x: 0, y: 0, z: 0 });

      // Convert power to watts if needed
      const powerWatts = source.powerUnit === 'dBm'
        ? Math.pow(10, source.power / 10) / 1000
        : source.power;

      // Simplified far-field formula: E = sqrt(P * G) / r
      // This is a simplification of the Friis transmission equation
      // Actual field strength would depend on frequency, but we use normalized units for visualization
      const amplitude = Math.sqrt(powerWatts * gain) / r;

      const waveNumber = calculateWaveNumber(source.frequency);
      const phaseContribution = source.phase + waveNumber * r;

      real += amplitude * Math.cos(phaseContribution);
      imag += amplitude * Math.sin(phaseContribution);
    }

    const totalStrength = Math.sqrt(real * real + imag * imag);
    const totalPhase = Math.atan2(imag, real);

    return {
      position: point,
      strength: totalStrength * Math.sign(real || 1),
      phase: totalPhase,
      timestamp: time,
    };
  }

  /**
   * Calculate field strength across a 3D grid
   * Samples the field at regular intervals within the bounding box
   */
  calculateFieldGrid(
    grid: Omit<FieldGrid, 'values' | 'timestamp'>,
    sources: RFSource[],
    time: number = 0
  ): FieldGrid {
    const { resolution, bounds } = grid;
    const { min, max } = bounds;

    // Create flattened array for field values
    const totalPoints = resolution * resolution * resolution;
    const values = new Float32Array(totalPoints);

    // Calculate step size for each axis
    const stepX = (max.x - min.x) / (resolution - 1);
    const stepY = (max.y - min.y) / (resolution - 1);
    const stepZ = (max.z - min.z) / (resolution - 1);

    // Sample field at each grid point
    let index = 0;
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        for (let k = 0; k < resolution; k++) {
          const point: Vector3D = {
            x: min.x + i * stepX,
            y: min.y + j * stepY,
            z: min.z + k * stepZ,
          };

          const fieldPoint = this.calculateFieldAtPoint(point, sources, time);
          values[index] = fieldPoint.strength;
          index++;
        }
      }
    }

    return {
      resolution,
      bounds,
      values,
      timestamp: Date.now(),
    };
  }
}

/**
 * Factory function to create CPU backend
 */
export function createCPUBackend(): IComputeBackend {
  return new CPUBackend();
}
