import { Vector3D } from './common.types';

/**
 * Measurement point placed in 3D space for field strength analysis
 */
export interface MeasurementPoint {
  /** Unique identifier */
  id: string;
  
  /** 3D position in world space */
  position: Vector3D;
  
  /** Calculated field strength at this point (V/m) */
  fieldStrength: number;
  
  /** Power density at this point (W/m²) */
  powerDensity: number;
  
  /** Whether this point is in near-field or far-field region */
  region: 'near-field' | 'far-field';
  
  /** Label for this measurement point */
  label?: string;
  
  /** When this measurement was taken */
  timestamp: number;
}

/** Parameters for creating a new measurement point */
export type CreateMeasurementParams = Omit<MeasurementPoint, 'id' | 'timestamp'>;
