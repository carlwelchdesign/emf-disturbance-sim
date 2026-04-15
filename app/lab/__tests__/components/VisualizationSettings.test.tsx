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
          showFPS: false,
          animateFields: true,
          animationSpeed: 1,
          solverProfile: 'balanced',
          themeMode: 'dark',
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
});
