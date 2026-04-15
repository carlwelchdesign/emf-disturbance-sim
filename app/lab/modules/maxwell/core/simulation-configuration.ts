/**
 * Simulation Configuration Schema and Guards
 * Validates user-provided simulation configurations before run submission.
 *
 * ARCHITECTURE: Pure logic module — no imports from components/, hooks/, modules/
 */
import {
  SimulationConfiguration,
  DomainDefinition,
  MaterialRegion,
  BoundaryConditionDefinition,
  RunControls,
  MethodFamily,
  RunErrorRecord,
} from '../../../types/maxwell.types';
import { SAFE_ZONE_DEFAULTS } from './maxwell-constants';

export { SAFE_ZONE_DEFAULTS };

export const MIN_GRID_POINTS = 2;
export const MAX_GRID_POINTS_HARD = 200 * 200 * 200; // absolute cap
export const MIN_TIME_STEP = 1e-18; // 1 attosecond
export const MAX_TIME_WINDOW = 1e-6; // 1 microsecond for browser runs

/**
 * Compute total grid points from domain definition.
 */
export function computeGridPoints(domain: DomainDefinition): { nx: number; ny: number; nz: number } {
  const { extent, gridResolution } = domain;
  const lx = extent.max.x - extent.min.x;
  const ly = extent.max.y - extent.min.y;
  const lz = extent.max.z - extent.min.z;
  const nx = Math.max(MIN_GRID_POINTS, Math.round(lx / gridResolution.dx));
  const ny = Math.max(MIN_GRID_POINTS, Math.round(ly / gridResolution.dy));
  const nz = Math.max(MIN_GRID_POINTS, Math.round(lz / gridResolution.dz));
  return { nx, ny, nz };
}

/**
 * Validate domain definition — returns array of error messages.
 */
export function validateDomain(domain: DomainDefinition): string[] {
  const errors: string[] = [];
  const { extent, gridResolution } = domain;

  if (extent.max.x <= extent.min.x) errors.push('Domain extent X must be positive (max.x > min.x).');
  if (extent.max.y <= extent.min.y) errors.push('Domain extent Y must be positive (max.y > min.y).');
  if (extent.max.z <= extent.min.z) errors.push('Domain extent Z must be positive (max.z > min.z).');
  if (gridResolution.dx <= 0) errors.push('Grid resolution dx must be positive.');
  if (gridResolution.dy <= 0) errors.push('Grid resolution dy must be positive.');
  if (gridResolution.dz <= 0) errors.push('Grid resolution dz must be positive.');

  return errors;
}

/**
 * Validate material regions — returns array of error messages.
 */
export function validateMaterials(materials: MaterialRegion[]): string[] {
  const errors: string[] = [];
  if (materials.length === 0) errors.push('At least one material region must be defined.');
  for (const m of materials) {
    if (m.permittivity <= 0) errors.push(`Material '${m.id}': permittivity must be > 0 (got ${m.permittivity}).`);
    if (m.permeability <= 0) errors.push(`Material '${m.id}': permeability must be > 0 (got ${m.permeability}).`);
    if (m.conductivity < 0) errors.push(`Material '${m.id}': conductivity must be >= 0 (got ${m.conductivity}).`);
    if (!isFinite(m.permittivity) || !isFinite(m.permeability) || !isFinite(m.conductivity)) {
      errors.push(`Material '${m.id}': all EM properties must be finite numbers.`);
    }
  }
  return errors;
}

/**
 * Validate boundary conditions — returns array of error messages.
 */
export function validateBoundaryConditions(bcs: BoundaryConditionDefinition[]): string[] {
  const errors: string[] = [];
  if (bcs.length === 0) errors.push('At least one boundary condition must be defined.');
  for (const bc of bcs) {
    if (!bc.type) errors.push(`Boundary condition '${bc.id}': type must be specified.`);
  }
  return errors;
}

/**
 * Validate run controls — returns array of error messages.
 */
export function validateRunControls(controls: RunControls): string[] {
  const errors: string[] = [];
  if (controls.timeWindow <= 0) errors.push('Time window must be positive.');
  if (controls.timeWindow > MAX_TIME_WINDOW) {
    errors.push(`Time window ${controls.timeWindow.toExponential(2)} s exceeds maximum ${MAX_TIME_WINDOW.toExponential(2)} s for browser runs.`);
  }
  if (controls.timeStepHint < 0) errors.push('Time step hint must be >= 0 (0 = auto-CFL).');
  if (controls.samplingPlan.spatialDecimation < 1) errors.push('Spatial decimation must be >= 1.');
  if (controls.samplingPlan.temporalDecimation < 1) errors.push('Temporal decimation must be >= 1.');
  return errors;
}

/**
 * Validate method family — only 'fdtd' is production-ready.
 */
export function validateMethodFamily(family: MethodFamily): string[] {
  if (family === 'fdtd') return [];
  return [`Method family '${family}' is not yet production-ready. Use 'fdtd'.`];
}

/**
 * Full configuration validation — returns all errors across all sub-validators.
 */
export function validateSimulationConfiguration(config: SimulationConfiguration): RunErrorRecord[] {
  const errors: RunErrorRecord[] = [];

  const allMessages = [
    ...validateMethodFamily(config.methodFamily),
    ...validateDomain(config.domain),
    ...validateMaterials(config.materials),
    ...validateBoundaryConditions(config.boundaryConditions),
    ...validateRunControls(config.runControls),
  ];

  for (const msg of allMessages) {
    errors.push({
      runId: config.id,
      category: 'configuration',
      code: 'CONFIG_VALIDATION_ERROR',
      message: msg,
      recommendedActions: ['Review the flagged configuration field and correct the value before resubmitting.'],
      blocking: true,
    });
  }

  return errors;
}

/**
 * Type guard to check if an object looks like a valid SimulationConfiguration.
 */
export function isSimulationConfiguration(obj: unknown): obj is SimulationConfiguration {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.methodFamily === 'string' &&
    c.domain !== undefined &&
    Array.isArray(c.materials) &&
    Array.isArray(c.boundaryConditions) &&
    c.runControls !== undefined
  );
}
