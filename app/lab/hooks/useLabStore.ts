import { create } from 'zustand';
import {
  RFSource,
  DEFAULT_RF_SOURCE,
  SOURCE_LIMITS,
} from '../types/source.types';
import { DEFAULT_CAMERA } from '../types/camera.types';
import { DEFAULT_VISUALIZATION } from '../types/visualization.types';
import { DEFAULT_ENVIRONMENT } from '../types/environment.types';
import { MeasurementPoint } from '../types/measurement.types';
import { DroneState, CreateDroneParams } from '../types/drone.types';
import { LabStoreState } from '../types/store.types';
import { sanitizeSource } from '../lib/validation';
import { createSourceIdGenerator } from '../lib/source-helpers';
import { isSameCameraState } from '../lib/camera-helpers';
import { getSourceColor } from '../lib/visualization-helpers';
import { buildScenarioSources, getScenarioPreset } from '../modules/scenario/presets';

const sourceIdGenerator = createSourceIdGenerator('source');
let measurementIdCounter = 1;

/**
 * Zustand store for the EMF/RF Lab
 */
export const useLabStore = create<LabStoreState>((set, get) => ({
  // === Initial State ===
  sources: [
    {
      id: 'default-source',
      ...DEFAULT_RF_SOURCE,
      label: 'Wi-Fi Router',
      deviceType: 'Wi-Fi Router',
      color: getSourceColor(0),
    },
  ],
  selectedSourceId: 'default-source',
  activeScenarioPresetId: null,
  scenarioIsDirty: false,
  camera: DEFAULT_CAMERA,
  settings: DEFAULT_VISUALIZATION,
  environment: DEFAULT_ENVIRONMENT,
  measurements: [],
  performance: {
    currentFPS: 60,
    averageFPS: 60,
    isLowPerformance: false,
  },
  drones: [],
  activeFactionMetrics: null,

  // === Source Actions ===
  addSource: (params = {}) => {
    const id = sourceIdGenerator.nextId();
    const sourceCount = get().sources.length;
    
    // Check source limit
    if (sourceCount >= SOURCE_LIMITS.maxSources.v1) {
      return id;
    }

    // Auto-assign color
    const color = getSourceColor(sourceCount);

    // Create new source with defaults
    const newSource: RFSource = {
      id,
      ...DEFAULT_RF_SOURCE,
      ...params,
      color: params.color || color,
      label: params.label || `Source ${sourceCount + 1}`,
      // Offset position slightly to avoid overlap
      position: params.position || {
        x: DEFAULT_RF_SOURCE.position.x + sourceCount * 2,
        y: DEFAULT_RF_SOURCE.position.y,
        z: DEFAULT_RF_SOURCE.position.z,
      },
    };

    const sanitizedSource = {
      ...newSource,
      ...sanitizeSource(newSource),
    };

    set((state) => ({
      sources: [...state.sources, sanitizedSource],
      selectedSourceId: id,
      scenarioIsDirty: true,
    }));

    return id;
  },

  removeSource: (id) => {
    set((state) => ({
      sources: state.sources.filter((s) => s.id !== id),
      selectedSourceId: state.selectedSourceId === id ? null : state.selectedSourceId,
      scenarioIsDirty: true,
    }));
  },

  updateSource: (id, params) => {
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === id ? { ...source, ...sanitizeSource({ ...source, ...params }) } : source
      ),
      scenarioIsDirty: true,
    }));
  },

  selectSource: (id) => {
    set({ selectedSourceId: id });
  },

  toggleSourceActive: (id) => {
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === id ? { ...source, active: !source.active } : source
      ),
      scenarioIsDirty: true,
    }));
  },

  clearAllSources: () => {
    sourceIdGenerator.reset();
    measurementIdCounter = 1;
    set({
      sources: [],
      selectedSourceId: null,
      activeScenarioPresetId: null,
      scenarioIsDirty: false,
      measurements: [],
      drones: [],
      activeFactionMetrics: null,
    });
  },

  applyScenarioPreset: (presetId) => {
    const preset = getScenarioPreset(presetId);
    if (!preset) {
      return;
    }

    sourceIdGenerator.reset();
    measurementIdCounter = 1;

    const sources = buildScenarioSources(preset, () => sourceIdGenerator.nextId());
    const drones = preset.drones
      ? preset.drones.map((params: CreateDroneParams, i: number) => {
          const id = `drone-preset-${i}`;
          const initialPosition = params.waypoints[0]?.position ?? { x: 0, y: 1, z: 0 };
          return {
            id,
            ...params,
            currentSegment: 0,
            segmentProgress: 0,
            position: { ...initialPosition },
            status: 'nominal' as const,
            fieldAtDrone: null,
          };
        })
      : [];

    set((state) => ({
      sources,
      selectedSourceId: sources[0]?.id ?? null,
      activeScenarioPresetId: preset.id,
      scenarioIsDirty: false,
      camera: { ...DEFAULT_CAMERA, ...(preset.camera ?? {}) },
      environment: { ...DEFAULT_ENVIRONMENT, ...(preset.environment ?? {}) },
      settings: {
        ...DEFAULT_VISUALIZATION,
        ...preset.settings,
        themeMode: state.settings.themeMode,
        showFPS: state.settings.showFPS,
        solverProfile: state.settings.solverProfile,
      },
      measurements: [],
      drones,
      activeFactionMetrics: null,
    }));
  },

  // === Camera Actions ===
  updateCamera: (params) => {
    const currentCamera = get().camera;
    const nextCamera = { ...currentCamera, ...params };

    if (isSameCameraState(currentCamera, nextCamera)) {
      return;
    }

    set({
      camera: nextCamera,
      scenarioIsDirty: true,
    });
  },

  resetCamera: () => {
    const currentCamera = get().camera;

    if (isSameCameraState(currentCamera, DEFAULT_CAMERA)) {
      return;
    }

    set({ camera: DEFAULT_CAMERA, scenarioIsDirty: true });
  },

  // === Settings Actions ===
  updateSettings: (params) => {
    set((state) => ({
      settings: { ...state.settings, ...params },
      scenarioIsDirty: true,
    }));
  },

  setLOD: (lod) => {
    set((state) => ({
      settings: { ...state.settings, lod },
      scenarioIsDirty: true,
    }));
  },

  setSolverProfile: (solverProfile) => {
    set((state) => ({
      settings: { ...state.settings, solverProfile },
      scenarioIsDirty: true,
    }));
  },

  // === Environment Actions ===
  updateEnvironment: (params) => {
    set((state) => ({
      environment: { ...state.environment, ...params },
      scenarioIsDirty: true,
    }));
  },

  // === Measurement Actions ===
  addMeasurement: (params) => {
    const { measurements } = get();
    if (measurements.length >= 5) {
      console.warn('Measurement point limit reached for V1');
      return '';
    }

    const id = `measurement-${measurementIdCounter++}`;
    const newMeasurement: MeasurementPoint = {
      id,
      ...params,
      timestamp: Date.now(),
    };

    set((state) => ({
      measurements: [...state.measurements, newMeasurement],
      scenarioIsDirty: true,
    }));

    return id;
  },

  removeMeasurement: (id) => {
    set((state) => ({
      measurements: state.measurements.filter((m) => m.id !== id),
      scenarioIsDirty: true,
    }));
  },

  clearMeasurements: () => {
    measurementIdCounter = 1;
    set({
      measurements: [],
      scenarioIsDirty: true,
    });
  },

  // === Performance Actions ===
  updatePerformance: (fps) => {
    set((state) => {
      const avgFPS = state.performance.averageFPS * 0.9 + fps * 0.1; // Exponential moving average
      const isLowPerformance = avgFPS < 30;

      return {
        performance: {
          currentFPS: fps,
          averageFPS: avgFPS,
          isLowPerformance,
        },
      };
    });
  },

  // === Drone Actions ===
  addDrone: (params: CreateDroneParams) => {
    const id = `drone-${Date.now()}`;
    const initialPosition = params.waypoints[0]?.position ?? { x: 0, y: 1, z: 0 };
    const newDrone: DroneState = {
      id,
      ...params,
      currentSegment: 0,
      segmentProgress: 0,
      position: { ...initialPosition },
      status: 'nominal',
      fieldAtDrone: null,
    };
    set((state) => ({ drones: [...state.drones, newDrone] }));
    return id;
  },

  removeDrone: (id) => {
    set((state) => ({ drones: state.drones.filter((d) => d.id !== id) }));
  },

  updateDroneState: (id, update) => {
    set((state) => {
      const drones = state.drones.map((d) => (d.id === id ? { ...d, ...update } : d));
      const primary = drones.find((d) => d.faction === 'friendly') ?? drones[0];
      return {
        drones,
        activeFactionMetrics: primary?.fieldAtDrone ?? state.activeFactionMetrics,
      };
    });
  },

  // === Selectors ===
  getSourceById: (id) => {
    return get().sources.find((s) => s.id === id);
  },

  getSelectedSource: () => {
    const { sources, selectedSourceId } = get();
    return sources.find((s) => s.id === selectedSourceId);
  },

  getActiveSources: () => {
    return get().sources.filter((s) => s.active);
  },

  getSourceCount: () => {
    return get().sources.length;
  },

  shouldReduceQuality: () => {
    return get().performance.isLowPerformance;
  },
}));
