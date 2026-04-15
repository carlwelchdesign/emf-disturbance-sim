import { RFSource, CreateSourceParams, UpdateSourceParams } from './source.types';
import { CameraState } from './camera.types';
import { VisualizationSettings, LODLevel, SolverProfile } from './visualization.types';
import { Environment } from './environment.types';
import { MeasurementPoint, CreateMeasurementParams } from './measurement.types';
import { DroneState, CreateDroneParams } from './drone.types';
import { FactionMetrics } from './field.types';
import { ScenarioPresetId } from '../modules/scenario/presets';

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  isLowPerformance: boolean;
}

export interface LabStoreState {
  sources: RFSource[];
  selectedSourceId: string | null;
  activeScenarioPresetId: ScenarioPresetId | null;
  scenarioIsDirty: boolean;
  camera: CameraState;
  settings: VisualizationSettings;
  environment: Environment;
  measurements: MeasurementPoint[];
  performance: PerformanceMetrics;
  drones: DroneState[];
  /** Faction metrics at the most-recently-active drone's position (null if no drones) */
  activeFactionMetrics: FactionMetrics | null;
  // === Source Actions ===
  addSource: (params?: Partial<CreateSourceParams>) => string;
  removeSource: (id: string) => void;
  updateSource: (id: string, params: UpdateSourceParams) => void;
  selectSource: (id: string | null) => void;
  toggleSourceActive: (id: string) => void;
  clearAllSources: () => void;
  applyScenarioPreset: (presetId: ScenarioPresetId) => void;
  // === Camera Actions ===
  updateCamera: (params: Partial<CameraState>) => void;
  resetCamera: () => void;
  // === Settings Actions ===
  updateSettings: (params: Partial<VisualizationSettings>) => void;
  setLOD: (lod: LODLevel) => void;
  setSolverProfile: (solverProfile: SolverProfile) => void;
  // === Environment Actions ===
  updateEnvironment: (params: Partial<Environment>) => void;
  // === Measurement Actions ===
  addMeasurement: (params: CreateMeasurementParams) => string;
  removeMeasurement: (id: string) => void;
  clearMeasurements: () => void;
  // === Performance Actions ===
  updatePerformance: (fps: number) => void;
  // === Drone Actions ===
  addDrone: (params: CreateDroneParams) => string;
  removeDrone: (id: string) => void;
  updateDroneState: (
    id: string,
    update: Partial<Pick<DroneState, 'position' | 'currentSegment' | 'segmentProgress' | 'status' | 'fieldAtDrone'>>
  ) => void;
  // === Selectors ===
  getSourceById: (id: string) => RFSource | undefined;
  getSelectedSource: () => RFSource | undefined;
  getActiveSources: () => RFSource[];
  getSourceCount: () => number;
  shouldReduceQuality: () => boolean;
}
