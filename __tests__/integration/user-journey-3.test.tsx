import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabPage from '../../app/lab/page';
import { useLabStore } from '../../app/lab/hooks/useLabStore';
import { DEFAULT_CAMERA, DEFAULT_ENVIRONMENT, DEFAULT_RF_SOURCE, DEFAULT_VISUALIZATION } from '../../app/lab/types';

jest.mock('../../app/lab/hooks/useFPSMonitor', () => ({ useFPSMonitor: () => {} }));

describe('user journey 3', () => {
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

  it('updates visualization settings and restores the default camera view', () => {
    render(<LabPage />);

    fireEvent.click(screen.getByLabelText(/Show FPS/i));
    fireEvent.click(screen.getByLabelText(/Show Grid/i));
    fireEvent.click(screen.getByLabelText(/Show Boundary/i));

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /Color Scheme/i }));
    fireEvent.click(screen.getByRole('option', { name: /Rainbow/i }));

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /LOD/i }));
    fireEvent.click(screen.getByRole('option', { name: /Low/i }));

    act(() => {
      useLabStore.getState().updateCamera({
        position: { x: 12, y: 12, z: 12 },
        target: { x: 0, y: 0, z: 0 },
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset View/i }));

    expect(useLabStore.getState().settings.showFPS).toBe(true);
    expect(useLabStore.getState().settings.showGrid).toBe(false);
    expect(useLabStore.getState().settings.colorScheme).toBe('rainbow');
    expect(useLabStore.getState().settings.lod).toBe('low');
    expect(useLabStore.getState().environment.showBoundary).toBe(false);
    expect(useLabStore.getState().camera).toEqual(DEFAULT_CAMERA);
  });
});
