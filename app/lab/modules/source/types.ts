import { Vector3D } from '../../types/common.types';

/**
 * Interface for antenna radiation patterns
 * Returns gain in a given direction
 */
export interface IAntennaPattern {
  /**
   * Calculate antenna gain in a specific direction
   * @param direction - Unit vector pointing from antenna to observation point
   * @returns Gain value (linear, not dB)
   */
  getGain(direction: Vector3D): number;

  /**
   * Pattern type identifier
   */
  readonly type: string;
}
