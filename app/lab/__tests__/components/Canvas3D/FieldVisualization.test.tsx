import { render } from '@testing-library/react';
import { FieldVisualization } from '../../../components/Canvas3D/FieldVisualization';

describe('FieldVisualization', () => {
  it('returns null when there are no active sources', () => {
    const { container } = render(<FieldVisualization sources={[]} lod="high" colorScheme="thermal" />);

    expect(container.firstChild).toBeNull();
  });
});
