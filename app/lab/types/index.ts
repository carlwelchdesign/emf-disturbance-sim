/**
 * Unified type exports for the EMF/RF visualization platform
 */

// Common types
export type { Vector3D, BoundingBox } from './common.types';

// Drone types
export type { DroneState, DroneStatus, Waypoint, CreateDroneParams } from './drone.types';

// Source types
export type {
  RFSource,
  SourceFaction,
  CreateSourceParams,
  UpdateSourceParams,
} from './source.types';

export {
  DEFAULT_RF_SOURCE,
  SOURCE_LIMITS,
  COMMON_FREQUENCIES,
} from './source.types';

// Field types
export type {
  FieldPoint,
  FieldGrid,
  FactionMetrics,
  InterferencePattern,
} from './field.types';

// Camera types
export type { CameraState } from './camera.types';
export { DEFAULT_CAMERA, CAMERA_LIMITS } from './camera.types';

// Visualization types
export type {
  VisualizationSettings,
  ColorScheme,
  LODLevel,
  SolverProfile,
  LODConfig,
} from './visualization.types';

export {
  DEFAULT_VISUALIZATION,
  LOD_CONFIGS,
  VISUALIZATION_LIMITS,
} from './visualization.types';

// Measurement types
export type {
  MeasurementPoint,
  CreateMeasurementParams,
} from './measurement.types';

// Environment types
export type {
  Environment,
  MaterialProperties,
} from './environment.types';

export {
  DEFAULT_ENVIRONMENT,
  MATERIAL_PRESETS,
} from './environment.types';

// Store types
export type {
  PerformanceMetrics,
  LabStoreState,
  InteractionType,
  AnimationFrameSample,
  InputResponseSample,
  PerformanceDegradationSignal,
  SmoothnessWindowEvaluation,
  SmoothnessTelemetryState,
} from './store.types';
