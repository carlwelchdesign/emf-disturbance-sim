import { render, screen, act } from '@testing-library/react';
import LabPage from '../../app/lab/page';
import { useLabStore } from '../../app/lab/hooks/useLabStore';

jest.mock('../../app/lab/hooks/useFPSMonitor', () => ({ useFPSMonitor: () => {} }));

describe('source management integration', () => {
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
      selectionContext: {
        mode: 'single',
        selectedSourceIds: ['source-1'],
        primarySourceId: 'source-1',
      },
    });
  });

  it('removes a source from the scene and list', () => {
    const { rerender } = render(<LabPage />);

    act(() => {
      useLabStore.getState().removeSource('source-2');
    });

    rerender(<LabPage />);
    expect(screen.queryByText('Beta')).toBeNull();
    expect(screen.getByText(/Active Entities/i)).toBeInTheDocument();
  });
});
