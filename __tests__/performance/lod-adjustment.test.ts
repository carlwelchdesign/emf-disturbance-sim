import { createCPUBackend } from '../../app/lab/modules/compute/cpu-backend';
import { RFSource } from '../../app/lab/types/source.types';

describe('LOD adjustment performance', () => {
  it('keeps five-source field calculations fast enough for graceful degradation', () => {
    const backend = createCPUBackend();
    const sources: RFSource[] = Array.from({ length: 10 }, (_, index) => ({
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
    backend.calculateFieldAtPoint({ x: 1, y: 0, z: 0 }, sources, 0);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(33);
  });
});
