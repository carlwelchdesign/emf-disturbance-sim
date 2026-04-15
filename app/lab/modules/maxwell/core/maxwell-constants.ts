/**
 * Maxwell solver constants — shared across all core modules.
 * ARCHITECTURE: This file has no imports from app code.
 */
import { ScenarioClass, SafeZoneDefaults } from '../../../types/maxwell.types';

/** Speed of light in vacuum [m/s] */
export const C_LIGHT = 2.998e8;

/** Magnetic permeability of vacuum [H/m] */
export const MU_0 = 4 * Math.PI * 1e-7;

/** Electric permittivity of vacuum [F/m] */
export const EPSILON_0 = 8.854e-12;

/** CFL safety factor for FDTD (Courant number < 1/sqrt(3) ≈ 0.577) */
export const CFL_SAFETY_FACTOR = 0.5;

/** Browser memory budget per run [bytes] (512 MB) */
export const MEMORY_BUDGET_BYTES = 512 * 1024 * 1024;

/** Memory pressure threshold for auto-degrade (80% of budget) */
export const DEGRADE_THRESHOLD = 0.8;

/** Maximum concurrent full-resolution result sets in browser */
export const MAX_ACTIVE_RUNS = 3;

/** Bytes per field component (Float64) */
export const BYTES_PER_FIELD_COMPONENT = 8;

/** Number of E+B field components per cell */
export const FIELD_COMPONENTS_PER_CELL = 6;

/** Safe-zone defaults per scenario class */
export const SAFE_ZONE_DEFAULTS: Record<ScenarioClass, SafeZoneDefaults> = {
  baseline: { maxGridPoints: 200 * 200 * 200, maxTimeSteps: 10000 },
  medium: { maxGridPoints: 100 * 100 * 100, maxTimeSteps: 5000 },
  coarse: { maxGridPoints: 50 * 50 * 50, maxTimeSteps: 1000 },
};
