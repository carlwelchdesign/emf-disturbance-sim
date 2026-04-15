import { RunOrchestrator } from '../../../app/lab/modules/maxwell/core/run-orchestrator';
import { SubmitSimulationRunRequest } from '../../../app/lab/types/maxwell.types';

const makeRequest = (id: string): SubmitSimulationRunRequest => ({
  configurationId: `cfg-${id}`,
  methodFamily: 'fdtd',
  domain: {
    extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
    discretizationIntent: 'auto',
    gridResolution: { dx: 0.1, dy: 0.1, dz: 0.1 },
    coordinateSystem: 'cartesian',
  },
  materials: [{ id: 'm1', permittivity: 1, permeability: 1, conductivity: 0, lossModel: 'none', isPhysical: true }],
  boundaryConditions: [{ id: 'bc-1', type: 'pec', surfaceSelector: 'all', parameters: {} }],
  runControls: { timeWindow: 1e-10, timeStepHint: 0, samplingPlan: { spatialDecimation: 1, temporalDecimation: 1 } },
  requestedMetrics: [],
  scenarioClass: 'coarse',
});

describe('Queue Capacity and Deterministic Status (PF-003)', () => {
  it('accepts up to 10 concurrent queued/running runs', () => {
    const orch = new RunOrchestrator(10);
    const runIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const resp = orch.submitRun(makeRequest(`r${i}`), []);
      expect(resp.accepted).toBe(true);
      runIds.push(resp.runId);
    }
    const stats = orch.getQueueStats();
    expect(stats.queued).toBe(10);
  });

  it('rejects the 11th run when queue is full at capacity 10', () => {
    const orch = new RunOrchestrator(10);
    for (let i = 0; i < 10; i++) {
      orch.submitRun(makeRequest(`r${i}`), []);
    }
    const extra = orch.submitRun(makeRequest('overflow'), []);
    expect(extra.accepted).toBe(false);
    expect(extra.errors?.[0]?.code).toBe('QUEUE_FULL');
  });

  it('frees a queue slot when a run completes', () => {
    const orch = new RunOrchestrator(2);
    const r1 = orch.submitRun(makeRequest('a'), []);
    const r2 = orch.submitRun(makeRequest('b'), []);
    expect(r2.accepted).toBe(true);

    // Start and complete r1
    orch.startRun(r1.runId);
    orch.completeRun(r1.runId);

    // Now r3 can be submitted
    const r3 = orch.submitRun(makeRequest('c'), []);
    expect(r3.accepted).toBe(true);
  });

  it('reports deterministic run status for each run', () => {
    const orch = new RunOrchestrator(10);
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const resp = orch.submitRun(makeRequest(`d${i}`), []);
      ids.push(resp.runId);
    }

    // Start all
    ids.forEach((id) => orch.startRun(id));

    // Complete odd indices
    ids.filter((_, i) => i % 2 === 0).forEach((id) => orch.completeRun(id));

    // Running should still show running
    const runningRuns = ids.filter((_, i) => i % 2 !== 0).map((id) => orch.getRun(id));
    runningRuns.forEach((r) => expect(r?.status).toBe('running'));

    const completedRuns = ids.filter((_, i) => i % 2 === 0).map((id) => orch.getRun(id));
    completedRuns.forEach((r) => expect(r?.status).toBe('completed_unvalidated'));
  });

  it('getQueueStats returns accurate counts', () => {
    const orch = new RunOrchestrator(10);
    const r1 = orch.submitRun(makeRequest('q1'), []);
    orch.submitRun(makeRequest('q2'), []);
    orch.startRun(r1.runId);
    orch.completeRun(r1.runId);
    orch.validateRun(r1.runId);

    const stats = orch.getQueueStats();
    expect(stats.queued).toBe(1); // r2 still queued
    expect(stats.completed).toBe(1); // r1 validated
  });
});
