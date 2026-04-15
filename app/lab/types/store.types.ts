import { RFSource, CreateSourceParams, UpdateSourceParams } from './source.types';
import { CameraState } from './camera.types';
import { VisualizationSettings, LODLevel } from './visualization.types';
import { Environment } from './environment.types';
import { MeasurementPoint, CreateMeasurementParams } from './measurement.types';

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  isLowPerformance: boolean;
}

export interface LabStoreState {
  sources: RFSource[];
  selectedSourceId: string | null;
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
  updateCamera: (params: Partial<CameraState>) => void;
  resetCamera: () => void;
  updateSettings: (params: Partial<VisualizationSettings>) => void;
  setLOD: (lod: LODLevel) => void;
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
