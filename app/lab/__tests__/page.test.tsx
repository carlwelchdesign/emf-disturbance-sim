import { render } from '@testing-library/react';
import LabPage from '../page';
import { useLabStore } from '../hooks/useLabStore';

const sourceMarkerMock = jest.fn(() => null);

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="welcome-dialog">{children}</div>,
    DialogActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogContentText: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

jest.mock('../hooks/useLabStore');
jest.mock('../hooks/useFPSMonitor', () => ({
  useFPSMonitor: jest.fn(),
}));
jest.mock('../components/Canvas3D/Canvas3D', () => ({
  Canvas3D: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}));
jest.mock('../components/Canvas3D/EnvironmentBoundary', () => ({
  EnvironmentBoundary: () => null,
}));
jest.mock('../components/Canvas3D/SourceMarker', () => ({
  SourceMarker: (props: unknown) => sourceMarkerMock(props),
}));
jest.mock('../components/Canvas3D/MeasurementPoint', () => ({
  MeasurementPoint: () => null,
}));
jest.mock('../components/Canvas3D/DroneMarker', () => ({
  DroneMarker: () => null,
}));
jest.mock('../components/Canvas3D/FlightPath', () => ({
  FlightPath: () => null,
}));
jest.mock('../components/Canvas3D/ContestZoneMarker', () => ({
  ContestZoneMarker: () => null,
}));
jest.mock('../components/Canvas3D/InterferenceField3D', () => ({
  InterferenceField3D: () => null,
}));
jest.mock('../components/Canvas3D/FieldVisualization', () => ({
  FieldVisualization: () => null,
}));
jest.mock('../components/ControlPanel/ControlPanel', () => ({
  ControlPanel: () => null,
}));
jest.mock('../components/Analysis/FieldStrengthOverlay', () => ({
  FieldStrengthOverlay: () => null,
}));
jest.mock('../components/Analysis/ThreatMetricsPanel', () => ({
  ThreatMetricsPanelContent: () => null,
}));
jest.mock('../components/Analysis/EmitterInteractionsPanel', () => ({
  EmitterInteractionsPanelContent: () => null,
}));
jest.mock('../components/Analysis/FieldSamplesChart', () => ({
  FieldSamplesChart: () => null,
}));
jest.mock('../components/Analysis/DerivedMetricsPanel', () => ({
  DerivedMetricsPanel: () => null,
}));
jest.mock('../components/Analysis/MaxwellRunContextPanel', () => ({
  MaxwellRunContextPanel: () => null,
}));
jest.mock('../components/ControlPanel/MaxwellRunControls', () => ({
  MaxwellRunControlsContent: () => null,
}));
jest.mock('../components/shared/PerformanceWarning', () => ({
  PerformanceWarning: () => null,
}));
jest.mock('../components/shared/WebGLErrorBoundary', () => ({
  WebGLErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LabPage source marker highlighting', () => {
  beforeEach(() => {
    sourceMarkerMock.mockClear();
    (useLabStore as unknown as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) =>
      selector({
        sources: [
          {
            id: 's1',
            position: { x: 0, y: 1.5, z: 0 },
            frequency: 2.4e9,
            power: 0.1,
            powerUnit: 'watts',
            phase: 0,
            antennaType: 'omnidirectional',
            active: true,
            label: 'Source 1',
            faction: 'friendly',
            gain: 1,
          },
          {
            id: 's2',
            position: { x: 2, y: 1.5, z: 0 },
            frequency: 5e9,
            power: 0.2,
            powerUnit: 'watts',
            phase: 0.4,
            antennaType: 'omnidirectional',
            active: true,
            label: 'Source 2',
            faction: 'hostile',
            gain: 1,
          },
        ],
        selectionContext: {
          mode: 'multi',
          selectedSourceIds: ['s2'],
          primarySourceId: 's1',
        },
        selectSource: jest.fn(),
        settings: {
          lod: 'low',
          colorScheme: 'thermal',
          showFlightPaths: false,
        },
        camera: undefined,
        measurements: [],
        drones: [],
        maxwellActiveRunId: null,
      })
    );
  });

  it('highlights markers whose source is checked in the inventory', () => {
    render(<LabPage />);

    expect(sourceMarkerMock).toHaveBeenCalledTimes(2);
    expect(sourceMarkerMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        source: expect.objectContaining({ id: 's1' }),
        isSelected: false,
      })
    );
    expect(sourceMarkerMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        source: expect.objectContaining({ id: 's2' }),
        isSelected: true,
      })
    );
  });
});