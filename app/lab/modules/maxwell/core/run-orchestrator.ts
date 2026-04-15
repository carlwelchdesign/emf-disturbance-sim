/**
 * Run Queue / Orchestration State Container
 * Manages the lifecycle of Maxwell simulation runs.
 */
import {
  SimulationRun,
  SimulationRunStatus,
  SimulationRunStatusEvent,
  SubmitSimulationRunRequest,
  SubmitSimulationRunResponse,
  RunErrorRecord,
  RunProvenanceRecord,
} from '../../../types/maxwell.types';
import { createProvenanceRecord, finalizeProvenance } from './run-records';

let runCounter = 0;

/** Generate a unique run ID */
function generateRunId(): string {
  return `maxwell-run-${Date.now()}-${++runCounter}`;
}

export type RunStatusListener = (event: SimulationRunStatusEvent) => void;

/**
 * RunOrchestrator — manages the queue, lifecycle transitions, and provenance for solver runs.
 */
export class RunOrchestrator {
  private runs: Map<string, SimulationRun> = new Map();
  private provenance: Map<string, RunProvenanceRecord> = new Map();
  private listeners: RunStatusListener[] = [];
  private maxQueueSize: number;

  constructor(maxQueueSize = 10) {
    this.maxQueueSize = maxQueueSize;
  }

  /** Subscribe to run status events */
  onStatusChange(listener: RunStatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(runId: string, status: SimulationRunStatus, message?: string, reasonCode?: string): void {
    const run = this.runs.get(runId);
    const event: SimulationRunStatusEvent = {
      runId,
      status,
      timestamp: new Date().toISOString(),
      reasonCode,
      message,
      queuePosition: run?.queuePosition,
    };
    this.listeners.forEach((l) => l(event));
  }

  /** Submit a new run request — returns accept/reject response */
  submitRun(
    request: SubmitSimulationRunRequest,
    preValidationErrors: RunErrorRecord[],
  ): SubmitSimulationRunResponse {
    const runId = generateRunId();

    // Check queue capacity
    const queuedRuns = Array.from(this.runs.values()).filter(
      (r) => r.status === 'queued' || r.status === 'running',
    );
    if (queuedRuns.length >= this.maxQueueSize) {
      const err: RunErrorRecord = {
        runId,
        category: 'resource',
        code: 'QUEUE_FULL',
        message: `Run queue is full (${this.maxQueueSize} active/queued runs). Wait for a run to complete before submitting.`,
        recommendedActions: ['Wait for an existing run to complete or cancel a queued run.'],
        blocking: true,
      };
      return { runId, accepted: false, initialStatus: 'rejected', errors: [err] };
    }

    // Reject if any blocking pre-validation errors
    const blockingErrors = preValidationErrors.filter((e) => e.blocking);
    if (blockingErrors.length > 0) {
      const rejectedRun: SimulationRun = {
        runId,
        configurationId: request.configurationId,
        status: 'rejected',
        statusReason: blockingErrors.map((e) => e.message).join('; '),
        queuedAt: new Date().toISOString(),
        queuePosition: undefined,
      };
      this.runs.set(runId, rejectedRun);
      this.emit(runId, 'rejected', rejectedRun.statusReason, 'PRE_VALIDATION_FAILED');

      const prov = createProvenanceRecord(runId, request, request.methodFamily, 'fdtd-v1', request.validationScenarioId);
      this.provenance.set(runId, finalizeProvenance(prov, 'rejected'));

      return { runId, accepted: false, initialStatus: 'rejected', errors: blockingErrors };
    }

    // Accept and queue
    const queuePosition = queuedRuns.length + 1;
    const run: SimulationRun = {
      runId,
      configurationId: request.configurationId,
      status: 'queued',
      queuedAt: new Date().toISOString(),
      queuePosition,
    };
    this.runs.set(runId, run);

    const prov = createProvenanceRecord(runId, request, request.methodFamily, 'fdtd-v1', request.validationScenarioId);
    this.provenance.set(runId, prov);

    this.emit(runId, 'queued', `Run queued at position ${queuePosition}`, 'QUEUED');
    return { runId, accepted: true, initialStatus: 'queued' };
  }

  /** Transition run to 'running' */
  startRun(runId: string): void {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'queued') return;
    const updated: SimulationRun = {
      ...run,
      status: 'running',
      startedAt: new Date().toISOString(),
      queuePosition: undefined,
    };
    this.runs.set(runId, updated);
    this.emit(runId, 'running', 'Solver started', 'STARTED');
  }

