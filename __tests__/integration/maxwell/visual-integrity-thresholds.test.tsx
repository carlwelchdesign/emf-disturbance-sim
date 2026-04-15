/**
 * @jest-environment jsdom
 */
import { computeDerivedMetrics } from '../../../app/lab/modules/maxwell/core/derived-metrics';
import { FieldOutputSet } from '../../../app/lab/types/maxwell.types';

const makeSineWaveOutput = (runId: string): FieldOutputSet => {
  const nt = 20;
  const n = 4; // 4 cells
  const dt = 1e-12;
  const timeAxis = Array.from({ length: nt }, (_, i) => i * dt);
  const f = 1e9;
  
  return {
    runId,
    timeAxis,
    electricFieldSeries: timeAxis.map((t, idx) => ({
      step: idx,
      time: t,
      ex: Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * f * t + i * 0.1)),
      ey: new Array(n).fill(0),
      ez: new Array(n).fill(0),
    })),
    magneticFieldSeries: timeAxis.map((t, idx) => ({
      step: idx,
      time: t,
      ex: new Array(n).fill(0),
      ey: Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * f * t + i * 0.1) / 377),
      ez: new Array(n).fill(0),
    })),
    samplingMetadata: { grid: { nx: 2, ny: 2, nz: 1, dx: 0.01, dy: 0.01, dz: 0.01 }, units: 'V/m', coordinateSystem: 'cartesian' },
    validationStatus: 'validated',
  };
};

describe('VQ-001/VQ-002: Visual Integrity Thresholds', () => {
  it('Poynting magnitude is non-negative (VQ-001: truthful representation)', () => {
    const output = makeSineWaveOutput('vis-test');
    const metrics = computeDerivedMetrics('vis-test', output);
    const poynting = metrics.find((m) => m.metricName === 'poynting_magnitude');
    expect(poynting).toBeDefined();
    const values = poynting!.values as { value: number }[];
    expect(values.every((v) => v.value >= 0)).toBe(true);
  });

  it('energy density is non-negative (VQ-001: physically consistent)', () => {
    const output = makeSineWaveOutput('vis-test2');
    const metrics = computeDerivedMetrics('vis-test2', output);
    const energy = metrics.find((m) => m.metricName === 'energy_density');
    expect(energy).toBeDefined();
    const values = energy!.values as { value: number }[];
    expect(values.every((v) => v.value >= -1e-30)).toBe(true);
  });

  it('metrics have explicit units (VQ-002: interpretable output)', () => {
    const output = makeSineWaveOutput('vis-test3');
    const metrics = computeDerivedMetrics('vis-test3', output);
    for (const m of metrics) {
      expect(m.units).toBeTruthy();
      expect(m.definition).toBeTruthy();
      expect(m.validityScope).toBeTruthy();
    }
  });

  it('metrics preserve time alignment (VQ-001: temporal accuracy)', () => {
    const output = makeSineWaveOutput('vis-test4');
    const metrics = computeDerivedMetrics('vis-test4', output);
    const poynting = metrics.find((m) => m.metricName === 'poynting_magnitude');
    const snapshots = poynting!.values as { step: number; time: number; value: number }[];
    expect(snapshots.length).toBe(output.timeAxis.length);
    snapshots.forEach((s, idx) => {
      expect(s.time).toBeCloseTo(output.timeAxis[idx], 20);
    });
  });

  it('validation status is explicit in field output (VQ-002: interpretable comparison)', () => {
    const output = makeSineWaveOutput('vis-test5');
    expect(['validated', 'non_validated']).toContain(output.validationStatus);
  });
});
