/**
 * Field Output Packing — creates time-indexed FieldOutputSet from FDTD snapshots.
 */
import {
  FieldOutputSet,
  FieldTensor,
  GridSpec,
  InterferenceBandLabel,
  MaxwellFieldSample,
  PointCloudEncodingProfile,
  PointCloudRenderState,
} from '../../../types/maxwell.types';
import {
  classifyInterferenceBand,
  inferMaxMagnitude,
  normalizeFieldMagnitude,
  sampleIndexToPosition,
} from './interference-encoding';
import { encodeLuminanceWeight, encodePointSize, encodeVisibilityAlpha, shouldRenderSample } from './interference-cues';

export function buildFieldOutput(
  runId: string,
  timeAxis: number[],
  electricSnapshots: { step: number; time: number; ex: number[]; ey: number[]; ez: number[] }[],
  magneticSnapshots: { step: number; time: number; ex: number[]; ey: number[]; ez: number[] }[],
  nx: number, ny: number, nz: number,
  dx: number, dy: number, dz: number,
): FieldOutputSet {
  const grid: GridSpec = { nx, ny, nz, dx, dy, dz };

  const electricFieldSeries: FieldTensor[] = electricSnapshots.map((s) => ({
    step: s.step,
    time: s.time,
    ex: s.ex,
    ey: s.ey,
    ez: s.ez,
  }));

  const magneticFieldSeries: FieldTensor[] = magneticSnapshots.map((s) => ({
    step: s.step,
    time: s.time,
    ex: s.ex,
    ey: s.ey,
    ez: s.ez,
  }));

  return {
    runId,
    timeAxis,
    electricFieldSeries,
    magneticFieldSeries,
    samplingMetadata: {
      grid,
      units: 'V/m',
      coordinateSystem: 'cartesian',
    },
    validationStatus: 'non_validated',
  };
}

export function buildInterferencePointCloudPayload(
  fieldOutput: FieldOutputSet,
  timeStep: number,
  bounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } },
  profile: PointCloudEncodingProfile
): {
  samples: Array<MaxwellFieldSample & {
    normalizedIntensity: number;
    band: InterferenceBandLabel;
    pointSize: number;
    luminanceWeight: number;
    visibilityAlpha: number;
  }>;
  renderState: PointCloudRenderState;
} {
  const step = Math.min(timeStep, Math.max(0, fieldOutput.electricFieldSeries.length - 1));
  const eSnap = fieldOutput.electricFieldSeries[step];
  const bSnap = fieldOutput.magneticFieldSeries[step];
  const ex = eSnap?.ex as number[] | undefined;
  const ey = eSnap?.ey as number[] | undefined;
  const ez = eSnap?.ez as number[] | undefined;
  const bx = (bSnap?.ex as number[] | undefined) ?? [];
  const by = (bSnap?.ey as number[] | undefined) ?? [];
  const bz = (bSnap?.ez as number[] | undefined) ?? [];

  if (!ex || !ey || !ez) {
    return {
      samples: [],
      renderState: {
        runId: fieldOutput.runId,
        timeStep: step,
        status: 'error',
        visiblePointCount: 0,
        bandDistribution: { high: 0, medium: 0, low: 0 },
        validationStatus: fieldOutput.validationStatus,
      },
    };
  }

  const maxMagnitude = inferMaxMagnitude(fieldOutput, step);
  const bandDistribution = { high: 0, medium: 0, low: 0 };
  const samples: Array<MaxwellFieldSample & {
    normalizedIntensity: number;
    band: InterferenceBandLabel;
    pointSize: number;
    luminanceWeight: number;
    visibilityAlpha: number;
  }> = [];

  for (let i = 0; i < ex.length; i += 1) {
    const electricMagnitude = Math.sqrt(ex[i] ** 2 + ey[i] ** 2 + ez[i] ** 2);
    const magneticMagnitude = Math.sqrt((bx[i] ?? 0) ** 2 + (by[i] ?? 0) ** 2 + (bz[i] ?? 0) ** 2);
    const normalizedIntensity = normalizeFieldMagnitude(electricMagnitude, maxMagnitude);
    const band = classifyInterferenceBand(normalizedIntensity);

    if (!shouldRenderSample(normalizedIntensity, i, profile)) {
      continue;
    }

    bandDistribution[band] += 1;
    samples.push({
      sampleId: `${fieldOutput.runId}-${step}-${i}`,
      position: sampleIndexToPosition(i, fieldOutput.samplingMetadata.grid, bounds),
      timeStep: step,
      electricMagnitude,
      magneticMagnitude,
      compositeInterferenceScore: normalizedIntensity,
      normalizedIntensity,
      band,
      pointSize: encodePointSize(band, profile),
      luminanceWeight: encodeLuminanceWeight(band, profile),
      visibilityAlpha: encodeVisibilityAlpha(normalizedIntensity),
    });
  }

  return {
    samples,
    renderState: {
      runId: fieldOutput.runId,
      timeStep: step,
      status: 'rendered',
      visiblePointCount: samples.length,
      bandDistribution,
      validationStatus: fieldOutput.validationStatus,
      isDegraded: samples.length < ex.length * 0.25,
      degradeReason: samples.length < ex.length * 0.25 ? 'density-throttle' : undefined,
    },
  };
}
