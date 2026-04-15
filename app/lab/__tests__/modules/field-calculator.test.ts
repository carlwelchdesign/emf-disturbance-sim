import { createCPUBackend } from '../../modules/compute/cpu-backend';
import { RFSource } from '../../types/source.types';

describe('FieldCalculator - Multi Source', () => {
  const backend = createCPUBackend();
  const baseSource: RFSource = {
    id: 'source-a',
    position: { x: 0, y: 0, z: 0 },
    frequency: 2.4e9,
    power: 0.1,
    powerUnit: 'watts',
    phase: 0,
    antennaType: 'omnidirectional',
    gain: 1,
    active: true,
  };

  const observationPoint = { x: 1, y: 0, z: 0 };

  it('sums constructive interference from two aligned sources', () => {
    const sources = [baseSource, { ...baseSource, id: 'source-b', position: { x: 0, y: 0, z: 0 } }];
    const single = backend.calculateFieldAtPoint(observationPoint, [baseSource], 0).strength;
    const combined = backend.calculateFieldAtPoint(observationPoint, sources, 0).strength;

    expect(combined).toBeGreaterThan(single);
  });

  it('cancels destructive interference with 180° phase offset', () => {
    const sources = [
      baseSource,
      { ...baseSource, id: 'source-b', phase: Math.PI, position: { x: 0, y: 0, z: 0 } },
    ];

    const result = backend.calculateFieldAtPoint(observationPoint, sources, 0).strength;

    expect(Math.abs(result)).toBeLessThan(0.05);
  });

  it('changes interference pattern when phase shifts', () => {
    const inPhase = backend.calculateFieldAtPoint(observationPoint, [
      baseSource,
      { ...baseSource, id: 'source-b', position: { x: 0, y: 0, z: 0 } },
    ], 0).strength;

    const shifted = backend.calculateFieldAtPoint(observationPoint, [
      baseSource,
      { ...baseSource, id: 'source-b', phase: Math.PI / 2, position: { x: 0, y: 0, z: 0 } },
    ], 0).strength;

    expect(shifted).not.toBeCloseTo(inPhase, 3);
  });

  it('returns electric, magnetic, and poynting vectors from the solver', () => {
    const result = backend.calculateFieldAtPoint(observationPoint, [baseSource], 0);

    expect(result.eField).toBeDefined();
    expect(result.bField).toBeDefined();
    expect(result.poynting).toBeDefined();
    expect(Math.hypot(result.eField?.x ?? 0, result.eField?.y ?? 0, result.eField?.z ?? 0)).toBeGreaterThan(0);
    expect(Math.hypot(result.bField?.x ?? 0, result.bField?.y ?? 0, result.bField?.z ?? 0)).toBeGreaterThan(0);
  });
});
