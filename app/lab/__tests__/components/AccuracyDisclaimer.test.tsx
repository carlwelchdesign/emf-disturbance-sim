import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccuracyDisclaimer } from '../../components/Analysis/AccuracyDisclaimer';

describe('AccuracyDisclaimer', () => {
  it('renders simplified model disclaimer', () => {
    render(<AccuracyDisclaimer />);

    expect(screen.getByText('Simplified Model')).toBeInTheDocument();
    expect(screen.getByText(/approximate/i)).toBeInTheDocument();
  });
});
