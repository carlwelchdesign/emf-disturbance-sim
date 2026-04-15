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
import { SIDEBAR_SECTION_DEFAULT_EXPANDED } from '../lib/sidebar-layout';

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
  selectionContext: {
    mode: 'single',
    selectedSourceIds: ['default-source'],
    primarySourceId: 'default-source',
  },
  sectionDisclosure: { ...SIDEBAR_SECTION_DEFAULT_EXPANDED },
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
      selectionContext: {
        mode: 'single',
        selectedSourceIds: [id],
        primarySourceId: id,
      },
      scenarioIsDirty: true,
    }));

    return id;
  },

  removeSource: (id) => {
    set((state) => {
      const nextSources = state.sources.filter((s) => s.id !== id);
      const nextSelectedIds = state.selectionContext.selectedSourceIds.filter((sourceId) => sourceId !== id);
      const nextPrimary = state.selectionContext.primarySourceId === id ? nextSelectedIds[0] ?? null : state.selectionContext.primarySourceId;
      const mode = nextSelectedIds.length === 0 ? 'none' : nextSelectedIds.length === 1 ? 'single' : 'multi';

      return {
        sources: nextSources,
        selectedSourceId: state.selectedSourceId === id ? nextPrimary : state.selectedSourceId,
        selectionContext: {
          mode,
          selectedSourceIds: nextSelectedIds,
          primarySourceId: nextPrimary,
        },
        scenarioIsDirty: true,
      };
    });
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
    set({
      selectedSourceId: id,
      selectionContext: {
        mode: id ? 'single' : 'none',
        selectedSourceIds: id ? [id] : [],
        primarySourceId: id,
      },
    });
  },

  toggleSourceSelection: (id) => {
    set((state) => {
      const exists = state.selectionContext.selectedSourceIds.includes(id);
      const selectedSourceIds = exists
        ? state.selectionContext.selectedSourceIds.filter((selectedId) => selectedId !== id)
        : [...state.selectionContext.selectedSourceIds, id];

      const primarySourceId = selectedSourceIds.length === 0
        ? null
        : state.selectionContext.primarySourceId && selectedSourceIds.includes(state.selectionContext.primarySourceId)
        ? state.selectionContext.primarySourceId
        : selectedSourceIds[0];

      return {
        selectedSourceId: primarySourceId,
        selectionContext: {
          mode: selectedSourceIds.length === 0 ? 'none' : selectedSourceIds.length === 1 ? 'single' : 'multi',
          selectedSourceIds,
          primarySourceId,
        },
      };
    });
  },

  clearSelection: () => {
    set({
      selectedSourceId: null,
      selectionContext: {
        mode: 'none',
        selectedSourceIds: [],
        primarySourceId: null,
      },
    });
  },

  setPrimarySelection: (id) => {
    set((state) => {
      if (!id || !state.selectionContext.selectedSourceIds.includes(id)) {
        return state;
      }

      return {
        selectedSourceId: id,
        selectionContext: {
          ...state.selectionContext,
          primarySourceId: id,
          mode: state.selectionContext.selectedSourceIds.length > 1 ? 'multi' : 'single',
        },
      };
    });
  },

  setSectionExpanded: (sectionId, expanded) => {
    set((state) => ({
      sectionDisclosure: {
        ...state.sectionDisclosure,
        [sectionId]: expanded,
      },
    }));
  },

  toggleSectionExpanded: (sectionId) => {
    set((state) => ({
      sectionDisclosure: {
        ...state.sectionDisclosure,
        [sectionId]: !state.sectionDisclosure[sectionId],
      },
    }));
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
      selectionContext: {
        mode: 'none',
        selectedSourceIds: [],
        primarySourceId: null,
      },
      sectionDisclosure: { ...SIDEBAR_SECTION_DEFAULT_EXPANDED },
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
      selectionContext: {
        mode: sources.length === 0 ? 'none' : 'single',
        selectedSourceIds: sources[0] ? [sources[0].id] : [],
        primarySourceId: sources[0]?.id ?? null,
      },
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
    if (params.themeMode !== undefined && !['dark', 'light'].includes(params.themeMode)) {
      return;
    }

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
    const { sources, selectionContext } = get();
    const selectedId = selectionContext.primarySourceId;
    return sources.find((s) => s.id === selectedId);
  },

  getSelectedSources: () => {
    const { sources, selectionContext } = get();
    const selectedIds = new Set(selectionContext.selectedSourceIds);
    return sources.filter((source) => selectedIds.has(source.id));
  },

  getSelectionContext: () => {
    return get().selectionContext;
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
