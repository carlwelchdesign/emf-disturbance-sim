import { Vector3D } from './common.types';

/**
 * RF/EMF Source with configurable parameters
 * Represents a radio frequency or electromagnetic field source (antenna, device)
 */
export interface RFSource {
  /** Unique identifier for the source */
  id: string;
  
  /** 3D position in world space (meters) */
  position: Vector3D;
  
  /** RF frequency in Hz (e.g., 2.4e9 for 2.4 GHz Wi-Fi) */
  frequency: number;
  
  /** Transmit power in watts or dBm */
  power: number;
  
  /** Power unit */
  powerUnit: 'watts' | 'dBm';
  
  /** Phase offset in radians (for multi-source scenarios, valid range: 0 - 2π) */
  phase: number;
  
  /** Antenna type (omnidirectional in V1, directional/phased in V2) */
  antennaType: 'omnidirectional' | 'directional' | 'phased_array';
  
  /** Antenna orientation (for directional antennas, V2) */
  orientation?: Vector3D;
  
  /** Antenna gain in linear units (default 1.0 for omnidirectional) */
  gain?: number;
  
  /** Whether the source is currently active */
  active: boolean;
  
  /** Display color for UI representation (optional, hex string) */
  color?: string;
  
  /** Human-readable label (optional, defaults to "Source N") */
  label?: string;
  
  /** Device type hint for UI (e.g., "Wi-Fi Router", "Cell Tower", "Bluetooth") */
  deviceType?: string;
}

/** Parameters for creating a new source (id generated automatically) */
export type CreateSourceParams = Omit<RFSource, 'id'>;

/** Parameters for updating an existing source (all fields optional) */
export type UpdateSourceParams = Partial<Omit<RFSource, 'id'>>;

/** Default values for a new RF source */
export const DEFAULT_RF_SOURCE: Omit<RFSource, 'id'> = {
  position: { x: 0, y: 1.5, z: 0 }, // 1.5m height (typical device height)
  frequency: 2.4e9, // 2.4 GHz (Wi-Fi)
  power: 0.1,       // 100 mW
  powerUnit: 'watts',
  phase: 0,
  antennaType: 'omnidirectional',
  gain: 1.0,
  active: true,
};

/** Validation limits for source parameters */
export const SOURCE_LIMITS = {
  frequency: { min: 1e6, max: 100e9 }, // 1 MHz to 100 GHz
  power: {
    watts: { min: 0.001, max: 100 },   // 1 mW to 100 W
    dBm: { min: -30, max: 50 },        // -30 dBm to 50 dBm
  },
  phase: { min: 0, max: 2 * Math.PI },
  maxSources: {
    v1: 5,  // CPU-based limit
    v2: 50, // GPU-based limit
  },
} as const;

/** Common RF frequencies for quick selection */
export const COMMON_FREQUENCIES = {
  'Wi-Fi 2.4 GHz': 2.4e9,
  'Wi-Fi 5 GHz': 5.0e9,
  'Wi-Fi 6E': 6.0e9,
  'Bluetooth': 2.4e9,
  'LTE 700 MHz': 700e6,
  'LTE 1800 MHz': 1800e6,
  '5G 3.5 GHz': 3.5e9,
  '5G mmWave 28 GHz': 28e9,
} as const;
