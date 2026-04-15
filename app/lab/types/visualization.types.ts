/**
 * Global configuration for how fields are rendered and displayed
 */
export interface VisualizationSettings {
  /** Number of field particles to emit per source */
  fieldLineDensity: number;
  
  /** Color scheme for field strength mapping */
  colorScheme: ColorScheme;
  
  /** Animation speed multiplier (1.0 = real-time) */
  animationSpeed: number;
  
  /** Whether time-based animation is enabled */
  animateFields: boolean;
  
  /** Whether to show FPS counter */
  showFPS: boolean;
  
  /** Whether to show source labels in 3D view */
  showLabels: boolean;
  
  /** Whether to show coordinate grid/axes */
  showGrid: boolean;
  
  /** Current level of detail (auto-adjusted based on performance) */
  lod: LODLevel;

  /** Global UI theme mode */
  themeMode: ThemeMode;
}

/** Color scheme options for field visualization */
export type ColorScheme = 'thermal' | 'rainbow' | 'monochrome';

/** Level of detail for adaptive performance */
export type LODLevel = 'high' | 'medium' | 'low';

/** Global theme mode */
export type ThemeMode = 'dark' | 'light';

/** Default visualization settings */
export const DEFAULT_VISUALIZATION: VisualizationSettings = {
  fieldLineDensity: 50,
  colorScheme: 'thermal',
  animationSpeed: 1.0,
  animateFields: true,
  showFPS: false,
  showLabels: true,
  showGrid: true,
  lod: 'high',
  themeMode: 'dark',
};

/** LOD configurations for different performance levels */
export interface LODConfig {
  fieldLineDensity: number;
  samplingResolution: number;
  lineSegments: number;
}

export const LOD_CONFIGS: Record<LODLevel, LODConfig> = {
  high: {
    fieldLineDensity: 50,
    samplingResolution: 32,
    lineSegments: 50,
  },
  medium: {
    fieldLineDensity: 30,
    samplingResolution: 24,
    lineSegments: 30,
  },
  low: {
    fieldLineDensity: 20,
    samplingResolution: 16,
    lineSegments: 20,
  },
};

/** Validation limits for visualization settings */
export const VISUALIZATION_LIMITS = {
  fieldLineDensity: { min: 10, max: 100 },
  animationSpeed: { min: 0.5, max: 2.0 },
} as const;
