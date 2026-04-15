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
});
