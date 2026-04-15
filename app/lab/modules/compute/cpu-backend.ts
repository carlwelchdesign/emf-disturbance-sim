import { IComputeBackend } from './compute-backend.interface';
import { RFSource } from '../../types/source.types';
import { FieldPoint, FieldGrid } from '../../types/field.types';
import { Vector3D } from '../../types/common.types';
import { distance, normalize, cross, add, scale, subtract, magnitude } from '../../lib/math-utils';
import {
  calculateWaveNumber,
  calculateFreeSpaceFieldStrength,
  calculateDirectionalGain,
  calculateNearFieldRadius,
  dbmToWatts,
} from '../../lib/field-math';
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

    let eReal: Vector3D = { x: 0, y: 0, z: 0 };
    let eImag: Vector3D = { x: 0, y: 0, z: 0 };
    let bReal: Vector3D = { x: 0, y: 0, z: 0 };
    let bImag: Vector3D = { x: 0, y: 0, z: 0 };
    let propagationSum: Vector3D = { x: 0, y: 0, z: 0 };

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

      const displacement = subtract(point, source.position);
      const propagation = normalize(displacement);
      const orientation = source.orientation ? normalize(source.orientation) : undefined;
      const baseGain = source.gain ?? this.omnidirectionalPattern.getGain(propagation);
      const directionalGain = calculateDirectionalGain(
        propagation,
        source.antennaType === 'omnidirectional' ? undefined : orientation,
        source.antennaType === 'phased_array' ? 8 : 4
      );
      const gain = baseGain * directionalGain;

      // Convert power to watts if needed
      const powerWatts = source.powerUnit === 'dBm'
        ? dbmToWatts(source.power)
        : source.power;

      const nearFieldRadius = calculateNearFieldRadius(source.frequency);
      const amplitude = calculateFreeSpaceFieldStrength(powerWatts, gain, r, nearFieldRadius);

      const waveNumber = calculateWaveNumber(source.frequency);
      const angularFrequency = 2 * Math.PI * source.frequency;
      const phaseContribution = angularFrequency * time - waveNumber * r + source.phase;

      const reference = orientation ?? (Math.abs(propagation.y) < 0.85 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 });
      let eBasis = normalize(cross(cross(propagation, reference), propagation));
      if (magnitude(eBasis) === 0) {
        eBasis = normalize(cross(cross(propagation, { x: 0, y: 0, z: 1 }), propagation));
      }
      if (magnitude(eBasis) === 0) {
        eBasis = { x: 0, y: 1, z: 0 };
      }
      const orthogonalBasis = normalize(cross(propagation, eBasis));

      const nearFieldDamping = 1 / (1 + Math.pow(nearFieldRadius / Math.max(r, 0.05), 2) * 0.25);
      const dampedAmplitude = amplitude * nearFieldDamping;

      const instantaneousE = add(
        scale(eBasis, dampedAmplitude * Math.cos(phaseContribution)),
        scale(orthogonalBasis, dampedAmplitude * 0.35 * Math.sin(phaseContribution))
      );
      const instantaneousB = scale(cross(propagation, instantaneousE), 1 / 376.73);
      const sourcePoynting = cross(instantaneousE, instantaneousB);

      eReal = add(eReal, instantaneousE);
      eImag = add(eImag, scale(eBasis, dampedAmplitude * Math.sin(phaseContribution)));
      bReal = add(bReal, instantaneousB);
      bImag = add(bImag, scale(cross(propagation, eBasis), (dampedAmplitude / 376.73) * Math.sin(phaseContribution)));
      propagationSum = add(propagationSum, sourcePoynting);
    }

    const totalE = add(eReal, scale(eImag, 0.15));
    const totalB = add(bReal, scale(bImag, 0.15));
    const totalStrength = magnitude(totalE);
    const totalPhase = Math.atan2(totalE.y, totalE.x);
    const poynting = magnitude(propagationSum) > 0 ? normalize(propagationSum) : normalize(cross(totalE, totalB));

    return {
      position: point,
      strength: totalStrength,
      phase: totalPhase,
      eField: totalE,
      bField: totalB,
      poynting: magnitude(poynting) > 0 ? poynting : { x: 1, y: 0, z: 0 },
      propagation: magnitude(propagationSum) > 0 ? normalize(propagationSum) : undefined,
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
