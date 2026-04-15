/**
 * FDTD Validation Scenarios — at least 12 reference scenarios (SC-001).
 * 
 * These represent analytical/known reference cases for correctness validation.
 * Each scenario defines thresholds that field outputs must meet to pass validation.
 */
import { ValidationScenario } from '../../../types/maxwell.types';

export const VALIDATION_SCENARIOS: ValidationScenario[] = [
  {
    scenarioId: 'zero_field_zero_source',
    name: 'Zero Field: No Source',
    referenceType: 'analytical',
    expectedBehavior: 'With no source, all field components should remain zero throughout the simulation.',
    thresholds: { fieldAmplitudeRelError: 1e-10, phaseErrorDegrees: 0, energyFlowRelError: 1e-10 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'plane_wave_propagation_x',
    name: 'Plane Wave Propagation Along X',
    referenceType: 'analytical',
    expectedBehavior: 'A plane wave launched in vacuum should propagate at c without dispersion; amplitude decays by 1/r.',
    thresholds: { fieldAmplitudeRelError: 0.1, phaseErrorDegrees: 10, energyFlowRelError: 0.1 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'plane_wave_propagation_z',
    name: 'Plane Wave Propagation Along Z',
    referenceType: 'analytical',
    expectedBehavior: 'Plane wave propagation along Z axis in vacuum — validates z-direction discretization.',
    thresholds: { fieldAmplitudeRelError: 0.1, phaseErrorDegrees: 10, energyFlowRelError: 0.1 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'pec_cavity_resonance',
    name: 'PEC Cavity Resonance',
    referenceType: 'analytical',
    expectedBehavior: 'Resonant modes in a rectangular PEC cavity should match analytical eigenfrequencies within tolerance.',
    thresholds: { fieldAmplitudeRelError: 0.05, phaseErrorDegrees: 5, energyFlowRelError: 0.05 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'energy_conservation_vacuum',
    name: 'Energy Conservation in Vacuum',
    referenceType: 'analytical',
    expectedBehavior: 'Total electromagnetic energy should be conserved (non-increasing) in a lossless PEC cavity.',
    thresholds: { fieldAmplitudeRelError: 0.05, phaseErrorDegrees: 5, energyFlowRelError: 0.02 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'gaussian_pulse_decay',
    name: 'Gaussian Pulse Free-Space Decay',
    referenceType: 'analytical',
    expectedBehavior: 'A Gaussian pulse in free space should decay and spread without spurious reflections.',
    thresholds: { fieldAmplitudeRelError: 0.15, phaseErrorDegrees: 15, energyFlowRelError: 0.15 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'dielectric_interface_reflection',
    name: 'Dielectric Interface Reflection',
    referenceType: 'analytical',
    expectedBehavior: 'Wave reflection at a planar dielectric interface should satisfy Fresnel equations.',
    thresholds: { fieldAmplitudeRelError: 0.1, phaseErrorDegrees: 10, energyFlowRelError: 0.1 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'poynting_vector_sign_check',
    name: 'Poynting Vector Direction Check',
    referenceType: 'analytical',
    expectedBehavior: 'Poynting vector should point in the wave propagation direction for a forward-traveling plane wave.',
    thresholds: { fieldAmplitudeRelError: 0.2, phaseErrorDegrees: 20, energyFlowRelError: 0.1 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'lossy_material_attenuation',
    name: 'Lossy Material Field Attenuation',
    referenceType: 'analytical',
    expectedBehavior: 'In a lossy material, field amplitude should decay exponentially with penetration depth.',
    thresholds: { fieldAmplitudeRelError: 0.2, phaseErrorDegrees: 20, energyFlowRelError: 0.2 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'cfl_stability_boundary',
    name: 'CFL Stability at Safe Margin',
    referenceType: 'numerical',
    expectedBehavior: 'Simulation with dt = 0.5 * dt_CFL should remain stable throughout; fields should stay finite.',
    thresholds: { fieldAmplitudeRelError: 0.5, phaseErrorDegrees: 45, energyFlowRelError: 0.5 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'pec_boundary_reflection',
    name: 'PEC Boundary Perfect Reflection',
    referenceType: 'analytical',
    expectedBehavior: 'A PEC boundary should produce perfect reflection; no energy transmitted through the boundary.',
    thresholds: { fieldAmplitudeRelError: 0.05, phaseErrorDegrees: 5, energyFlowRelError: 0.05 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'field_superposition',
    name: 'Field Superposition Linearity',
    referenceType: 'analytical',
    expectedBehavior: 'Field from two simultaneous sources should equal the superposition of individual fields (linearity).',
    thresholds: { fieldAmplitudeRelError: 0.1, phaseErrorDegrees: 10, energyFlowRelError: 0.1 },
    applicableMethods: ['fdtd'],
  },
  {
    scenarioId: 'time_reversal_symmetry',
    name: 'Time Reversal Symmetry',
    referenceType: 'numerical',
    expectedBehavior: 'In lossless media, time-reversed field should return to initial conditions (within numerical tolerance).',
    thresholds: { fieldAmplitudeRelError: 0.2, phaseErrorDegrees: 20, energyFlowRelError: 0.2 },
    applicableMethods: ['fdtd'],
  },
];
