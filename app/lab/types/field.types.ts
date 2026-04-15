import { Vector3D, BoundingBox } from './common.types';

/**
 * Represents a location in 3D space where field strength is calculated
 */
export interface FieldPoint {
  /** 3D position in world space */
  position: Vector3D;
  
  /** Calculated field strength at this point (can be negative) */
  strength: number;
  
  /** Calculated phase at this point (radians) */
  phase: number;

  /** Instantaneous electric field vector at this point */
  eField?: Vector3D;

  /** Instantaneous magnetic field vector at this point */
  bField?: Vector3D;

  /** Energy-flow direction derived from E x B */
  poynting?: Vector3D;

  /** Local propagation direction used by the solver */
  propagation?: Vector3D;
  
  /** Timestamp when this field value was calculated (for animation) */
  timestamp?: number;
}

/**
 * Grid of field points for spatial sampling and visualization
 */
export interface FieldGrid {
  /** Resolution along each axis (e.g., 32 means 32×32×32 = 32,768 points) */
  resolution: number;
  
  /** Bounding box for the grid */
  bounds: BoundingBox;
  
  /** Flattened array of field strength values (length = resolution^3) */
  values: Float32Array;
  
  /** When this grid was last calculated */
  timestamp: number;
}

/**
 * Aggregated field strength broken down by source faction at a single point.
 * Used by ThreatMetricsPanel and drone status calculation.
 */
export interface FactionMetrics {
  /** Net E-field from friendly sources (V/m) */
  eFieldFriendly: number;
  /** Net E-field from hostile sources (V/m) */
  eFieldHostile: number;
  /** Superposed E-field from all sources (V/m) */
  eFieldNet: number;
  /** 0–1 ratio of hostile dominance: eHostile / (eFriendly + eHostile) */
  threatDominance: number;
  /** Field magnitude cancelled by destructive interference (V/m) */
  destructiveStrength: number;
  /** Additional field magnitude from constructive interference (V/m) */
  constructiveStrength: number;
  /** Normalised overlap score between friendly and hostile fields */
  interactionScore: number;
  /** Spatial gradient magnitude |∇E| at this point (V/m²) — computed only when requested */
  gradient: number;
}

/**
 * Represents identified regions of constructive or destructive interference
 */
export interface InterferencePattern {
  /** Type of interference detected */
  type: 'constructive' | 'destructive' | 'mixed';
  
  /** Center point of the interference region */
  center: Vector3D;
  
  /** Approximate radius of the region (meters) */
  radius: number;
  
  /** Peak field strength in this region */
  peakStrength: number;
  
  /** Contributing source IDs */
  sourceIds: string[];
}
