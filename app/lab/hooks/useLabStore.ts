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
import {
  evaluateSmoothnessWindow as evaluateSmoothnessWindowHelper,
  getSourceColor,
} from '../lib/visualization-helpers';
import { buildScenarioSources, getScenarioPreset } from '../modules/scenario/presets';
import { SIDEBAR_SECTION_DEFAULT_EXPANDED } from '../lib/sidebar-layout';
import { globalOrchestrator } from '../modules/maxwell/core/run-orchestrator';
import { validateRunRequest } from '../modules/maxwell/core/pre-run-validator';
import { FDTDAdapter } from '../modules/maxwell/methods/fdtd/fdtd-adapter';
import { ValidationPipeline } from '../modules/maxwell/core/validation-pipeline';
import { SimulationConfiguration } from '../types/maxwell.types';
import {
  AnimationFrameSample,
  InputResponseSample,
  PerformanceDegradationSignal,
  SmoothnessTelemetryState,
} from '../types/store.types';

const sourceIdGenerator = createSourceIdGenerator('source');
let measurementIdCounter = 1;
const MAX_TELEMETRY_SAMPLES = 600;

const DEFAULT_DEGRADATION_SIGNAL: PerformanceDegradationSignal = {
  active: false,
  triggerCategory: 'frame-overload',
  userMessage: 'Performance stable',
  recoveryState: 'restored',
};

const DEFAULT_TELEMETRY_STATE: SmoothnessTelemetryState = {
  frameSamples: [],
  inputSamples: [],
  degradationSignal: DEFAULT_DEGRADATION_SIGNAL,
  latestEvaluation: null,
};

// Bootstrap the store with the EW Drone Patrol vs Jammer preset
const _ewPreset = getScenarioPreset('ew-drone-patrol')!;
const _initialSources = buildScenarioSources(_ewPreset, () => sourceIdGenerator.nextId());
const _initialDrones = _ewPreset.drones
  ? _ewPreset.drones.map((params: CreateDroneParams, i: number) => {
      const initialPosition = params.waypoints[0]?.position ?? { x: 0, y: 1, z: 0 };
      return {
        id: `drone-preset-${i}`,
        ...params,
        currentSegment: 0,
        segmentProgress: 0,
        position: { ...initialPosition },
        status: 'nominal' as const,
        fieldAtDrone: null,
      };
    })
  : [];

/**
 * Zustand store for the EMF/RF Lab
 */
