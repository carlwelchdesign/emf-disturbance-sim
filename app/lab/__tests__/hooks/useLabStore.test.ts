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

  it('applies a scenario preset and resets dirty state', () => {
    const store = useLabStore.getState();
    store.updateSource(store.sources[0].id, { frequency: 5e9 });

    expect(useLabStore.getState().scenarioIsDirty).toBe(true);

    store.applyScenarioPreset('dual-source-interference');

    const nextState = useLabStore.getState();
    expect(nextState.scenarioIsDirty).toBe(false);
    expect(nextState.activeScenarioPresetId).toBe('dual-source-interference');
    expect(nextState.sources).toHaveLength(2);
    expect(nextState.selectedSourceId).toBe(nextState.sources[0]?.id ?? null);
  });

  it('preserves the solver profile when applying a preset', () => {
    const store = useLabStore.getState();
    store.setSolverProfile('scientific');

    store.applyScenarioPreset('dual-source-interference');

    expect(useLabStore.getState().settings.solverProfile).toBe('scientific');
  });
});
