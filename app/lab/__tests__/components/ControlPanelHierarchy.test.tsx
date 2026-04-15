import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ControlPanel } from '../../components/ControlPanel/ControlPanel';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('ControlPanel hierarchy', () => {
  const baseState = {
    getSelectionContext: jest.fn(() => ({ mode: 'none', selectedSourceIds: [], primarySourceId: null })),
    getSelectedSources: jest.fn(() => []),
    resetCamera: jest.fn(),
    addSource: jest.fn(),
    clearAllSources: jest.fn(),
    sources: [],
    sectionDisclosure: {
      'simulation-setup': true,
      'active-entities': true,
      'selected-entity': true,
      'visualization-controls': true,
      'analysis-measurements': true,
      'system-view': true,
    },
    toggleSectionExpanded: jest.fn(),
    settings: {
      colorScheme: 'thermal',
      showFPS: true,
      animateFields: true,
      animationSpeed: 1,
      solverProfile: 'balanced',
      themeMode: 'dark',
      showThreatMetrics: false,
      showEmitterInteractions: false,
      showFieldChart: false,
      showFlightPaths: false,
      showGrid: true,
      lod: 'high',
    },
    updateSettings: jest.fn(),
    setSolverProfile: jest.fn(),
    environment: { showBoundary: true },
    updateEnvironment: jest.fn(),
    setLOD: jest.fn(),
    addMeasurement: jest.fn(),
    measurements: [],
    activeScenarioPresetId: null,
    scenarioIsDirty: false,
    applyScenarioPreset: jest.fn(),
    performance: { currentFPS: 60 },
  };

  beforeEach(() => {
    (useLabStore as unknown as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) => selector(baseState));
  });

  it('renders fixed section order and heading semantics', () => {
    render(<ControlPanel />);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Simulation Setup',
      'Active Entities',
      'Selected Entity',
      'Visualization Controls',
      'Analysis / Measurements',
      'System / View',
    ]);
  });

  it('keeps panel headers free of decorative noise', () => {
    render(<ControlPanel />);
    const panel = screen.getByTestId('section-panel-simulation-setup');
    expect(within(panel).queryByText(/✨|★|decorative/i)).not.toBeInTheDocument();
  });
});
