import {
  classifyInterferenceBand,
  computeInterpretationSummary,
  normalizeFieldMagnitude,
  smoothBandTransition,
} from '../../modules/maxwell/core/interference-encoding';
import { PointCloudRenderState } from '../../types/maxwell.types';

describe('maxwell interference encoding', () => {
  it('normalizes magnitudes deterministically', () => {
    expect(normalizeFieldMagnitude(0, 10)).toBe(0);
    expect(normalizeFieldMagnitude(10, 10)).toBe(1);
    expect(normalizeFieldMagnitude(1, 10)).toBeCloseTo(normalizeFieldMagnitude(1, 10), 10);
  });

  it('classifies high/medium/low bands correctly', () => {
    expect(classifyInterferenceBand(0.9)).toBe('high');
    expect(classifyInterferenceBand(0.5)).toBe('medium');
    expect(classifyInterferenceBand(0.1)).toBe('low');
  });

  it('enforces monotonic band assignment ordering', () => {
    const values = [0.1, 0.4, 0.8];
    const bands = values.map((value) => classifyInterferenceBand(value));
    expect(bands).toEqual(['low', 'medium', 'high']);
  });

  it('applies smoothing guardrails near thresholds', () => {
    expect(smoothBandTransition('high', 'medium', 0.6)).toBe('high');
    expect(smoothBandTransition('low', 'medium', 0.35)).toBe('low');
    expect(smoothBandTransition('medium', 'high', 0.8)).toBe('high');
  });

  it('produces deterministic interpretation summaries', () => {
    const renderState: PointCloudRenderState = {
      runId: 'run-1',
      timeStep: 2,
      status: 'rendered',
      visiblePointCount: 3,
      bandDistribution: { high: 1, medium: 1, low: 1 },
      validationStatus: 'non_validated',
    };
    const samples = [
      { sampleId: 'a', position: { x: 0, y: 0, z: 0 }, timeStep: 2, electricMagnitude: 5, magneticMagnitude: 1, compositeInterferenceScore: 0.9 },
      { sampleId: 'b', position: { x: 1, y: 1, z: 1 }, timeStep: 2, electricMagnitude: 3, magneticMagnitude: 1, compositeInterferenceScore: 0.5 },
      { sampleId: 'c', position: { x: -1, y: 0.5, z: 2 }, timeStep: 2, electricMagnitude: 1, magneticMagnitude: 1, compositeInterferenceScore: 0.1 },
    ];
    const s1 = computeInterpretationSummary(renderState, samples);
    const s2 = computeInterpretationSummary(renderState, samples);
    expect(s1.consistencyToken).toBe(s2.consistencyToken);
    expect(s1.strongestRegionLabel).toContain('Strongest');
    expect(s1.weakestRegionLabel).toContain('Weakest');
  });
});
