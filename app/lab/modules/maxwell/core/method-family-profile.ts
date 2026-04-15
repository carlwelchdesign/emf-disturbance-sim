/**
 * Method Family Profile — defines solver method families and their capabilities.
 * Part of the Maxwell solver feature.
 *
 * ARCHITECTURE: This module has NO imports from components/, hooks/, or modules/
 * It is a pure data/logic module.
 */
import {
  MethodFamily,
  MethodFamilyProfile,
  SimulationConfiguration,
} from '../../../types/maxwell.types';
import { C_LIGHT, CFL_SAFETY_FACTOR } from './maxwell-constants';

/**
 * Compute FDTD CFL-stable time step for given grid resolution.
 * dt <= 1 / (c * sqrt(1/dx^2 + 1/dy^2 + 1/dz^2))
 */
export function computeCFLTimeStep(dx: number, dy: number, dz: number): number {
  const invDt = C_LIGHT * Math.sqrt(1 / (dx * dx) + 1 / (dy * dy) + 1 / (dz * dz));
  return CFL_SAFETY_FACTOR / invDt;
}

/**
 * Check whether a simulation configuration satisfies the CFL stability condition.
 */
export function checkCFLStability(config: SimulationConfiguration): boolean {
  const { gridResolution, discretizationIntent } = config.domain;
  if (discretizationIntent === 'auto') return true; // auto mode computes CFL internally
  const dtMax = computeCFLTimeStep(
    gridResolution.dx,
    gridResolution.dy,
    gridResolution.dz,
  );
  return config.runControls.timeStepHint <= dtMax || config.runControls.timeStepHint === 0;
}

/**
 * FDTD Method Family Profile — the initial production solver.
 */
export const FDTD_PROFILE: MethodFamilyProfile = {
  id: 'fdtd-v1',
  family: 'fdtd',
  status: 'production',
  supportedDimensions: [1, 2, 3],
  stabilityRules: [
    {
      name: 'cfl-condition',
      description: 'Time step must satisfy the Courant-Friedrichs-Lewy stability condition for the FDTD Yee grid.',
      check: checkCFLStability,
    },
    {
      name: 'positive-permittivity',
      description: 'All material regions must have positive relative permittivity (ε_r > 0).',
      check: (config) => config.materials.every((m) => m.permittivity > 0),
    },
    {
      name: 'positive-permeability',
      description: 'All material regions must have positive relative permeability (μ_r > 0).',
      check: (config) => config.materials.every((m) => m.permeability > 0),
    },
    {
      name: 'non-negative-conductivity',
      description: 'All material regions must have non-negative conductivity (σ >= 0).',
      check: (config) => config.materials.every((m) => m.conductivity >= 0),
    },
  ],
  validationRequirements: [
    'plane-wave-propagation',
    'energy-conservation',
    'boundary-reflection',
  ],
};

/**
 * FEM profile (planned, not production).
 */
export const FEM_PROFILE: MethodFamilyProfile = {
  id: 'fem-v1',
  family: 'fem',
  status: 'planned',
  supportedDimensions: [2, 3],
  stabilityRules: [],
  validationRequirements: [],
};

/**
 * DGTD profile (planned, not production).
 */
export const DGTD_PROFILE: MethodFamilyProfile = {
  id: 'dgtd-v1',
  family: 'dgtd',
  status: 'planned',
  supportedDimensions: [2, 3],
  stabilityRules: [],
  validationRequirements: [],
};

const ALL_PROFILES: MethodFamilyProfile[] = [FDTD_PROFILE, FEM_PROFILE, DGTD_PROFILE];

export function getMethodFamilyProfile(family: MethodFamily): MethodFamilyProfile | undefined {
  return ALL_PROFILES.find((p) => p.family === family);
}

export function isMethodFamilyProduction(family: MethodFamily): boolean {
  const profile = getMethodFamilyProfile(family);
  return profile?.status === 'production';
}

export function getProductionMethodFamilies(): MethodFamilyProfile[] {
  return ALL_PROFILES.filter((p) => p.status === 'production');
}
