/**
 * Derived Electromagnetic Metrics
 * Computes Poynting vector magnitude and energy density from FDTD field outputs.
 * 
 * Physics:
 *   Poynting vector: S = E × H  (cross product; magnitude |S| = |E||H|sin(θ))
 *   Energy density:  u = ε₀|E|²/2 + μ₀|H|²/2
 */
import { FieldOutputSet, DerivedMetricResult, SnapshotMetric } from '../../../types/maxwell.types';
import { EPSILON_0, MU_0 } from './maxwell-constants';

/**
 * Compute RMS Poynting vector magnitude over all cells at each time step.
 * S_rms = sqrt(mean(|E × H|²))  over spatial domain at each t
 */
function computePoyntingMagnitudeSeries(fieldOutput: FieldOutputSet): SnapshotMetric[] {
  const { electricFieldSeries, magneticFieldSeries, timeAxis } = fieldOutput;
  return timeAxis.map((t, idx) => {
    const E = electricFieldSeries[idx];
    const H = magneticFieldSeries[idx];
    if (!E || !H) return { step: idx, time: t, value: 0 };

    const n = E.ex.length;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      // Cross product E × H magnitude squared:
      // |S|² = |Ey*Hz - Ez*Hy|² + |Ez*Hx - Ex*Hz|² + |Ex*Hy - Ey*Hx|²
      const sx = (E.ey[i] ?? 0) * (H.ez[i] ?? 0) - (E.ez[i] ?? 0) * (H.ey[i] ?? 0);
      const sy = (E.ez[i] ?? 0) * (H.ex[i] ?? 0) - (E.ex[i] ?? 0) * (H.ez[i] ?? 0);
      const sz = (E.ex[i] ?? 0) * (H.ey[i] ?? 0) - (E.ey[i] ?? 0) * (H.ex[i] ?? 0);
      sumSq += sx * sx + sy * sy + sz * sz;
    }
    const value = Math.sqrt(sumSq / Math.max(n, 1));
    return { step: idx, time: t, value };
  });
}

/**
 * Compute mean electromagnetic energy density over all cells at each time step.
 * u = ε₀|E|²/2 + μ₀|H|²/2 (in vacuum; scale by ε_r, μ_r for non-vacuum)
 */
function computeEnergyDensitySeries(fieldOutput: FieldOutputSet): SnapshotMetric[] {
  const { electricFieldSeries, magneticFieldSeries, timeAxis } = fieldOutput;
  return timeAxis.map((t, idx) => {
    const E = electricFieldSeries[idx];
    const H = magneticFieldSeries[idx];
    if (!E || !H) return { step: idx, time: t, value: 0 };

    const n = E.ex.length;
    let uSum = 0;
    for (let i = 0; i < n; i++) {
      const e2 = (E.ex[i] ?? 0) ** 2 + (E.ey[i] ?? 0) ** 2 + (E.ez[i] ?? 0) ** 2;
      const h2 = (H.ex[i] ?? 0) ** 2 + (H.ey[i] ?? 0) ** 2 + (H.ez[i] ?? 0) ** 2;
      uSum += (EPSILON_0 * e2) / 2 + (MU_0 * h2) / 2;
    }
    return { step: idx, time: t, value: uSum / Math.max(n, 1) };
  });
}

/**
 * Compute all derived metrics for a completed run.
 * Returns at minimum: poynting_magnitude and energy_density (FR-007).
 */
export function computeDerivedMetrics(
  runId: string,
  fieldOutput: FieldOutputSet,
): DerivedMetricResult[] {
  const poynting = computePoyntingMagnitudeSeries(fieldOutput);
  const energy = computeEnergyDensitySeries(fieldOutput);

  return [
    {
      runId,
      metricName: 'poynting_magnitude',
      definition: 'S = E × H — spatial RMS of the Poynting vector magnitude [W/m²]',
      units: 'W/m²',
      values: poynting,
      validityScope: 'all time steps where E and H data are available',
      sourceFieldDependencies: ['E', 'B'],
    },
    {
      runId,
      metricName: 'energy_density',
      definition: 'u = ε₀|E|²/2 + μ₀|H|²/2 — mean electromagnetic energy density [J/m³]',
      units: 'J/m³',
      values: energy,
      validityScope: 'all time steps where E and H data are available',
      sourceFieldDependencies: ['E', 'B'],
    },
  ];
}
