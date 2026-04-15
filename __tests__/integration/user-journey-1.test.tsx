import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabPage from '../../app/lab/page';
import { useLabStore } from '../../app/lab/hooks/useLabStore';
import { DEFAULT_CAMERA, DEFAULT_ENVIRONMENT, DEFAULT_RF_SOURCE, DEFAULT_VISUALIZATION } from '../../app/lab/types';

jest.mock('../../app/lab/hooks/useFPSMonitor', () => ({ useFPSMonitor: () => {} }));

describe('user journey 1', () => {
  beforeEach(() => {
    useLabStore.setState({
      ...useLabStore.getState(),
      sources: [
        {
          id: 'default-source',
          ...DEFAULT_RF_SOURCE,
          label: 'Wi-Fi Router',
          deviceType: 'Wi-Fi Router',
          color: '#3b82f6',
        },
      ],
      selectedSourceId: 'default-source',
      camera: DEFAULT_CAMERA,
      settings: DEFAULT_VISUALIZATION,
      environment: DEFAULT_ENVIRONMENT,
      measurements: [],
    });
  });

  it('loads the lab, updates a source, adds a measurement, and resets the camera', () => {
    render(<LabPage />);

    expect(screen.getAllByText('Wi-Fi Router')[0]).toBeInTheDocument();

    act(() => {
      useLabStore.getState().updateSource('default-source', { frequency: 5e9 });
      useLabStore.getState().updateCamera({
        position: { x: 8, y: 8, z: 8 },
        target: { x: 1, y: 1, z: 1 },
      });
    });

    expect(screen.getByText(/Frequency: 5\.00 GHz/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add Measurement Point/i }));
    expect(useLabStore.getState().measurements).toHaveLength(1);
    expect(screen.getByText('Measurement')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset View/i }));
    expect(useLabStore.getState().camera).toEqual(DEFAULT_CAMERA);
  });
});
