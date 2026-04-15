/**
 * Run Error and Provenance Models
 * Standardized error and provenance record creation for Maxwell runs.
 */
import {
  RunErrorRecord,
  RunProvenanceRecord,
  SimulationRunStatus,
  MethodFamily,
  ErrorCategory,
} from '../../../types/maxwell.types';
import { createHash } from './hash-utils';

/** Create a run error record with required fields */
export function createRunError(
  runId: string,
  category: ErrorCategory,
  code: string,
  message: string,
  recommendedActions: string[],
  blocking = true,
): RunErrorRecord {
  return { runId, category, code, message, recommendedActions, blocking };
}

/** Create a configuration error (blocking) */
export function configError(runId: string, code: string, message: string, actions: string[]): RunErrorRecord {
  return createRunError(runId, 'configuration', code, message, actions, true);
}

/** Create a stability error (blocking) */
export function stabilityError(runId: string, code: string, message: string, actions: string[]): RunErrorRecord {
  return createRunError(runId, 'stability', code, message, actions, true);
}

/** Create a resource error (blocking) */
export function resourceError(runId: string, code: string, message: string, actions: string[]): RunErrorRecord {
  return createRunError(runId, 'resource', code, message, actions, true);
}

/** Create a system error (non-blocking by default) */
export function systemError(runId: string, code: string, message: string, actions: string[]): RunErrorRecord {
  return createRunError(runId, 'system', code, message, actions, false);
}

/** Create initial provenance record for a run */
export function createProvenanceRecord(
  runId: string,
  configSnapshot: unknown,
  methodFamily: MethodFamily,
  methodVersion: string,
  validationScenarioId?: string,
): RunProvenanceRecord {
  const inputSnapshotHash = createHash(JSON.stringify(configSnapshot));
  return {
    runId,
    inputSnapshotHash,
    methodFamily,
    methodVersion,
    validationScenarioId,
    outcomeStatus: 'queued',
    createdAt: new Date().toISOString(),
  };
}

/** Update provenance record outcome status */
export function finalizeProvenance(
  record: RunProvenanceRecord,
  outcomeStatus: SimulationRunStatus,
): RunProvenanceRecord {
  return { ...record, outcomeStatus };
}