export const useLabStore = create<LabStoreState>((set, get) => ({
  // === Initial State (EW — Drone Patrol vs Jammer) ===
  sources: _initialSources,
  selectedSourceId: _initialSources[0]?.id ?? null,
  selectionContext: {
    mode: _initialSources[0] ? 'single' : 'none',
    selectedSourceIds: _initialSources[0] ? [_initialSources[0].id] : [],
    primarySourceId: _initialSources[0]?.id ?? null,
  },
  sectionDisclosure: { ...SIDEBAR_SECTION_DEFAULT_EXPANDED },
  activeScenarioPresetId: 'ew-drone-patrol',
  scenarioIsDirty: false,
  camera: { ...DEFAULT_CAMERA, ...(_ewPreset.camera ?? {}) },
  settings: { ...DEFAULT_VISUALIZATION, ...(_ewPreset.settings ?? {}), lod: 'low' },
  environment: { ...DEFAULT_ENVIRONMENT, ...(_ewPreset.environment ?? {}) },
  measurements: [],
  performance: {
    currentFPS: 60,
    averageFPS: 60,
    isLowPerformance: false,
  },
  telemetry: { ...DEFAULT_TELEMETRY_STATE },
  drones: _initialDrones,
  activeFactionMetrics: null,
  // === Maxwell Solver State ===
  maxwellRuns: [],
  maxwellActiveRunId: null,
  maxwellCurrentStep: 0,
  maxwellFieldOutputs: {},
  maxwellDerivedMetrics: {},
  maxwellValidationReports: {},
  maxwellErrors: {},
  maxwellInterferenceRenderStates: {},
  maxwellInterpretationSnapshots: {},

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
        lod: state.settings.lod,
        themeMode: state.settings.themeMode,
        showFPS: state.settings.showFPS,
        solverProfile: state.settings.solverProfile,
        interferenceProfile: state.settings.interferenceProfile,
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

  recordAnimationFrameSample: (sample: AnimationFrameSample) => {
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        frameSamples: [...state.telemetry.frameSamples.slice(-(MAX_TELEMETRY_SAMPLES - 1)), sample],
      },
    }));
  },

  recordInputResponseSample: (sample: InputResponseSample) => {
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        inputSamples: [...state.telemetry.inputSamples.slice(-(MAX_TELEMETRY_SAMPLES - 1)), sample],
      },
    }));
  },

  setPerformanceDegradation: (signal: PerformanceDegradationSignal) => {
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        degradationSignal: signal,
      },
      settings: {
        ...state.settings,
        performanceSignal: {
          active: signal.active,
          message: signal.userMessage,
        },
      },
    }));
  },

  evaluateSmoothnessWindow: (windowMs = 5000) => {
    const state = get();
    const evaluation = evaluateSmoothnessWindowHelper(
      state.telemetry.frameSamples,
      state.telemetry.inputSamples,
      Date.now(),
      windowMs
    );

    set((prevState) => ({
      telemetry: {
        ...prevState.telemetry,
        latestEvaluation: evaluation,
      },
    }));

    return evaluation;
  },

  clearTelemetry: () => {
    set((state) => ({
      telemetry: { ...DEFAULT_TELEMETRY_STATE },
      settings: {
        ...state.settings,
        performanceSignal: {
          active: false,
          message: 'Performance stable',
        },
      },
    }));
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

  // === Maxwell Solver Actions ===
  submitMaxwellRun: (request) => {
    const validationErrors = validateRunRequest(request);
    const response = globalOrchestrator.submitRun(request, validationErrors);
    if (response.accepted) {
      const run = globalOrchestrator.getRun(response.runId);
      if (run) {
        set((state) => ({
          maxwellRuns: [...state.maxwellRuns, run],
          maxwellActiveRunId: response.runId,
          maxwellCurrentStep: 0,
        }));
      }

      // Kick off async execution — defer one tick so the UI renders "queued" first
      const runId = response.runId;
      setTimeout(() => {
        // Transition to running
        globalOrchestrator.startRun(runId);
        set((state) => ({
          maxwellRuns: state.maxwellRuns.map((r) =>
            r.runId === runId ? { ...r, status: 'running', startedAt: new Date().toISOString() } : r
          ),
        }));

        // Build a SimulationConfiguration from the request
        const config: SimulationConfiguration = {
          id: request.configurationId,
          name: `Run ${runId.slice(-8)}`,
          methodFamily: request.methodFamily,
          domain: request.domain,
          materials: request.materials,
          boundaryConditions: request.boundaryConditions,
          runControls: request.runControls,
          scenarioClass: request.scenarioClass,
          createdAt: new Date().toISOString(),
        };

        // Execute FDTD solver
        const adapter = new FDTDAdapter(runId);
        let result: ReturnType<FDTDAdapter['execute']>;
        try {
          result = adapter.execute(config);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          globalOrchestrator.failRun(runId, msg);
          set((state) => ({
            maxwellRuns: state.maxwellRuns.map((r) =>
              r.runId === runId ? { ...r, status: 'failed', statusReason: msg } : r
            ),
          }));
          return;
        }

        // Check for instability errors from the solver
        const instabilityErr = result.errors.find((e) => e.code === 'INSTABILITY_DETECTED');
        if (instabilityErr) {
          globalOrchestrator.markUnstable(runId, instabilityErr.message);
          set((state) => ({
            maxwellRuns: state.maxwellRuns.map((r) =>
              r.runId === runId ? { ...r, status: 'unstable', statusReason: instabilityErr.message } : r
            ),
            maxwellErrors: { ...state.maxwellErrors, [runId]: result.errors },
          }));
          return;
        }

        // Store outputs
        set((state) => ({
          maxwellFieldOutputs: { ...state.maxwellFieldOutputs, [runId]: result.fieldOutput },
          maxwellDerivedMetrics: { ...state.maxwellDerivedMetrics, [runId]: result.derivedMetrics },
        }));

        // Mark completed
        globalOrchestrator.completeRun(runId);
        set((state) => ({
          maxwellRuns: state.maxwellRuns.map((r) =>
            r.runId === runId
              ? { ...r, status: 'completed_unvalidated', endedAt: new Date().toISOString(), runtimeMs: result.runtimeMs }
              : r
          ),
        }));

        // Run validation if a scenario was requested
        if (request.validationScenarioId) {
          const pipeline = new ValidationPipeline();
          const report = pipeline.evaluate(runId, request.validationScenarioId, result.fieldOutput, result.derivedMetrics);
          set((state) => ({
            maxwellValidationReports: { ...state.maxwellValidationReports, [runId]: report },
          }));
          if (report.aggregateStatus === 'pass') {
            globalOrchestrator.validateRun(runId);
            set((state) => ({
              maxwellRuns: state.maxwellRuns.map((r) =>
                r.runId === runId ? { ...r, status: 'validated' } : r
              ),
            }));
          } else {
            const reason = report.reviewNotes ?? 'Validation thresholds not met';
            globalOrchestrator.markNonValidated(runId, reason);
            set((state) => ({
              maxwellRuns: state.maxwellRuns.map((r) =>
                r.runId === runId ? { ...r, status: 'non_validated', statusReason: reason } : r
              ),
            }));
          }
        } else {
          // No scenario — leave as completed_unvalidated, that's correct
        }
      }, 0);
    }
    return response;
  },

  setActiveMaxwellRun: (runId) => set({ maxwellActiveRunId: runId, maxwellCurrentStep: 0 }),

  setMaxwellCurrentStep: (step) => set({ maxwellCurrentStep: step }),

  updateMaxwellRunStatus: (runId, status, reason) => {
    set((state) => ({
      maxwellRuns: state.maxwellRuns.map((r) =>
        r.runId === runId ? { ...r, status, statusReason: reason } : r
      ),
    }));
  },

  setMaxwellFieldOutput: (runId, output) => {
    set((state) => ({
      maxwellFieldOutputs: { ...state.maxwellFieldOutputs, [runId]: output },
    }));
  },

  setMaxwellDerivedMetrics: (runId, metrics) => {
    set((state) => ({
      maxwellDerivedMetrics: { ...state.maxwellDerivedMetrics, [runId]: metrics },
    }));
  },

  setMaxwellValidationReport: (runId, report) => {
    set((state) => ({
      maxwellValidationReports: { ...state.maxwellValidationReports, [runId]: report },
    }));
  },

  setMaxwellErrors: (runId, errors) => {
    set((state) => ({
      maxwellErrors: { ...state.maxwellErrors, [runId]: errors },
    }));
  },

  setMaxwellInterferenceRenderState: (runId, renderState) => {
    set((state) => ({
      maxwellInterferenceRenderStates: { ...state.maxwellInterferenceRenderStates, [runId]: renderState },
    }));
  },

  setMaxwellInterpretationSnapshot: (runId, snapshot) => {
    set((state) => ({
      maxwellInterpretationSnapshots: { ...state.maxwellInterpretationSnapshots, [runId]: snapshot },
    }));
  },

  getMaxwellRun: (runId) => {
    return get().maxwellRuns.find((r) => r.runId === runId);
  },

  getActiveMaxwellFieldOutput: () => {
    const { maxwellActiveRunId, maxwellFieldOutputs } = get();
    return maxwellActiveRunId ? maxwellFieldOutputs[maxwellActiveRunId] : undefined;
  },

  getActiveMaxwellMetrics: () => {
    const { maxwellActiveRunId, maxwellDerivedMetrics } = get();
    return maxwellActiveRunId ? maxwellDerivedMetrics[maxwellActiveRunId] : undefined;
  },

  getActiveMaxwellValidationReport: () => {
    const { maxwellActiveRunId, maxwellValidationReports } = get();
    return maxwellActiveRunId ? maxwellValidationReports[maxwellActiveRunId] : undefined;
  },

  getActiveMaxwellInterferenceRenderState: () => {
    const { maxwellActiveRunId, maxwellInterferenceRenderStates } = get();
    return maxwellActiveRunId ? maxwellInterferenceRenderStates[maxwellActiveRunId] : undefined;
  },

  getActiveMaxwellInterpretationSnapshot: () => {
    const { maxwellActiveRunId, maxwellInterpretationSnapshots } = get();
    return maxwellActiveRunId ? maxwellInterpretationSnapshots[maxwellActiveRunId] : undefined;
  },

  clearMaxwellRun: (runId) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [runId]: _fo, ...fieldOutputs } = state.maxwellFieldOutputs;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [runId]: _dm, ...derivedMetrics } = state.maxwellDerivedMetrics;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [runId]: _vr, ...validationReports } = state.maxwellValidationReports;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [runId]: _er, ...errors } = state.maxwellErrors;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [runId]: _irs, ...interferenceRenderStates } = state.maxwellInterferenceRenderStates;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [runId]: _is, ...interpretationSnapshots } = state.maxwellInterpretationSnapshots;
      return {
        maxwellRuns: state.maxwellRuns.filter((r) => r.runId !== runId),
        maxwellActiveRunId: state.maxwellActiveRunId === runId ? null : state.maxwellActiveRunId,
        maxwellFieldOutputs: fieldOutputs,
        maxwellDerivedMetrics: derivedMetrics,
        maxwellValidationReports: validationReports,
        maxwellErrors: errors,
        maxwellInterferenceRenderStates: interferenceRenderStates,
        maxwellInterpretationSnapshots: interpretationSnapshots,
      };
    });
  },
}));
