import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ControlPanel } from '../../components/ControlPanel/ControlPanel';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('ControlPanel global vs local separation', () => {
  const updateSettings = jest.fn();
  const updateEnvironment = jest.fn();
  const updateSource = jest.fn();
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
    updateSettings,
    setSolverProfile: jest.fn(),
    environment: { showBoundary: true },
    updateEnvironment,
    setLOD: jest.fn(),
    addMeasurement: jest.fn(),
    measurements: [],
    activeScenarioPresetId: null,
    scenarioIsDirty: false,
    applyScenarioPreset: jest.fn(),
    performance: { currentFPS: 60 },
    updateSource,
    removeSource: jest.fn(),
  };

  beforeEach(() => {
    (useLabStore as unknown as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) => selector(baseState));
  });

  it('keeps selected entity in empty instructional state when no selection', () => {
    render(<ControlPanel />);
    expect(screen.getByText(/No source selected/i)).toBeInTheDocument();
  });
});
