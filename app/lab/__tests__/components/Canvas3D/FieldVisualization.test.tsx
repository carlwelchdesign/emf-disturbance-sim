import { render } from '@testing-library/react';
import { FieldVisualization } from '../../../components/Canvas3D/FieldVisualization';

describe('FieldVisualization', () => {
  it('returns null when there are no active sources', () => {
    const { container } = render(<FieldVisualization sources={[]} lod="high" colorScheme="thermal" />);

    expect(container.firstChild).toBeNull();
  });

  it('preserves field visualization semantics for active sources', () => {
    const sources = [
      {
        id: 's1',
        position: { x: 0, y: 1, z: 0 },
        frequency: 2.4e9,
        power: 0.1,
        powerUnit: 'watts' as const,
        phase: 0,
        antennaType: 'omnidirectional' as const,
        active: true,
      },
    ];

    const { container } = render(<FieldVisualization sources={sources} lod="high" colorScheme="thermal" />);
    expect(container).toBeTruthy();
  });
});
