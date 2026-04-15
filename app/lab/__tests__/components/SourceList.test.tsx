import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SourceList } from '../../components/ControlPanel/SourceList';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('SourceList', () => {
  const toggleSourceSelection = jest.fn();
  const setPrimarySelection = jest.fn();
  const baseState = {
    sources: [
      {
        id: 's1',
        label: 'Source 1',
        active: true,
        color: '#fff',
        frequency: 2.4e9,
        power: 0.1,
      },
      {
        id: 's2',
        label: 'Source 2',
        active: true,
        color: '#fff',
        frequency: 5e9,
        power: 0.2,
      },
    ],
    selectedSourceId: 's1',
    selectionContext: {
      mode: 'single',
      selectedSourceIds: ['s1'],
      primarySourceId: 's1',
    },
    toggleSourceSelection,
    setPrimarySelection,
    removeSource: jest.fn(),
    toggleSourceActive: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLabStore as unknown as jest.Mock).mockImplementation((selector: (state: typeof baseState) => unknown) => selector(baseState));
  });

  it('switches source selection without latency-producing indirection', () => {
    render(<SourceList />);
    fireEvent.click(screen.getByRole('button', { name: /delete source 2/i }).closest('li')?.querySelector('[role="button"]') as Element);
    expect(setPrimarySelection).toHaveBeenCalledWith('s2');
  });
});
