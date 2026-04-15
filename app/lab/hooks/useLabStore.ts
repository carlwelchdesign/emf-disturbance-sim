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
import { LabStoreState } from '../types/store.types';
import { sanitizeSource } from '../lib/validation';
import { createSourceIdGenerator } from '../lib/source-helpers';
import { getSourceColor } from '../lib/visualization-helpers';

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
  camera: DEFAULT_CAMERA,
  settings: DEFAULT_VISUALIZATION,
  environment: DEFAULT_ENVIRONMENT,
  measurements: [],
  performance: {
    currentFPS: 60,
    averageFPS: 60,
    isLowPerformance: false,
  },

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
    }));

    return id;
  },

  removeSource: (id) => {
    set((state) => ({
      sources: state.sources.filter((s) => s.id !== id),
      selectedSourceId: state.selectedSourceId === id ? null : state.selectedSourceId,
    }));
  },

  updateSource: (id, params) => {
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === id ? { ...source, ...sanitizeSource({ ...source, ...params }) } : source
      ),
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
    }));
  },

  clearAllSources: () => {
    sourceIdGenerator.reset();
    set({
      sources: [],
      selectedSourceId: null,
    });
  },

  // === Camera Actions ===
  updateCamera: (params) => {
    set((state) => ({
      camera: { ...state.camera, ...params },
    }));
  },

  resetCamera: () => {
    set({ camera: DEFAULT_CAMERA });
  },

  // === Settings Actions ===
  updateSettings: (params) => {
    set((state) => ({
      settings: { ...state.settings, ...params },
    }));
  },

  setLOD: (lod) => {
    set((state) => ({
      settings: { ...state.settings, lod },
    }));
  },

  // === Environment Actions ===
  updateEnvironment: (params) => {
    set((state) => ({
      environment: { ...state.environment, ...params },
    }));
  },

  // === Measurement Actions ===
  addMeasurement: (params) => {
    const id = `measurement-${measurementIdCounter++}`;
    const newMeasurement: MeasurementPoint = {
      id,
      ...params,
      timestamp: Date.now(),
    };

    set((state) => ({
      measurements: [...state.measurements, newMeasurement],
    }));

    return id;
  },

  removeMeasurement: (id) => {
    set((state) => ({
      measurements: state.measurements.filter((m) => m.id !== id),
    }));
  },

  clearMeasurements: () => {
    measurementIdCounter = 1;
    set({ measurements: [] });
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
