import { IAntennaPattern } from './types';
import { Vector3D } from '../../types/common.types';

/**
 * Omnidirectional antenna pattern (V1)
 * Returns uniform gain in all directions
 */
export class OmnidirectionalPattern implements IAntennaPattern {
  readonly type = 'omnidirectional';

  /**
   * Returns constant gain of 1.0 for all directions
   * @param direction - Unit vector (ignored for omnidirectional)
   * @returns Gain value of 1.0
   */
  getGain(_direction: Vector3D): number {
    void _direction;
    return 1.0;
  }
}

/**
 * Factory function to create omnidirectional pattern
 */
export function createOmnidirectionalPattern(): IAntennaPattern {
  return new OmnidirectionalPattern();
}
