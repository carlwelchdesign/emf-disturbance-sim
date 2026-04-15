import { RFSource, CreateSourceParams, UpdateSourceParams } from './source.types';
import { CameraState } from './camera.types';
import { VisualizationSettings, LODLevel, SolverProfile } from './visualization.types';
import { Environment } from './environment.types';
import { MeasurementPoint, CreateMeasurementParams } from './measurement.types';
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
  addSource: (params?: Partial<CreateSourceParams>) => string;
  removeSource: (id: string) => void;
  updateSource: (id: string, params: UpdateSourceParams) => void;
  selectSource: (id: string | null) => void;
  toggleSourceActive: (id: string) => void;
  clearAllSources: () => void;
  applyScenarioPreset: (presetId: ScenarioPresetId) => void;
  updateCamera: (params: Partial<CameraState>) => void;
  resetCamera: () => void;
  updateSettings: (params: Partial<VisualizationSettings>) => void;
  setLOD: (lod: LODLevel) => void;
  setSolverProfile: (solverProfile: SolverProfile) => void;
  updateEnvironment: (params: Partial<Environment>) => void;
  addMeasurement: (params: CreateMeasurementParams) => string;
  removeMeasurement: (id: string) => void;
  clearMeasurements: () => void;
  updatePerformance: (fps: number) => void;
  getSourceById: (id: string) => RFSource | undefined;
  getSelectedSource: () => RFSource | undefined;
  getActiveSources: () => RFSource[];
  getSourceCount: () => number;
  shouldReduceQuality: () => boolean;
}
