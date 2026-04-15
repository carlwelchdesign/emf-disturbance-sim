import { useLabStore } from '../../hooks/useLabStore';

describe('useLabStore source management', () => {
  beforeEach(() => {
    useLabStore.getState().clearAllSources();
    useLabStore.getState().addSource();
  });

  it('removes a source and preserves selection consistency', () => {
    const added = useLabStore.getState().addSource();
    useLabStore.getState().selectSource(added);
    useLabStore.getState().removeSource(added);

    const state = useLabStore.getState();
    expect(state.sources.find((source) => source.id === added)).toBeUndefined();
    expect(state.selectedSourceId).toBeNull();
  });

  it('clears all sources and resets selection', () => {
    useLabStore.getState().addSource();
    useLabStore.getState().clearAllSources();

    const state = useLabStore.getState();
    expect(state.sources).toHaveLength(0);
    expect(state.selectedSourceId).toBeNull();
  });
});
