import { createCPUBackend } from '../../app/lab/modules/compute/cpu-backend';
import { RFSource } from '../../app/lab/types/source.types';

describe('multi-source performance', () => {
  it('keeps field calculations under frame budget for five sources', () => {
    const backend = createCPUBackend();
    const sources: RFSource[] = Array.from({ length: 5 }, (_, index) => ({
      id: `source-${index}`,
      position: { x: index, y: 0, z: 0 },
      frequency: 2.4e9,
      power: 0.1,
      powerUnit: 'watts',
      phase: 0,
      antennaType: 'omnidirectional',
      gain: 1,
      active: true,
    }));

    const start = performance.now();
    for (let i = 0; i < 60; i += 1) {
      backend.calculateFieldAtPoint({ x: 1, y: 0, z: 0 }, sources, 0);
    }
    const elapsed = performance.now() - start;

    expect(elapsed / 60).toBeLessThan(33);
  });

  it('maintains frame-smoothness threshold for normal source counts', () => {
    const backend = createCPUBackend();
    const sources: RFSource[] = Array.from({ length: 4 }, (_, index) => ({
      id: `source-smooth-${index}`,
      position: { x: index * 0.8, y: 0, z: index * 0.3 },
      frequency: 2.4e9,
      power: 0.1,
      powerUnit: 'watts',
      phase: 0,
      antennaType: 'omnidirectional',
      gain: 1,
      active: true,
    }));

    const samples: number[] = [];
    for (let frame = 0; frame < 40; frame += 1) {
      const start = performance.now();
      backend.calculateFieldAtPoint({ x: 0.5, y: 0.2, z: 0.1 }, sources, frame * 0.016);
      samples.push(performance.now() - start);
    }

    const smoothFrames = samples.filter((duration) => duration <= 33).length;
    expect((smoothFrames / samples.length) * 100).toBeGreaterThanOrEqual(95);
  });

  it('recovers quickly after temporary compute spikes', () => {
    const backend = createCPUBackend();
    const sources: RFSource[] = Array.from({ length: 6 }, (_, index) => ({
      id: `source-spike-${index}`,
      position: { x: index, y: 0, z: 0 },
      frequency: 2.4e9,
      power: 0.1,
      powerUnit: 'watts',
      phase: 0,
      antennaType: 'omnidirectional',
      gain: 1,
      active: true,
    }));

    // Simulate short spike
    for (let i = 0; i < 20; i += 1) {
      backend.calculateFieldAtPoint({ x: 1, y: 0, z: 0 }, sources, i * 0.016);
    }

    const recoverySamples: number[] = [];
    for (let i = 0; i < 20; i += 1) {
      const start = performance.now();
      backend.calculateFieldAtPoint({ x: 1, y: 0, z: 0 }, sources.slice(0, 3), i * 0.016);
      recoverySamples.push(performance.now() - start);
    }

    const recovered = recoverySamples.filter((duration) => duration <= 33).length;
    expect((recovered / recoverySamples.length) * 100).toBeGreaterThanOrEqual(95);
  });
});
