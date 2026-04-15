import { BoundingBox } from './common.types';

/**
 * Environment configuration for the simulation space
 */
export interface Environment {
  /** Bounding box defining the simulation space */
  bounds: BoundingBox;
  
  /** Whether to render the environment boundary */
  showBoundary: boolean;
  
  /** Material properties (simplified in V1, rich in V2) */
  material?: MaterialProperties;
}

/**
 * Material properties for environment modeling (V2)
 */
export interface MaterialProperties {
  /** Relative permittivity (dielectric constant) */
  permittivity: number;
  
  /** Relative permeability */
  permeability: number;
  
  /** Conductivity (S/m) */
  conductivity: number;
  
  /** Material name/type */
  type: string;
}

/** Default environment settings */
export const DEFAULT_ENVIRONMENT: Environment = {
  bounds: {
    min: { x: -10, y: -10, z: -10 },
    max: { x: 10, y: 10, z: 10 },
    size: 20, // 20m × 20m × 20m cube
  },
  showBoundary: true,
};

/** Common material presets (for V2) */
export const MATERIAL_PRESETS: Record<string, MaterialProperties> = {
  'Free Space': {
    permittivity: 1.0,
    permeability: 1.0,
    conductivity: 0,
    type: 'vacuum',
  },
  'Air': {
    permittivity: 1.0006,
    permeability: 1.0,
    conductivity: 0,
    type: 'air',
  },
  'Concrete': {
    permittivity: 4.5,
    permeability: 1.0,
    conductivity: 0.01,
    type: 'concrete',
  },
  'Wood': {
    permittivity: 2.5,
    permeability: 1.0,
    conductivity: 0.001,
    type: 'wood',
  },
} as const;
