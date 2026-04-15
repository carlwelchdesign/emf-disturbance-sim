/**
 * User-Facing Error Mapping with Recommended Actions
 * Maps RunErrorRecord categories/codes to user-friendly messages and corrective actions.
 */
import { RunErrorRecord, ErrorCategory } from '../../../types/maxwell.types';

export interface UserFacingError {
  title: string;
  description: string;
  recommendedActions: string[];
  severity: 'error' | 'warning' | 'info';
  blocking: boolean;
}

const CATEGORY_TITLES: Record<ErrorCategory, string> = {
  configuration: 'Configuration Error',
  stability: 'Numerical Stability Issue',
  resource: 'Resource Constraint',
  validation: 'Validation Failure',
  system: 'System Error',
};

const CODE_MESSAGES: Record<string, { title: string; description: string; actions: string[] }> = {
  'CFL_VIOLATION': {
    title: 'CFL Stability Condition Violated',
    description: 'The specified time step exceeds the maximum stable value for the Courant-Friedrichs-Lewy (CFL) condition. Using this time step will cause the solver to diverge.',
    actions: [
      'Set timeStepHint to 0 to use automatic CFL-stable time step calculation.',
      'Increase grid spacing (dx, dy, dz) to allow a larger stable time step.',
      'Reduce the time window to limit total simulation time.',
    ],
  },
  'CONFIG_VALIDATION_ERROR': {
    title: 'Invalid Simulation Configuration',
    description: 'One or more configuration parameters are invalid or outside the allowed range.',
    actions: [
      'Review the error details below and correct the flagged parameters.',
      'Ensure all material properties are physically valid (ε_r > 0, μ_r > 0, σ ≥ 0).',
      'Verify domain extent and grid resolution produce a valid mesh.',
    ],
  },
  'QUEUE_FULL': {
    title: 'Run Queue Full',
    description: 'The maximum number of concurrent runs has been reached.',
    actions: [
      'Wait for an existing run to complete before submitting a new one.',
      'Cancel a queued run if you need to prioritize this configuration.',
    ],
  },
  'INSTABILITY_DETECTED': {
    title: 'Numerical Instability Detected',
    description: 'The solver detected non-finite or diverging field values. Results from this run are not reliable.',
    actions: [
      'Reduce the time step (use auto-CFL mode for guaranteed stability).',
      'Check material properties — non-physical values can cause instability.',
      'Reduce grid resolution to allow a larger stable time step.',
      'Verify boundary conditions are compatible with the problem geometry.',
    ],
  },
  'MEMORY_BUDGET_EXCEEDED': {
    title: 'Memory Budget Exceeded',
    description: 'The estimated memory usage for this simulation exceeds the browser safe limit of 512 MB.',
    actions: [
      'Reduce grid dimensions (use coarser resolution).',
      'Use a shorter time window.',
      'Choose a coarser scenario class to apply more conservative safe-zone defaults.',
    ],
  },
  'SAFE_ZONE_EXCEEDED': {
    title: 'Safe Zone Defaults Exceeded',
    description: 'The grid size or time-step count exceeds the safe-zone defaults for the selected scenario class.',
    actions: [
      'Reduce grid dimensions to within the safe zone for your scenario class.',
      'Select a coarser scenario class if you need larger domains.',
    ],
  },
  'RUN_CAP_EXCEEDED': {
    title: 'Active Run Cap Reached',
    description: 'The maximum number of simultaneously loaded full-resolution results has been reached (cap: 3).',
    actions: [
      'Deactivate one of the currently loaded runs before loading this result.',
      'Use summary-only mode for runs you are not actively inspecting.',
    ],
  },
  'EXECUTION_ERROR': {
    title: 'Solver Execution Error',
    description: 'An unexpected error occurred during solver execution.',
    actions: [
      'Retry the simulation. If the error persists, check system resources.',
      'Try a smaller domain or shorter time window.',
    ],
  },
};

/**
 * Map a RunErrorRecord to a user-facing error description.
 */
export function mapErrorToUserFacing(error: RunErrorRecord): UserFacingError {
  const codeInfo = CODE_MESSAGES[error.code];
  const categoryTitle = CATEGORY_TITLES[error.category] ?? 'Error';

  return {
    title: codeInfo?.title ?? categoryTitle,
    description: codeInfo?.description ?? error.message,
    recommendedActions: error.recommendedActions.length > 0
      ? error.recommendedActions
      : (codeInfo?.actions ?? ['Review the error and retry.']),
    severity: error.blocking ? 'error' : 'warning',
    blocking: error.blocking,
  };
}

/**
 * Map a list of RunErrorRecords to grouped user-facing errors by category.
 */
export function groupErrorsByCategory(errors: RunErrorRecord[]): Record<ErrorCategory, UserFacingError[]> {
  const grouped: Partial<Record<ErrorCategory, UserFacingError[]>> = {};
  for (const err of errors) {
    if (!grouped[err.category]) grouped[err.category] = [];
    grouped[err.category]!.push(mapErrorToUserFacing(err));
  }
  return grouped as Record<ErrorCategory, UserFacingError[]>;
}

/**
 * Get a summary string for multiple errors.
 */
export function getErrorSummary(errors: RunErrorRecord[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} errors: ${errors.slice(0, 2).map((e) => e.message).join('; ')}${errors.length > 2 ? ' (and more)' : ''}`;
}
