import {
  SMOOTHNESS_THRESHOLDS,
  calculatePercentile,
  evaluateSmoothnessWindow,
  fieldStrengthToColor,
  frequencyToDisplayColor,
  getNonColorInteractionCue,
  getSourceColor,
} from '../../lib/visualization-helpers';

describe('visualization helpers', () => {
  it('maps thermal colors', () => {
    expect(fieldStrengthToColor(0.1, 1, 'thermal')).toMatch(/^rgb/);
  });

  it('maps rainbow colors', () => {
    expect(fieldStrengthToColor(0.5, 1, 'rainbow')).toMatch(/^hsl/);
  });

  it('maps monochrome colors', () => {
    expect(fieldStrengthToColor(0.5, 1, 'monochrome')).toMatch(/^rgb/);
  });

  it('returns a source palette color', () => {
    expect(getSourceColor(0)).toMatch(/^#/);
  });

  it('maps frequency to a display color', () => {
    expect(frequencyToDisplayColor(2.4e9)).toMatch(/^hsl/);
    expect(frequencyToDisplayColor(28e9)).toMatch(/^hsl/);
  });

  it('evaluates smoothness windows against configured thresholds', () => {
    const now = 10_000;
    const result = evaluateSmoothnessWindow(
      [
        {
          timestamp: now - 1000,
          frameDurationMs: 16,
          animationActive: true,
          interactionType: 'none',
          sceneMode: 'non-maxwell',
          maxwellVisible: false,
        },
        {
          timestamp: now - 500,
          frameDurationMs: 18,
          animationActive: true,
          interactionType: 'none',
          sceneMode: 'non-maxwell',
          maxwellVisible: false,
        },
      ],
      [
        {
          eventId: 'e1',
          timestamp: now - 700,
          interactionType: 'rotate',
          responseLatencyMs: 40,
          jankFlag: false,
        },
        {
          eventId: 'e2',
          timestamp: now - 300,
          interactionType: 'pan',
          responseLatencyMs: 50,
          jankFlag: false,
        },
      ],
      now
    );

    expect(result.interactionSmoothPercent).toBe(100);
    expect(result.animationSmoothPercent).toBe(100);
    expect(result.meetsThreshold).toBe(true);
  });

  it('flags severe lag incidents in the smoothness window', () => {
    const now = 5_000;
    const result = evaluateSmoothnessWindow(
      [
        {
          timestamp: now - 100,
          frameDurationMs: 50,
          animationActive: true,
          interactionType: 'none',
          sceneMode: 'non-maxwell',
          maxwellVisible: false,
        },
      ],
      [
        {
          eventId: 'lag',
          timestamp: now - 100,
          interactionType: 'zoom',
          responseLatencyMs: SMOOTHNESS_THRESHOLDS.severeLagLatencyMs + 1,
          jankFlag: true,
        },
      ],
      now
    );

    expect(result.severeLagIncidents).toBe(1);
    expect(result.meetsThreshold).toBe(false);
  });

  it('computes percentile values for latency checks', () => {
    expect(calculatePercentile([10, 20, 30, 40, 50], 95)).toBe(50);
    expect(calculatePercentile([], 95)).toBe(0);
  });

  it('provides non-color interaction cues for accessibility', () => {
    expect(getNonColorInteractionCue(0.7, 0.1, 0.1)).toBe('↑');
    expect(getNonColorInteractionCue(0.2, 0.7, 0.1)).toBe('↓');
    expect(getNonColorInteractionCue(0.3, 0.3, 0.8)).toBe('↔');
    expect(getNonColorInteractionCue(0.1, 0.1, 0.1)).toBe('·');
  });
});
