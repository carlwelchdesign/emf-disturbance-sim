// maxwell.types.ts — all types for the Maxwell solver feature

export type MethodFamily = 'fdtd' | 'fem' | 'dgtd';
export type MethodFamilyStatus = 'planned' | 'experimental' | 'production' | 'deprecated';

export type SimulationRunStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'completed_unvalidated'
  | 'validated'
  | 'non_validated'
  | 'unstable'
  | 'failed'
  | 'cancelled'
  | 'rejected';

export type BoundaryConditionType = 'pec' | 'pmc' | 'absorbing' | 'periodic' | 'port';
export type CoordinateSystem = 'cartesian' | 'cylindrical' | 'spherical';
export type LossModel = 'none' | 'electric' | 'magnetic' | 'both';
export type DiscretizationIntent = 'auto' | 'manual';
export type ErrorCategory = 'configuration' | 'stability' | 'resource' | 'validation' | 'system';
export type ValidationReferenceType = 'analytical' | 'numerical' | 'experimental';
export type ValidationAggregateStatus = 'pass' | 'fail';
export type OOMFallbackMode = 'summary_only' | 'disable_time_series' | 'reduce_result_scope';
export type OOMTriggerContext = 'result_loading' | 'time_series_nav' | 'visualization_render';
export type DegradeAction = 'reduceMeshResolution' | 'limitVisualizationLayers' | 'pauseTimeSeriesNav';
export type ScenarioClass = 'baseline' | 'medium' | 'coarse';

export interface Vec3 { x: number; y: number; z: number }

export interface DomainExtent { min: Vec3; max: Vec3 }

export interface GridResolution { dx: number; dy: number; dz: number }

export interface DomainDefinition {
  extent: DomainExtent;
  discretizationIntent: DiscretizationIntent;
  gridResolution: GridResolution;
  coordinateSystem: CoordinateSystem;
}

export interface MaterialRegion {
  id: string;
  geometryRef?: string;
  permittivity: number;   // relative permittivity (ε_r)
  permeability: number;   // relative permeability (μ_r)
  conductivity: number;   // σ [S/m]
  lossModel: LossModel;
  isPhysical: boolean;
}

export interface BoundaryConditionDefinition {
  id: string;
  type: BoundaryConditionType;
  surfaceSelector: string;
  parameters: Record<string, unknown>;
  compatibilityNotes?: string;
}

export interface SamplingPlan {
  spatialDecimation: number;  // 1 = full, 2 = every-other, etc.
  temporalDecimation: number;
  snapshotSteps?: number[];   // specific steps to capture
}

export interface RunControls {
  timeWindow: number;     // total simulation time [s]
  timeStepHint: number;   // dt hint [s]; 0 = auto-CFL
  samplingPlan: SamplingPlan;
}

export interface SimulationConfiguration {
  id: string;
  name: string;
  methodFamily: MethodFamily;
  domain: DomainDefinition;
  materials: MaterialRegion[];
  boundaryConditions: BoundaryConditionDefinition[];
  runControls: RunControls;
  scenarioClass: ScenarioClass;
  createdAt: string; // ISO-8601
}

export interface StabilityRule {
  name: string;
  description: string;
  check: (config: SimulationConfiguration) => boolean;
}

export interface MethodFamilyProfile {
  id: string;
  family: MethodFamily;
  status: MethodFamilyStatus;
  supportedDimensions: (1 | 2 | 3)[];
  stabilityRules: StabilityRule[];
  validationRequirements: string[];
}

export interface SimulationRun {
  runId: string;
  configurationId: string;
  status: SimulationRunStatus;
  statusReason?: string;
  queuedAt?: string;
  startedAt?: string;
  endedAt?: string;
  runtimeMs?: number;
  queuePosition?: number;
}

export interface SimulationRunStatusEvent {
  runId: string;
  status: SimulationRunStatus;
  timestamp: string;
  reasonCode?: string;
  message?: string;
  queuePosition?: number;
}

export interface GridSpec {
  nx: number; ny: number; nz: number;
  dx: number; dy: number; dz: number;
}

