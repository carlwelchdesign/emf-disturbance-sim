import { RunOrchestrator } from '../../../app/lab/modules/maxwell/core/run-orchestrator';
import { SubmitSimulationRunRequest, SimulationRunStatus } from '../../../app/lab/types/maxwell.types';

const mockRequest: SubmitSimulationRunRequest = {
  configurationId: 'cfg-1',
  methodFamily: 'fdtd',
  domain: {
    extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
    discretizationIntent: 'auto',
    gridResolution: { dx: 0.1, dy: 0.1, dz: 0.1 },
    coordinateSystem: 'cartesian',
  },
  materials: [{ id: 'mat-1', permittivity: 1, permeability: 1, conductivity: 0, lossModel: 'none', isPhysical: true }],
  boundaryConditions: [{ id: 'bc-1', type: 'pec', surfaceSelector: 'all', parameters: {} }],
  runControls: { timeWindow: 1e-9, timeStepHint: 0, samplingPlan: { spatialDecimation: 1, temporalDecimation: 1 } },
  requestedMetrics: ['poynting_magnitude', 'energy_density'],
  scenarioClass: 'coarse',
};

describe('RunOrchestrator contract', () => {
  let orchestrator: RunOrchestrator;

  beforeEach(() => {
    orchestrator = new RunOrchestrator(10);
  });

  it('accepts valid run request and assigns queued status', () => {
    const response = orchestrator.submitRun(mockRequest, []);
    expect(response.accepted).toBe(true);
    expect(response.initialStatus).toBe('queued');
    expect(response.runId).toBeTruthy();
  });

  it('rejects run with blocking errors', () => {
    const blockingError = {
      runId: 'test',
      category: 'configuration' as const,
      code: 'CONFIG_ERR',
      message: 'bad config',
      recommendedActions: ['fix it'],
      blocking: true,
    };
    const response = orchestrator.submitRun(mockRequest, [blockingError]);
    expect(response.accepted).toBe(false);
    expect(response.initialStatus).toBe('rejected');
    expect(response.errors).toHaveLength(1);
  });

  it('transitions: queued -> running -> completed_unvalidated -> validated', () => {
    const { runId } = orchestrator.submitRun(mockRequest, []);
    expect(orchestrator.getRun(runId)?.status).toBe('queued');
    orchestrator.startRun(runId);
    expect(orchestrator.getRun(runId)?.status).toBe('running');
    orchestrator.completeRun(runId);
    expect(orchestrator.getRun(runId)?.status).toBe('completed_unvalidated');
    orchestrator.validateRun(runId);
    expect(orchestrator.getRun(runId)?.status).toBe('validated');
  });

  it('transitions: running -> unstable', () => {
    const { runId } = orchestrator.submitRun(mockRequest, []);
    orchestrator.startRun(runId);
    orchestrator.markUnstable(runId, 'NaN detected');
    expect(orchestrator.getRun(runId)?.status).toBe('unstable');
  });

  it('transitions: running -> failed', () => {
    const { runId } = orchestrator.submitRun(mockRequest, []);
    orchestrator.startRun(runId);
    orchestrator.failRun(runId, 'OOM');
    expect(orchestrator.getRun(runId)?.status).toBe('failed');
  });

  it('transitions: queued -> cancelled', () => {
    const { runId } = orchestrator.submitRun(mockRequest, []);
    orchestrator.cancelRun(runId);
    expect(orchestrator.getRun(runId)?.status).toBe('cancelled');
  });

  it('transitions: completed_unvalidated -> non_validated', () => {
    const { runId } = orchestrator.submitRun(mockRequest, []);
    orchestrator.startRun(runId);
    orchestrator.completeRun(runId);
    orchestrator.markNonValidated(runId, 'thresholds not met');
    expect(orchestrator.getRun(runId)?.status).toBe('non_validated');
  });

  it('emits status events in order', () => {
    const events: SimulationRunStatus[] = [];
    orchestrator.onStatusChange((e) => events.push(e.status));
    const { runId } = orchestrator.submitRun(mockRequest, []);
    orchestrator.startRun(runId);
    orchestrator.completeRun(runId);
    orchestrator.validateRun(runId);
    expect(events).toEqual(['queued', 'running', 'completed_unvalidated', 'validated']);
  });

  it('rejects run when queue is full', () => {
    const small = new RunOrchestrator(1);
    small.submitRun(mockRequest, []);
    // Queue is full now (1 queued run = capacity)
    const response = small.submitRun(mockRequest, []);
    expect(response.accepted).toBe(false);
    expect(response.errors?.[0]?.code).toBe('QUEUE_FULL');
  });

  it('creates provenance record for every run', () => {
    const { runId } = orchestrator.submitRun(mockRequest, []);
    const prov = orchestrator.getProvenance(runId);
    expect(prov).toBeDefined();
    expect(prov?.runId).toBe(runId);
    expect(prov?.methodFamily).toBe('fdtd');
  });
});