  /** Mark run as completed (unvalidated) */
  completeRun(runId: string): void {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'running') return;
    const endedAt = new Date().toISOString();
    const runtimeMs = run.startedAt
      ? Date.now() - new Date(run.startedAt).getTime()
      : undefined;
    const updated: SimulationRun = {
      ...run,
      status: 'completed_unvalidated',
      endedAt,
      runtimeMs,
    };
    this.runs.set(runId, updated);
    this.emit(runId, 'completed_unvalidated', 'Numerical execution complete, pending validation.', 'COMPLETED');
  }

  /** Mark run as validated */
  validateRun(runId: string): void {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'completed_unvalidated') return;
    const updated = { ...run, status: 'validated' as SimulationRunStatus };
    this.runs.set(runId, updated);
    this.emit(runId, 'validated', 'Validation thresholds passed.', 'VALIDATED');
    const prov = this.provenance.get(runId);
    if (prov) this.provenance.set(runId, finalizeProvenance(prov, 'validated'));
  }

  /** Mark run as non_validated */
  markNonValidated(runId: string, reason: string): void {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'completed_unvalidated') return;
    const updated: SimulationRun = {
      ...run,
      status: 'non_validated',
      statusReason: reason,
    };
    this.runs.set(runId, updated);
    this.emit(runId, 'non_validated', `Non-validated: ${reason}`, 'NON_VALIDATED');
    const prov = this.provenance.get(runId);
    if (prov) this.provenance.set(runId, finalizeProvenance(prov, 'non_validated'));
  }

  /** Mark run as unstable */
  markUnstable(runId: string, reason: string): void {
    const run = this.runs.get(runId);
    if (!run || (run.status !== 'running' && run.status !== 'completed_unvalidated')) return;
    const updated: SimulationRun = {
      ...run,
      status: 'unstable',
      statusReason: reason,
      endedAt: run.endedAt ?? new Date().toISOString(),
    };
    this.runs.set(runId, updated);
    this.emit(runId, 'unstable', `Unstable: ${reason}`, 'UNSTABLE');
    const prov = this.provenance.get(runId);
    if (prov) this.provenance.set(runId, finalizeProvenance(prov, 'unstable'));
  }

  /** Mark run as failed */
  failRun(runId: string, reason: string): void {
    const run = this.runs.get(runId);
    if (!run) return;
    const updated: SimulationRun = {
      ...run,
      status: 'failed',
      statusReason: reason,
      endedAt: new Date().toISOString(),
    };
    this.runs.set(runId, updated);
    this.emit(runId, 'failed', `Failed: ${reason}`, 'FAILED');
    const prov = this.provenance.get(runId);
    if (prov) this.provenance.set(runId, finalizeProvenance(prov, 'failed'));
  }

  /** Cancel a queued run */
  cancelRun(runId: string): void {
    const run = this.runs.get(runId);
    if (!run || run.status !== 'queued') return;
    const updated = { ...run, status: 'cancelled' as SimulationRunStatus };
    this.runs.set(runId, updated);
    this.emit(runId, 'cancelled', 'Run cancelled.', 'CANCELLED');
    const prov = this.provenance.get(runId);
    if (prov) this.provenance.set(runId, finalizeProvenance(prov, 'cancelled'));
  }

  /** Get a run by ID */
  getRun(runId: string): SimulationRun | undefined {
    return this.runs.get(runId);
  }

  /** Get all runs */
  getAllRuns(): SimulationRun[] {
    return Array.from(this.runs.values());
  }

  /** Get runs with a given status */
  getRunsByStatus(status: SimulationRunStatus): SimulationRun[] {
    return this.getAllRuns().filter((r) => r.status === status);
  }

  /** Get provenance record for a run */
  getProvenance(runId: string): RunProvenanceRecord | undefined {
    return this.provenance.get(runId);
  }

  /** Check if a run is in a terminal non-recoverable state */
  isTerminalFailureState(runId: string): boolean {
    const run = this.runs.get(runId);
    if (!run) return false;
    return ['rejected', 'unstable', 'failed', 'cancelled'].includes(run.status);
  }

  /** Get queue stats */
  getQueueStats(): { queued: number; running: number; completed: number; total: number } {
    const all = this.getAllRuns();
    return {
      queued: all.filter((r) => r.status === 'queued').length,
      running: all.filter((r) => r.status === 'running').length,
      completed: all.filter((r) => ['validated', 'non_validated', 'completed_unvalidated'].includes(r.status)).length,
      total: all.length,
    };
  }
}

/** Singleton orchestrator instance for app use */
export const globalOrchestrator = new RunOrchestrator(10);
