/**
 * Global configuration for how fields are rendered and displayed
 */
export interface VisualizationSettings {
  /** Number of field particles to emit per source */
  fieldLineDensity: number;
  
  /** Color scheme for field strength mapping */
  colorScheme: ColorScheme;
  
  /** Animation speed multiplier (1.0 = real-time; default lab baseline is 2.0x) */
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

  /** Field fidelity profile used to balance clarity and scientific detail */
  solverProfile: SolverProfile;

  /** Interference point-cloud encoding profile */
  interferenceProfile: SolverProfile;

  /** Global UI theme mode */
  themeMode: ThemeMode;

  /** Show the live threat metrics overlay (E-field by faction, threat dominance) */
  showThreatMetrics: boolean;

  /** Show the emitter interaction panel (coupling, resonance, conflict score) */
  showEmitterInteractions: boolean;

  /** Show the E-field samples chart along the X axis */
  showFieldChart: boolean;

  /** Show drone patrol flight paths in the 3D view */
  showFlightPaths: boolean;

  /** User-visible degraded-state signal for non-Maxwell animation workload */
  performanceSignal: {
    active: boolean;
    message: string;
  };
}

/** Color scheme options for field visualization */
export type ColorScheme = 'thermal' | 'rainbow' | 'monochrome';

/** Level of detail for adaptive performance */
export type LODLevel = 'high' | 'medium' | 'low';

/** Global theme mode */
export type ThemeMode = 'dark' | 'light';

/** Field fidelity profile */
export type SolverProfile = 'simplified' | 'balanced' | 'scientific';

/** Default visualization settings */
export const DEFAULT_VISUALIZATION: VisualizationSettings = {
  fieldLineDensity: 50,
  colorScheme: 'thermal',
  animationSpeed: 2.0,
  animateFields: true,
  showFPS: false,
  showLabels: true,
  showGrid: true,
  lod: 'low',
  solverProfile: 'balanced',
  interferenceProfile: 'balanced',
  themeMode: 'dark',
  showThreatMetrics: true,
  showEmitterInteractions: true,
  showFieldChart: true,
  showFlightPaths: true,
  performanceSignal: {
    active: false,
    message: 'Performance stable',
  },
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
