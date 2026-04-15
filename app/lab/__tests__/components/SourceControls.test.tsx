import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SourceControls } from '../../components/ControlPanel/SourceControls';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('SourceControls', () => {
  beforeEach(() => {
    (useLabStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        updateSource: jest.fn(),
        removeSource: jest.fn(),
      })
    );
  });

  it('renders parameter controls for a selected source', () => {
    render(
        <SourceControls
        source={{
          id: 'source-1',
          position: { x: 1, y: 2, z: 3 },
          frequency: 2.4e9,
          bandwidthHz: 80e6,
          power: 0.1,
          powerUnit: 'watts',
          phase: 0,
          antennaType: 'omnidirectional',
          gain: 1,
          active: true,
          label: 'Test Source',
        }}
      />
    );

    expect(screen.getByText('Test Source')).toBeInTheDocument();
    expect(screen.getByLabelText('X')).toBeInTheDocument();
    expect(screen.getByLabelText('Bandwidth')).toBeInTheDocument();
    expect(screen.getByText('Remove Source')).toBeInTheDocument();
  });

  it('renders empty state when no source selected', () => {
    render(<SourceControls source={undefined} />);

    expect(screen.getByText(/No source selected/i)).toBeInTheDocument();
  });
});
