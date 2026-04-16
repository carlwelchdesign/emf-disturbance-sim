/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react';
import { MaxwellFieldVolume } from '../../../components/Canvas3D/MaxwellFieldVolume';

jest.mock('../../../hooks/useLabStore', () => ({
  useLabStore: (selector: any) =>
    selector({
      maxwellCurrentStep: 0,
      maxwellActiveRunId: 'run-1',
      environment: { bounds: { min: { x: -1, y: -1, z: -1 }, max: { x: 1, y: 1, z: 1 } } },
      sources: [{ id: 's1', active: true, position: { x: 0, y: 0, z: 0 }, power: 1, phase: 0 }],
      settings: { interferenceProfile: 'balanced' },
      setMaxwellInterferenceRenderState: jest.fn(),
      setMaxwellInterpretationSnapshot: jest.fn(),
    }),
}));

jest.mock('../../../hooks/useMaxwellRunSelectors', () => ({
  useActiveFieldOutput: () => ({
    runId: 'run-1',
    timeAxis: [0],
    electricFieldSeries: [{ step: 0, time: 0, ex: [1, 0.2, 0.1], ey: [0, 0, 0], ez: [0, 0, 0] }],
    magneticFieldSeries: [{ step: 0, time: 0, ex: [0, 0, 0], ey: [0, 0, 0], ez: [0, 0, 0] }],
    samplingMetadata: { grid: { nx: 3, ny: 1, nz: 1, dx: 1, dy: 1, dz: 1 }, units: 'V/m', coordinateSystem: 'cartesian' },
    validationStatus: 'non_validated',
  }),
}));

describe('maxwell point cloud rendering', () => {
  it('remains hidden in non-maxwell scope', () => {
    const { container } = render(<MaxwellFieldVolume />);
    expect(container.firstChild).toBeNull();
  });

  it('stays hidden across repeated renders', () => {
    const first = render(<MaxwellFieldVolume />);
    const second = render(<MaxwellFieldVolume />);
    expect(first.container.firstChild).toBeNull();
    expect(second.container.firstChild).toBeNull();
  });
});
