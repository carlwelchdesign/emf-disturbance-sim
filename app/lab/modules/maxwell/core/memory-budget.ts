/**
 * Memory Budget Estimator and Pre-Run Blocking Gate (BS-001, BS-002)
 * Enforces 512 MB per-run memory budget and safe-zone defaults per scenario class.
 */
import {
  MemoryBudgetEstimate,
  ScenarioClass,
  RunErrorRecord,
} from '../../../types/maxwell.types';
import {
  MEMORY_BUDGET_BYTES,
  SAFE_ZONE_DEFAULTS,
  BYTES_PER_FIELD_COMPONENT,
  FIELD_COMPONENTS_PER_CELL,
} from './maxwell-constants';

export { SAFE_ZONE_DEFAULTS };

/**
 * Estimate memory usage for a simulation run.
 * Formula: Nx × Ny × Nz × Nt × 6 components × 8 bytes/Float64
 */
export function estimateMemory(
  nx: number,
  ny: number,
  nz: number,
  nt: number,
  scenarioClass: ScenarioClass,
): MemoryBudgetEstimate {
  const totalCells = nx * ny * nz;
  const estimatedBytes = totalCells * nt * FIELD_COMPONENTS_PER_CELL * BYTES_PER_FIELD_COMPONENT;
  const safeZoneDefaults = SAFE_ZONE_DEFAULTS[scenarioClass];

  return {
    estimatedBytes,
    budgetBytes: MEMORY_BUDGET_BYTES,
    withinBudget: estimatedBytes <= MEMORY_BUDGET_BYTES,
    scenarioClass,
    safeZoneDefaults,
  };
}

/**
 * Check if grid dimensions exceed safe-zone defaults for the scenario class.
 */
export function checkSafeZone(
  nx: number,
  ny: number,
  nz: number,
  nt: number,
  scenarioClass: ScenarioClass,
): { withinSafeZone: boolean; violatedConstraints: string[] } {
  const safeZone = SAFE_ZONE_DEFAULTS[scenarioClass];
  const totalCells = nx * ny * nz;
  const violated: string[] = [];

  if (totalCells > safeZone.maxGridPoints) {
    violated.push(`Grid size ${totalCells.toLocaleString()} cells exceeds safe zone ${safeZone.maxGridPoints.toLocaleString()} for class '${scenarioClass}'.`);
  }
  if (nt > safeZone.maxTimeSteps) {
    violated.push(`Time steps ${nt.toLocaleString()} exceeds safe zone ${safeZone.maxTimeSteps.toLocaleString()} for class '${scenarioClass}'.`);
  }

  return { withinSafeZone: violated.length === 0, violatedConstraints: violated };
}

/**
 * Pre-run BS-001/BS-002 gate — returns blocking RunErrorRecord[] if budget exceeded.
 */
export function runMemoryBudgetGate(
  runId: string,
  nx: number,
  ny: number,
  nz: number,
  nt: number,
  scenarioClass: ScenarioClass,
): RunErrorRecord[] {
  const errors: RunErrorRecord[] = [];

  // BS-001: Memory budget check
  const estimate = estimateMemory(nx, ny, nz, nt, scenarioClass);
  if (!estimate.withinBudget) {
    const estimatedMB = (estimate.estimatedBytes / (1024 * 1024)).toFixed(1);
    const budgetMB = (estimate.budgetBytes / (1024 * 1024)).toFixed(0);
    errors.push({
      runId,
      category: 'resource',
      code: 'MEMORY_BUDGET_EXCEEDED',
      message: `Estimated memory ${estimatedMB} MB exceeds browser budget of ${budgetMB} MB. (Grid: ${nx}×${ny}×${nz}, Steps: ${nt})`,
      recommendedActions: [
        `Reduce grid dimensions to within safe zone: ${estimate.safeZoneDefaults.maxGridPoints.toLocaleString()} total cells.`,
        `Reduce time steps to within safe zone: ${estimate.safeZoneDefaults.maxTimeSteps.toLocaleString()}.`,
        'Select a coarser scenario class.',
      ],
      blocking: true,
    });
  }

  // BS-002: Safe-zone check
  const safeZoneCheck = checkSafeZone(nx, ny, nz, nt, scenarioClass);
  if (!safeZoneCheck.withinSafeZone) {
    for (const constraint of safeZoneCheck.violatedConstraints) {
      errors.push({
        runId,
        category: 'resource',
        code: 'SAFE_ZONE_EXCEEDED',
        message: constraint,
        recommendedActions: [
          `Use scenario class 'coarse' for smaller runs (max ${SAFE_ZONE_DEFAULTS.coarse.maxGridPoints.toLocaleString()} cells).`,
          `Use scenario class 'medium' for moderate runs (max ${SAFE_ZONE_DEFAULTS.medium.maxGridPoints.toLocaleString()} cells).`,
        ],
        blocking: true,
      });
    }
  }

  return errors;
}
