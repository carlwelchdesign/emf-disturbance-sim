import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ControlPanel } from '../../components/ControlPanel/ControlPanel';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('Analysis/measurement section isolation', () => {
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
      showGrid: true,
      lod: 'high',
    },
    updateSettings: jest.fn(),
    updateEnvironment: jest.fn(),
    setSolverProfile: jest.fn(),
    environment: { showBoundary: true },
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

  it('renders analysis and measurements under dedicated section', () => {
    render(<ControlPanel />);
    expect(screen.getByText('Analysis / Measurements')).toBeInTheDocument();
    expect(screen.getByText(/Add Measurement Point/i)).toBeInTheDocument();
  });
});
