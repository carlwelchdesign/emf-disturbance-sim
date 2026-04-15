import { render, screen, fireEvent } from '@testing-library/react';
import { MeasurementTools } from '../../app/lab/components/ControlPanel/MeasurementTools';
import { useLabStore } from '../../app/lab/hooks/useLabStore';

describe('measurement tools integration', () => {
  beforeEach(() => {
    useLabStore.setState({
      ...useLabStore.getState(),
      sources: [
        {
          id: 'source-1',
          position: { x: 0, y: 0, z: 0 },
          frequency: 2.4e9,
          power: 0.1,
          powerUnit: 'watts',
          phase: 0,
          antennaType: 'omnidirectional',
          gain: 1,
          active: true,
        },
      ],
    });
  });

  it('adds a measurement point', () => {
    render(<MeasurementTools />);
    fireEvent.click(screen.getByText('Add Measurement Point'));
    expect(useLabStore.getState().measurements).toHaveLength(1);
  });
});
