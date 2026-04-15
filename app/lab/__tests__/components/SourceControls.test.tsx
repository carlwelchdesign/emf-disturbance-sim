import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SourceControls } from '../../components/ControlPanel/SourceControls';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('SourceControls', () => {
  const updateSource = jest.fn();
  const removeSource = jest.fn();
  const baseSource = {
    id: 'source-1',
    position: { x: 1, y: 2, z: 3 },
    frequency: 2.4e9,
    bandwidthHz: 80e6,
    power: 0.1,
    powerUnit: 'watts' as const,
    phase: 0,
    antennaType: 'omnidirectional' as const,
    gain: 1,
    active: true,
    label: 'Test Source',
    faction: 'friendly' as const,
  };

  beforeEach(() => {
    (useLabStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        updateSource,
        removeSource,
      })
    );
    jest.clearAllMocks();
  });

  it('renders empty state for no selection', () => {
    render(<SourceControls selectionContext={{ mode: 'none', selectedSourceIds: [], primarySourceId: null }} selectedSources={[]} />);
    expect(screen.getByText(/No source selected/i)).toBeInTheDocument();
  });

  it('renders single selection controls', () => {
    render(
      <SourceControls
        selectionContext={{ mode: 'single', selectedSourceIds: ['source-1'], primarySourceId: 'source-1' }}
        selectedSources={[baseSource]}
      />
    );
    expect(screen.getByText('Test Source')).toBeInTheDocument();
    expect(screen.getByLabelText(/Center Frequency numeric input/i)).toBeInTheDocument();
  });

  it('keeps advanced controls collapsed by default', () => {
    render(
      <SourceControls
        selectionContext={{ mode: 'single', selectedSourceIds: ['source-1'], primarySourceId: 'source-1' }}
        selectedSources={[baseSource]}
      />
    );
    expect(screen.queryByLabelText(/Bandwidth/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Show advanced controls/i }));
    expect(screen.getByLabelText(/Bandwidth/i)).toBeInTheDocument();
  });

  it('shows mixed state and disables non-shared controls in multi-select', () => {
    render(
      <SourceControls
        selectionContext={{ mode: 'multi', selectedSourceIds: ['source-1', 'source-2'], primarySourceId: 'source-1' }}
        selectedSources={[baseSource, { ...baseSource, id: 'source-2', frequency: 5e9, position: { x: 0, y: 0, z: 0 } }]}
      />
    );
    expect(screen.getByText(/mixed/i)).toBeInTheDocument();
    expect(screen.getByLabelText('X')).toBeDisabled();
  });
});