export interface FieldTensor {
  step: number;
  time: number;
  // Flat arrays of field components at all grid points [nx*ny*nz]
  ex: Float64Array | number[];
  ey: Float64Array | number[];
  ez: Float64Array | number[];
}

export interface FieldOutputSet {
  runId: string;
  timeAxis: number[];
  electricFieldSeries: FieldTensor[];
  magneticFieldSeries: FieldTensor[];
  samplingMetadata: {
    grid: GridSpec;
    units: string;
    coordinateSystem: string;
  };
  validationStatus: 'validated' | 'non_validated';
}

export interface SnapshotMetric { step: number; time: number; value: number }

export interface DerivedMetricResult {
  runId: string;
  metricName: string;
  definition: string;
  units: string;
  values: number[] | SnapshotMetric[];
  validityScope: string;
  sourceFieldDependencies: ('E' | 'B')[];
}

export interface ValidationCheckResult {
  checkId: string;
  description: string;
  expected: number;
  actual: number;
  tolerance: number;
  passed: boolean;
}

export interface ValidationThresholds {
  fieldAmplitudeRelError: number;   // e.g. 0.05 = 5%
  phaseErrorDegrees: number;         // e.g. 5°
  energyFlowRelError: number;        // e.g. 0.1
}

export interface ValidationScenario {
  scenarioId: string;
  name: string;
  referenceType: ValidationReferenceType;
  expectedBehavior: string;
  thresholds: ValidationThresholds;
  applicableMethods: MethodFamily[];
}

export interface ValidationReport {
  runId: string;
  scenarioId: string;
  checks: ValidationCheckResult[];
  errorMetrics: Record<string, number>;
  aggregateStatus: ValidationAggregateStatus;
  thresholdEvaluation: Record<string, 'pass' | 'fail'>;
  reviewNotes?: string;
}

export interface RunProvenanceRecord {
  runId: string;
  inputSnapshotHash: string;
  methodFamily: MethodFamily;
  methodVersion: string;
  validationScenarioId?: string;
  outcomeStatus: SimulationRunStatus;
  createdAt: string;
}

export interface RunErrorRecord {
  runId: string;
  category: ErrorCategory;
  code: string;
  message: string;
  recommendedActions: string[];
  blocking: boolean;
}

export interface SubmitSimulationRunRequest {
  configurationId: string;
  methodFamily: MethodFamily;
  domain: DomainDefinition;
  materials: MaterialRegion[];
  boundaryConditions: BoundaryConditionDefinition[];
  runControls: RunControls;
  validationScenarioId?: string;
  requestedMetrics: string[];
  scenarioClass: ScenarioClass;
}

export interface SubmitSimulationRunResponse {
  runId: string;
  accepted: boolean;
  initialStatus: 'queued' | 'rejected';
  errors?: RunErrorRecord[];
}

// Browser Safety Types
export interface SafeZoneDefaults {
  maxGridPoints: number;
  maxTimeSteps: number;
}

export interface MemoryBudgetEstimate {
  estimatedBytes: number;
  budgetBytes: number;
  withinBudget: boolean;
  scenarioClass: ScenarioClass;
  safeZoneDefaults: SafeZoneDefaults;
}

export interface DegradeControllerConfig {
  memoryPressureThreshold: number;
  degradeActions: DegradeAction[];
  activeDegradeActions: string[];
  notifyUser: boolean;
}

export interface OOMGuardEvent {
  runId: string;
  triggeredAt: OOMTriggerContext;
  estimatedPeakBytes: number;
  fallbackActivated: boolean;
  fallbackMode: OOMFallbackMode;
  userMessageShown: boolean;
}

export interface RunCapStatus {
  activeFullResolutionRuns: number;
  cap: number;
  capExceeded: boolean;
  blockedRunId?: string;
}

// Performance telemetry
export interface PerformanceTelemetry {
  runId: string;
  queuedAt?: number;      // Date.now() ms
  startedAt?: number;
  completedAt?: number;
  runtimeMs?: number;
  interactionLatencies: number[];   // array of measured interaction response times in ms
}
