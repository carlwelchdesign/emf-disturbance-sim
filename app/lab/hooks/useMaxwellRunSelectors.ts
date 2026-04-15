'use client';
/**
 * Selector hooks for Maxwell run outputs and metrics.
 * Provides clean access to Maxwell solver state from UI components.
 */
import { useLabStore } from './useLabStore';
import { FieldOutputSet, DerivedMetricResult, ValidationReport, SimulationRun } from '../types/maxwell.types';

/** Get the field output for the currently active Maxwell run */
export function useActiveFieldOutput(): FieldOutputSet | undefined {
  return useLabStore((state) => {
    const { maxwellActiveRunId, maxwellFieldOutputs } = state;
    return maxwellActiveRunId ? maxwellFieldOutputs[maxwellActiveRunId] : undefined;
  });
}

/** Get derived metrics for the currently active Maxwell run */
export function useActiveMetrics(): DerivedMetricResult[] | undefined {
  return useLabStore((state) => {
    const { maxwellActiveRunId, maxwellDerivedMetrics } = state;
    return maxwellActiveRunId ? maxwellDerivedMetrics[maxwellActiveRunId] : undefined;
  });
}

/** Get validation report for the currently active Maxwell run */
export function useActiveValidationReport(): ValidationReport | undefined {
  return useLabStore((state) => {
    const { maxwellActiveRunId, maxwellValidationReports } = state;
    return maxwellActiveRunId ? maxwellValidationReports[maxwellActiveRunId] : undefined;
  });
}

/** Get all Maxwell runs */
export function useMaxwellRuns(): SimulationRun[] {
  return useLabStore((state) => state.maxwellRuns ?? []);
}

/** Get current active run ID */
export function useActiveRunId(): string | null {
  return useLabStore((state) => state.maxwellActiveRunId ?? null);
}

/** Get errors for a specific run */
export function useMaxwellErrors(runId: string) {
  return useLabStore((state) => state.maxwellErrors[runId] ?? []);
}

/** Get a specific run by ID */
export function useMaxwellRun(runId: string): SimulationRun | undefined {
  return useLabStore((state) => state.maxwellRuns.find((r) => r.runId === runId));
}
