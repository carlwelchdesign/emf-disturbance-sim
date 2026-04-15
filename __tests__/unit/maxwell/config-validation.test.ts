import {
  validateSimulationConfiguration,
  validateDomain,
  validateMaterials,
  validateBoundaryConditions,
  validateRunControls,
  computeGridPoints,
} from '../../../app/lab/modules/maxwell/core/simulation-configuration';
import { checkCFLStability, computeCFLTimeStep } from '../../../app/lab/modules/maxwell/core/method-family-profile';
import { SimulationConfiguration } from '../../../app/lab/types/maxwell.types';

const validConfig: SimulationConfiguration = {
  id: 'cfg-test',
  name: 'Test Config',
  methodFamily: 'fdtd',
  scenarioClass: 'coarse',
  domain: {
    extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
    discretizationIntent: 'manual',
    gridResolution: { dx: 0.01, dy: 0.01, dz: 0.01 },
    coordinateSystem: 'cartesian',
  },
  materials: [{ id: 'mat-1', permittivity: 1, permeability: 1, conductivity: 0, lossModel: 'none', isPhysical: true }],
  boundaryConditions: [{ id: 'bc-1', type: 'pec', surfaceSelector: 'all', parameters: {} }],
  runControls: { timeWindow: 1e-10, timeStepHint: 0, samplingPlan: { spatialDecimation: 1, temporalDecimation: 1 } },
  createdAt: new Date().toISOString(),
};

describe('validateDomain', () => {
  it('accepts valid domain', () => {
    expect(validateDomain(validConfig.domain)).toHaveLength(0);
  });
  it('rejects zero-size domain', () => {
    const bad = { ...validConfig.domain, extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 1, z: 1 } } };
    expect(validateDomain(bad).length).toBeGreaterThan(0);
  });
  it('rejects non-positive grid resolution', () => {
    const bad = { ...validConfig.domain, gridResolution: { dx: -0.01, dy: 0.01, dz: 0.01 } };
    expect(validateDomain(bad).length).toBeGreaterThan(0);
  });
});

describe('validateMaterials', () => {
  it('accepts valid materials', () => {
    expect(validateMaterials(validConfig.materials)).toHaveLength(0);
  });
  it('rejects empty materials', () => {
    expect(validateMaterials([])).toHaveLength(1);
  });
  it('rejects negative permittivity', () => {
    const bad = [{ ...validConfig.materials[0], permittivity: -1 }];
    expect(validateMaterials(bad).length).toBeGreaterThan(0);
  });
  it('rejects negative conductivity', () => {
    const bad = [{ ...validConfig.materials[0], conductivity: -1 }];
    expect(validateMaterials(bad).length).toBeGreaterThan(0);
  });
  it('rejects infinite permittivity', () => {
    const bad = [{ ...validConfig.materials[0], permittivity: Infinity }];
    expect(validateMaterials(bad).length).toBeGreaterThan(0);
  });
});

describe('validateBoundaryConditions', () => {
  it('accepts valid BCs', () => {
    expect(validateBoundaryConditions(validConfig.boundaryConditions)).toHaveLength(0);
  });
  it('rejects empty BCs', () => {
    expect(validateBoundaryConditions([])).toHaveLength(1);
  });
});

describe('validateRunControls', () => {
  it('accepts valid run controls', () => {
    expect(validateRunControls(validConfig.runControls)).toHaveLength(0);
  });
  it('rejects zero time window', () => {
    const bad = { ...validConfig.runControls, timeWindow: 0 };
    expect(validateRunControls(bad).length).toBeGreaterThan(0);
  });
  it('rejects negative time step hint', () => {
    const bad = { ...validConfig.runControls, timeStepHint: -1 };
    expect(validateRunControls(bad).length).toBeGreaterThan(0);
  });
});

describe('computeGridPoints', () => {
  it('computes correct grid from extent and resolution', () => {
    const { nx, ny, nz } = computeGridPoints(validConfig.domain);
    expect(nx).toBe(100); // 1m / 0.01m
    expect(ny).toBe(100);
    expect(nz).toBe(100);
  });
});

describe('CFL stability', () => {
  it('computeCFLTimeStep returns positive value', () => {
    const dt = computeCFLTimeStep(0.01, 0.01, 0.01);
    expect(dt).toBeGreaterThan(0);
    expect(isFinite(dt)).toBe(true);
  });
  it('auto-mode passes CFL check', () => {
    const autoConfig = { ...validConfig, domain: { ...validConfig.domain, discretizationIntent: 'auto' as const } };
    expect(checkCFLStability(autoConfig)).toBe(true);
  });
  it('manual mode with zero timeStepHint passes (auto-compute)', () => {
    const cfg = { ...validConfig, runControls: { ...validConfig.runControls, timeStepHint: 0 } };
    expect(checkCFLStability(cfg)).toBe(true);
  });
  it('manual mode with too-large dt fails CFL', () => {
    const cfg = {
      ...validConfig,
      runControls: { ...validConfig.runControls, timeStepHint: 1.0 }, // way too large
    };
    expect(checkCFLStability(cfg)).toBe(false);
  });
});

describe('validateSimulationConfiguration', () => {
  it('returns no errors for valid config', () => {
    expect(validateSimulationConfiguration(validConfig)).toHaveLength(0);
  });
  it('returns errors for invalid config', () => {
    const bad = { ...validConfig, materials: [] };
    expect(validateSimulationConfiguration(bad).length).toBeGreaterThan(0);
  });
  it('all returned errors are RunErrorRecord with blocking=true for config errors', () => {
    const bad = { ...validConfig, materials: [] };
    const errors = validateSimulationConfiguration(bad);
    expect(errors.every((e) => e.blocking)).toBe(true);
    expect(errors.every((e) => e.category === 'configuration')).toBe(true);
  });
});
