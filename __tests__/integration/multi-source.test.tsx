import { render, screen } from '@testing-library/react';
import LabPage from '../../app/lab/page';
import { useLabStore } from '../../app/lab/hooks/useLabStore';

jest.mock('../../app/lab/hooks/useFPSMonitor', () => ({ useFPSMonitor: () => {} }));

describe('multi-source integration', () => {
  beforeEach(() => {
    useLabStore.setState({
      ...useLabStore.getState(),
      sources: [
        {
          id: 'source-1',
          position: { x: 0, y: 0, z: 0 },
          frequency: 2.4e9,
          power: 0.1,
          powerUnit: 'watts',
          phase: 0,
          antennaType: 'omnidirectional',
          gain: 1,
          active: true,
          label: 'Alpha',
        },
        {
          id: 'source-2',
          position: { x: 2, y: 0, z: 0 },
          frequency: 2.4e9,
          power: 0.1,
          powerUnit: 'watts',
          phase: 0,
          antennaType: 'omnidirectional',
          gain: 1,
          active: true,
          label: 'Beta',
        },
      ],
      selectedSourceId: 'source-1',
    });
  });

  it('renders multiple sources in the list and scene', () => {
    const { container } = render(<LabPage />);

    expect(screen.getAllByText('Alpha').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Beta').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll('mesh').length).toBeGreaterThanOrEqual(2);
  });
});
