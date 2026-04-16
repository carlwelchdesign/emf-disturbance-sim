/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MaxwellRunContextPanel } from '../../../components/Analysis/MaxwellRunContextPanel';

jest.mock('../../../hooks/useLabStore', () => ({
  useLabStore: (selector: any) =>
    selector({
      maxwellRuns: [{ runId: 'run-1', status: 'completed_unvalidated' }],
      maxwellActiveRunId: 'run-1',
      setActiveMaxwellRun: jest.fn(),
      maxwellCurrentStep: 0,
      setMaxwellCurrentStep: jest.fn(),
      maxwellInterpretationSnapshots: {
        'run-1': {
          snapshotId: 'run-1-0',
          runId: 'run-1',
          timeStep: 0,
          strongestRegionLabel: 'Strongest near (0.00, 0.00, 0.00)',
          weakestRegionLabel: 'Weakest near (1.00, 0.00, 0.00)',
          overlapRegionPresence: true,
          consistencyToken: 'tok-abc',
          bandCoverageMetrics: { high: 1, medium: 2, low: 3 },
        },
      },
      maxwellInterferenceRenderStates: {
        'run-1': {
          runId: 'run-1',
          timeStep: 0,
          status: 'rendered',
          visiblePointCount: 6,
          bandDistribution: { high: 1, medium: 2, low: 3 },
          validationStatus: 'non_validated',
        },
      },
    }),
}));

jest.mock('../../../hooks/useMaxwellRunSelectors', () => ({
  useActiveFieldOutput: () => ({
    runId: 'run-1',
    timeAxis: [0, 1],
    electricFieldSeries: [],
    magneticFieldSeries: [],
    samplingMetadata: { grid: { nx: 1, ny: 1, nz: 1, dx: 1, dy: 1, dz: 1 }, units: 'V/m', coordinateSystem: 'cartesian' },
    validationStatus: 'non_validated',
  }),
  useActiveMetrics: () => [],
  useActiveValidationReport: () => undefined,
  useActiveRunId: () => 'run-1',
}));

describe('maxwell interpretation panel', () => {
  it('renders strongest and weakest interpretation labels', () => {
    render(<MaxwellRunContextPanel />);
    expect(screen.getByText(/Strongest near/i)).toBeInTheDocument();
    expect(screen.getByText(/Weakest near/i)).toBeInTheDocument();
  });
});
