import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MeasurementPoint } from '../../components/Canvas3D/MeasurementPoint';

describe('MeasurementPoint', () => {
  it('renders a marker for near-field measurement', () => {
    const { container } = render(
      <MeasurementPoint
        measurement={{
          id: 'm-1',
          position: { x: 0, y: 1, z: 0 },
          fieldStrength: 1,
          powerDensity: 0.01,
          region: 'near-field',
          timestamp: Date.now(),
        }}
      />
    );

    expect(container.querySelector('mesh')).toBeInTheDocument();
    expect(screen.queryByText('Simplified Model')).toBeNull();
  });
});
