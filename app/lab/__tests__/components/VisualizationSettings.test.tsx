import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VisualizationSettings } from '../../components/ControlPanel/VisualizationSettings';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('VisualizationSettings', () => {
  const updateSettings = jest.fn();

  beforeEach(() => {
    (useLabStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        settings: {
          colorScheme: 'thermal',
          animateFields: true,
          animationSpeed: 1,
          solverProfile: 'balanced',
          interferenceProfile: 'balanced',
          themeMode: 'dark',
          showThreatMetrics: false,
          showEmitterInteractions: false,
          showFieldChart: false,
          showFlightPaths: false,
          performanceSignal: {
            active: false,
            message: 'Performance stable',
          },
        },
        updateSettings,
        setSolverProfile: jest.fn(),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('toggles the theme mode setting', () => {
    render(<VisualizationSettings />);

    fireEvent.click(screen.getByRole('switch', { name: /dark theme/i }));

    expect(updateSettings).toHaveBeenCalledWith({ themeMode: 'light' });
  });

  it('toggles the animation setting', () => {
    render(<VisualizationSettings />);

    fireEvent.click(screen.getByRole('switch', { name: /animate fields/i }));

    expect(updateSettings).toHaveBeenCalledWith({ animateFields: false });
  });

  it('renders the animation speed slider', () => {
    render(<VisualizationSettings />);

    expect(screen.getByRole('slider', { name: /animation speed/i })).toBeInTheDocument();
  });

  it('renders the field fidelity selector', () => {
    render(<VisualizationSettings />);

    expect(screen.getByLabelText(/field fidelity/i)).toBeInTheDocument();
  });

  it('renders the interference profile selector', () => {
    render(<VisualizationSettings />);
    expect(screen.getByLabelText(/interference profile/i)).toBeInTheDocument();
  });

  it('keeps visualization controls scoped to global settings', () => {
    render(<VisualizationSettings />);

    expect(screen.queryByText(/selected entity/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/remove source/i)).not.toBeInTheDocument();
  });

  it('shows Maxwell-hidden scope guidance for this feature', () => {
    render(<VisualizationSettings />);
    expect(screen.getByLabelText(/maxwell hidden scope message/i)).toBeInTheDocument();
  });

  it('shows degraded-state messaging when performance signal is active', () => {
    (useLabStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        settings: {
          colorScheme: 'thermal',
          animateFields: true,
          animationSpeed: 1,
          solverProfile: 'balanced',
          interferenceProfile: 'balanced',
          themeMode: 'dark',
          showThreatMetrics: false,
          showEmitterInteractions: false,
          showFieldChart: false,
          showFlightPaths: false,
          performanceSignal: {
            active: true,
            message: 'Performance degraded temporarily',
          },
        },
        updateSettings,
        setSolverProfile: jest.fn(),
      })
    );

    render(<VisualizationSettings />);
    expect(screen.getByLabelText(/performance degraded message/i)).toBeInTheDocument();
  });
});
