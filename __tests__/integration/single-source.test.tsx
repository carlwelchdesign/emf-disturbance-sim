import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabPage from '../../app/lab/page';
import { useLabStore } from '../../app/lab/hooks/useLabStore';

jest.mock('../../app/lab/hooks/useFPSMonitor', () => ({ useFPSMonitor: () => {} }));

describe('Single Source Integration', () => {
  beforeEach(() => {
    useLabStore.setState({
      ...useLabStore.getState(),
      sources: [
        {
          id: 'default-source',
          position: { x: 0, y: 1.5, z: 0 },
          frequency: 2.4e9,
          power: 0.1,
          powerUnit: 'watts',
          phase: 0,
          antennaType: 'omnidirectional',
          gain: 1,
          active: true,
          label: 'Wi-Fi Router',
        },
      ],
      selectedSourceId: 'default-source',
      selectionContext: {
        mode: 'single',
        selectedSourceIds: ['default-source'],
        primarySourceId: 'default-source',
      },
    });
  });

  it('renders page with the default source', () => {
    render(<LabPage />);
    expect(screen.getAllByText('Wi-Fi Router').length).toBeGreaterThanOrEqual(1);
  });

  it('updates frequency in the controls', () => {
    const { rerender } = render(<LabPage />);

    act(() => {
      useLabStore.getState().updateSource('default-source', { frequency: 5e9 });
    });

    rerender(<LabPage />);
    expect(screen.getByText(/Frequency: 5.00 GHz/i)).toBeInTheDocument();
  });

  it('updates amplitude in the controls', () => {
    const { rerender } = render(<LabPage />);

    act(() => {
      useLabStore.getState().updateSource('default-source', { power: 0.25 });
    });

    rerender(<LabPage />);
    expect(screen.getByText(/Power: 250 mW/i)).toBeInTheDocument();
  });

  it('keeps performance state accessible', () => {
    useLabStore.getState().updatePerformance(45);
    render(<LabPage />);
    expect(useLabStore.getState().performance.currentFPS).toBe(45);
  });
});
