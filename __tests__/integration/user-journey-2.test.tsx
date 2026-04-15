import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabPage from '../../app/lab/page';
import { useLabStore } from '../../app/lab/hooks/useLabStore';
import { DEFAULT_CAMERA, DEFAULT_ENVIRONMENT, DEFAULT_RF_SOURCE, DEFAULT_VISUALIZATION } from '../../app/lab/types';

jest.mock('../../app/lab/hooks/useFPSMonitor', () => ({ useFPSMonitor: () => {} }));

describe('user journey 2', () => {
  beforeEach(() => {
    useLabStore.setState({
      ...useLabStore.getState(),
      sources: [
        {
          id: 'source-1',
          ...DEFAULT_RF_SOURCE,
          label: 'Alpha',
          deviceType: 'Wi-Fi Router',
          color: '#3b82f6',
        },
      ],
      selectedSourceId: 'source-1',
      camera: DEFAULT_CAMERA,
      settings: DEFAULT_VISUALIZATION,
      environment: DEFAULT_ENVIRONMENT,
      measurements: [],
    });
  });

  it('adds multiple sources, toggles activity, and clears them after confirmation', () => {
    render(<LabPage />);

    fireEvent.click(screen.getByRole('button', { name: /Add Source/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add Source/i }));

    expect(useLabStore.getState().sources).toHaveLength(3);
    expect(screen.getAllByText('Source 3')[0]).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Deactivate Source 2/i })).toBeInTheDocument();

    act(() => {
      useLabStore.getState().toggleSourceActive('source-2');
    });
    expect(useLabStore.getState().sources.find((source) => source.id === 'source-2')?.active).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /Clear All/i }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Clear All/i }));

    expect(useLabStore.getState().sources).toHaveLength(0);
    expect(screen.getByText(/No sources yet/i)).toBeInTheDocument();
  });
});
