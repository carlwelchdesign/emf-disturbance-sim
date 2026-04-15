import { useLabStore } from '../../hooks/useLabStore';

describe('useLabStore source and selection state', () => {
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
    expect(state.selectedSourceId).not.toBe(added);
  });

  it('clears all sources and resets selection context', () => {
    useLabStore.getState().addSource();
    useLabStore.getState().clearAllSources();

    const state = useLabStore.getState();
    expect(state.sources).toHaveLength(0);
    expect(state.selectionContext).toEqual({
      mode: 'none',
      selectedSourceIds: [],
      primarySourceId: null,
    });
  });

  it('caps measurement points at five in V1', () => {
    const store = useLabStore.getState();
    const source = store.sources[0];

    for (let index = 0; index < 6; index += 1) {
      store.addMeasurement({
        position: { x: source.position.x + index, y: source.position.y, z: source.position.z },
        fieldStrength: 1 + index,
        powerDensity: 0.001 + index * 0.001,
        region: 'far-field',
        label: `M${index + 1}`,
      });
    }

    expect(useLabStore.getState().measurements).toHaveLength(5);
  });

  it('applies a scenario preset and keeps single primary selection', () => {
    const store = useLabStore.getState();
    store.updateSource(store.sources[0].id, { frequency: 5e9 });
    store.applyScenarioPreset('dual-source-interference');

    const nextState = useLabStore.getState();
    expect(nextState.activeScenarioPresetId).toBe('dual-source-interference');
    expect(nextState.sources).toHaveLength(2);
    expect(nextState.selectionContext.mode).toBe('single');
    expect(nextState.selectionContext.selectedSourceIds).toEqual([nextState.sources[0].id]);
  });

  it('supports multi-select transitions and mixed context', () => {
    const first = useLabStore.getState().sources[0];
    const secondId = useLabStore.getState().addSource({ frequency: 5e9 });

    useLabStore.getState().selectSource(first.id);
    useLabStore.getState().toggleSourceSelection(secondId);

    let state = useLabStore.getState();
    expect(state.selectionContext.mode).toBe('multi');
    expect(state.selectionContext.selectedSourceIds).toHaveLength(2);
    expect(state.getSelectedSources()).toHaveLength(2);

    useLabStore.getState().clearSelection();
    state = useLabStore.getState();
    expect(state.selectionContext.mode).toBe('none');
    expect(state.selectionContext.selectedSourceIds).toHaveLength(0);
  });

  it('tracks section disclosure state', () => {
    const store = useLabStore.getState();
    expect(store.sectionDisclosure['selected-entity']).toBe(true);

    store.setSectionExpanded('selected-entity', false);
    expect(useLabStore.getState().sectionDisclosure['selected-entity']).toBe(false);

    store.toggleSectionExpanded('selected-entity');
    expect(useLabStore.getState().sectionDisclosure['selected-entity']).toBe(true);
  });

  it('preserves solver profile when applying a preset', () => {
    const store = useLabStore.getState();
    store.setSolverProfile('scientific');
    store.applyScenarioPreset('dual-source-interference');
    expect(useLabStore.getState().settings.solverProfile).toBe('scientific');
  });

  it('ignores invalid settings updates and supports recovery', () => {
    const store = useLabStore.getState();
    const before = store.settings.themeMode;
    store.updateSettings({ themeMode: 'invalid-theme' as never });
    expect(useLabStore.getState().settings.themeMode).toBe(before);

    store.updateSettings({ themeMode: 'light' });
    expect(useLabStore.getState().settings.themeMode).toBe('light');
  });
});
