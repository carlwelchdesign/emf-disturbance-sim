import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabPage from '../../app/lab/page';
import { useLabStore } from '../../app/lab/hooks/useLabStore';

jest.mock('../../app/lab/hooks/useFPSMonitor', () => ({ useFPSMonitor: () => {} }));

describe('parameter updates integration', () => {
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
          label: 'Selected',
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

  it('updates only the selected source controls', () => {
    const { rerender } = render(<LabPage />);

    act(() => {
      useLabStore.getState().updateSource('source-1', { frequency: 5e9 });
    });

    rerender(<LabPage />);
    expect(screen.getByText(/Frequency: 5.00 GHz/i)).toBeInTheDocument();
  });
});
